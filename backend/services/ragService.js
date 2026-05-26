const { getPineconeIndex } = require('../config/pinecone');
const axios = require('axios');
const { PDFParse } = require('pdf-parse');

const CHUNK_SIZE = 200;
const TOP_K_RESULTS = 15;          // Increased from 5 — fetch more, filter after
const TOP_K_VAULT = 25;            // Increased to get more vault items
const METADATA_TEXT_LIMIT = 500;
const SCORE_THRESHOLD = 0.3;       // For stats/course attendance
const VAULT_SCORE_THRESHOLD = 0;   // No threshold for vault items — return everything

const truncateForMetadata = (text) =>
  text.length > METADATA_TEXT_LIMIT ? text.slice(0, METADATA_TEXT_LIMIT) + '…' : text;

// ─────────────────────────────────────────────
// QUERY INTENT DETECTION
// Figures out what the user is asking about so
// we can use metadata filters instead of relying
// purely on vector similarity
// ─────────────────────────────────────────────
const detectQueryIntent = (query) => {
  const q = query.toLowerCase();

  const intent = {
    isAttendance: false,  
    isStat: false,
    isVault: false,
    isDate: false,
    isSyllabus: false,
    courseKeywords: [],
  };

  // Attendance keywords
  if (/attend|bunk|skip|lecture|present|absent|percentage|%/.test(q)) {
    intent.isAttendance = true;
  }

  // Stats / test / coding keywords
  if (/test|score|result|codeduel|duel|pass|fail|attempt|solve/.test(q)) {
    intent.isStat = true;
  }

  // Date / schedule / circular keywords
  if (/date|when|schedule|deadline|circular|notice|event|time/.test(q)) {
    intent.isDate = true;
    intent.isVault = true;
  }

  // Syllabus / content keywords
  if (/syllabus|topic|chapter|unit|module|content|cover|teach/.test(q)) {
    intent.isSyllabus = true;
    intent.isVault = true;
  }

  // Generic vault / notes keywords
  if (/note|file|pdf|upload|vault|document|resource|link/.test(q)) {
    intent.isVault = true;
  }

  // Extract course name hints from the query
  // Add more as needed for your specific course names
  const courseMap = [
    { keywords: ['linux', 'devops', 'dsoops', 'dsoop'], label: 'linux' },
    { keywords: ['full stack', 'fullstack', 'full-stack', 'web', 'frontend', 'backend', 'react', 'node'], label: 'fullstack' },
    { keywords: ['dsa', 'data structure', 'algorithm', 'algo'], label: 'dsa' },
    { keywords: ['python', 'py'], label: 'python' },
    { keywords: ['java'], label: 'java' },
    { keywords: ['c++', 'cpp'], label: 'cpp' },
    { keywords: ['database', 'sql', 'dbms'], label: 'database' },
  ];

  for (const course of courseMap) {
    if (course.keywords.some((kw) => q.includes(kw))) {
      intent.courseKeywords.push(course.label);
    }
  }

  // If no specific intent matched, treat as vault search
  if (!intent.isAttendance && !intent.isStat && !intent.isDate && !intent.isSyllabus) {
    intent.isVault = true;
  }

  return intent;
};

// ─────────────────────────────────────────────
// IMPROVED EMBEDDING
// Still hash-based (free / no API needed) but
// much better than before — uses character n-grams
// + word-level hashing for better discrimination
// ─────────────────────────────────────────────
const getEmbedding = (text) => {
  const vector = new Float32Array(1024).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  const words = normalized.split(/\s+/).filter(Boolean);

  // Word-level hashing
  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi];
    let wHash = 5381;
    for (let i = 0; i < word.length; i++) {
      wHash = ((wHash << 5) + wHash) ^ word.charCodeAt(i);
      wHash = wHash & 0x7fffffff;
    }
    const idx = wHash % 1024;
    vector[idx] += 1.0;

    // Bigram (adjacent word pairs)
    if (wi + 1 < words.length) {
      const bigram = word + '_' + words[wi + 1];
      let bHash = 5381;
      for (let i = 0; i < bigram.length; i++) {
        bHash = ((bHash << 5) + bHash) ^ bigram.charCodeAt(i);
        bHash = bHash & 0x7fffffff;
      }
      vector[bHash % 1024] += 0.7;
    }

    // Character 3-grams inside the word
    for (let i = 0; i <= word.length - 3; i++) {
      const ngram = word.slice(i, i + 3);
      let nHash = 5381;
      for (let j = 0; j < ngram.length; j++) {
        nHash = ((nHash << 5) + nHash) ^ ngram.charCodeAt(j);
        nHash = nHash & 0x7fffffff;
      }
      vector[nHash % 1024] += 0.3;
    }
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < 1024; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm) || 1;
  const result = [];
  for (let i = 0; i < 1024; i++) result.push(vector[i] / norm);

  return result;
};

// ─────────────────────────────────────────────
// PDF EXTRACTION
// ─────────────────────────────────────────────
const extractPdfText = async (pdfUrl) => {
  try {
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const parser = new PDFParse({ data: buffer });
    await parser.load(buffer);
    const result = await parser.getText();
    const text = (result.text || '')
      .replace(/-- \d+ of \d+ --/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    console.log(`✓ Extracted ${text.length} chars from PDF`);
    return text;
  } catch (error) {
    console.error('Error extracting PDF:', error.message);
    return '';
  }
};

// ─────────────────────────────────────────────
// CHUNKING
// ─────────────────────────────────────────────
const chunkText = (text, size = CHUNK_SIZE) => {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];
  for (const word of words) {
    currentChunk.push(word);
    if (currentChunk.length >= size) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) chunks.push(currentChunk.join(' '));
  return chunks;
};

// ─────────────────────────────────────────────
// INDEX VAULT
// ─────────────────────────────────────────────
const indexUserVault = async (userId, vaultItems) => {
  try {
    const index = await getPineconeIndex();
    const records = [];

    if (!Array.isArray(vaultItems) || vaultItems.length === 0) {
      console.warn('No vault items to index');
      return 0;
    }

    for (const item of vaultItems) {
      if (!item || !item._id) { console.warn('Skipping invalid vault item'); continue; }

      let textContent = '';
      if (item.type === 'pdf' && item.fileData) {
        textContent = await extractPdfText(item.fileData);
      } else if (item.type === 'snippet') {
        textContent = item.preview || item.content || item.url || '';
      } else if (item.type === 'link') {
        textContent = item.url || item.preview || '';
      } else if (item.type === 'other' || item.type === 'note') {
        textContent = item.preview || item.description || item.content || '';
      }

      if (!textContent || textContent.trim().length === 0) {
        console.warn(`Skipping vault item ${item._id} - no text content`);
        continue;
      }

      console.log(`✓ Found ${textContent.length} chars for vault item ${item._id} (${item.title})`);
      const chunks = chunkText(textContent);

      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        const chunkId = `${userId}-${item._id}-chunk-${i}`;
        const vectorValues = getEmbedding(chunkContent);

        records.push({
          id: chunkId,
          values: vectorValues,
          metadata: {
            userId: userId.toString(),
            vaultItemId: item._id.toString(),
            itemType: item.type,
            itemTitle: String(item.title || 'Untitled'),
            // Store lowercase title for easier matching
            itemTitleLower: String(item.title || '').toLowerCase(),
            chunkIndex: i,
            text: truncateForMetadata(chunkContent),
            createdAt: new Date().toISOString(),
          },
        });
      }
    }

    if (!records.length) {
      console.warn(`No valid vectors for user ${userId}`);
      return 0;
    }

    console.log(`Upserting ${records.length} vault vectors for user ${userId}`);
    await index.upsert({ records });
    console.log(`✅ Indexed ${records.length} vault chunks`);
    return records.length;
  } catch (error) {
    console.error('Error indexing vault:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// INDEX STATS
// ─────────────────────────────────────────────
const indexUserStats = async (userId, testpadResults, codeduelAchievements, courseData) => {
  try {
    const index = await getPineconeIndex();
    const records = [];

    let statsText = `User Statistics\n\n`;

    if (testpadResults && Array.isArray(testpadResults) && testpadResults.length > 0) {
      statsText += `Test Results:\n`;
      testpadResults.forEach((result) => {
        statsText += `- ${result.problemTitle}: ${result.passedCases}/${result.totalCases} cases passed in ${result.attempts} attempts\n`;
      });
    }

    if (codeduelAchievements && Array.isArray(codeduelAchievements) && codeduelAchievements.length > 0) {
      statsText += `\nCodeDuel Achievements:\n`;
      codeduelAchievements.forEach((achievement) => {
        statsText += `- Won against ${achievement.opponentName} on ${achievement.problemTitle} (${achievement.difficulty})\n`;
      });
    }

    if (statsText !== `User Statistics\n\n`) {
      const chunks = chunkText(statsText);
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        records.push({
          id: `${userId}-stats-chunk-${i}`,
          values: getEmbedding(chunkContent),
          metadata: {
            userId: userId.toString(),
            dataType: 'user_stats',
            chunkIndex: i,
            text: truncateForMetadata(chunkContent),
            createdAt: new Date().toISOString(),
          },
        });
      }
    }

    if (courseData && courseData._id) {
      const courseName = courseData.name || 'Course';
      const attended = courseData.attended || 0;
      const delivered = courseData.delivered || 0;
      const required = courseData.requiredAttendance || 75;

      const currentAttendancePercent = delivered > 0
        ? Math.round((attended / delivered) * 100) : 0;

      let lecturesCanSkip = 0;
      let lecturesNeedToAttend = 0;
      let attendanceStatus = '';

      if (delivered > 0) {
        if (currentAttendancePercent >= required) {
          lecturesCanSkip = Math.floor(Math.max(0, (100 * attended - required * delivered) / required));
          attendanceStatus = `Safe - Can skip ${lecturesCanSkip} more lecture${lecturesCanSkip !== 1 ? 's' : ''} and still maintain ${required}% attendance`;
        } else {
          lecturesNeedToAttend = Math.ceil(Math.max(0, (required * delivered - 100 * attended) / (100 - required)));
          attendanceStatus = `Critical - Need to attend ${lecturesNeedToAttend} more lecture${lecturesNeedToAttend !== 1 ? 's' : ''} to reach ${required}% attendance`;
        }
      }

      let courseAttendanceText = `Course Attendance for ${courseName}:\n`;
      courseAttendanceText += `- Total Delivered Lectures: ${delivered}\n`;
      courseAttendanceText += `- Lectures Attended: ${attended}\n`;
      courseAttendanceText += `- Current Attendance: ${currentAttendancePercent}%\n`;
      courseAttendanceText += `- Required Attendance: ${required}%\n`;
      courseAttendanceText += `- ${attendanceStatus}\n`;
      if (lecturesCanSkip > 0) courseAttendanceText += `- Can skip: ${lecturesCanSkip} lecture${lecturesCanSkip !== 1 ? 's' : ''}\n`;
      if (lecturesNeedToAttend > 0) courseAttendanceText += `- Must attend: ${lecturesNeedToAttend} more lecture${lecturesNeedToAttend !== 1 ? 's' : ''}\n`;

      const courseChunks = chunkText(courseAttendanceText);
      for (let i = 0; i < courseChunks.length; i++) {
        const chunkContent = courseChunks[i];
        records.push({
          id: `${userId}-course-${courseData._id.toString()}-attendance-chunk-${i}`,
          values: getEmbedding(chunkContent),
          metadata: {
            userId: userId.toString(),
            courseId: courseData._id.toString(),
            courseName: courseName,
            // Store lowercase for matching
            courseNameLower: courseName.toLowerCase(),
            dataType: 'course_attendance',
            chunkIndex: i,
            text: truncateForMetadata(chunkContent),
            createdAt: new Date().toISOString(),
          },
        });
      }
      console.log(`✓ Created ${courseChunks.length} chunks for course "${courseName}"`);
    }

    if (!records.length) {
      console.warn(`No valid vectors for stats for user ${userId}`);
      return 0;
    }

    console.log(`Upserting ${records.length} stats vectors for user ${userId}`);
    await index.upsert({ records });
    console.log(`✅ Indexed ${records.length} stats chunks`);
    return records.length;
  } catch (error) {
    console.error('Error indexing stats:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// SMART SEARCH CONTEXT
// This is the main fix — instead of one dumb
// vector query, we:
// 1. Detect intent from the query
// 2. For attendance → fetch ALL course_attendance
//    chunks via metadata filter (bypass vector similarity)
// 3. For stats → fetch user_stats directly
// 4. For vault/dates/syllabus → vector search with higher K
// 5. Merge and deduplicate results
// ─────────────────────────────────────────────
const searchContext = async (userId, query) => {
  try {
    const index = await getPineconeIndex();
    const intent = detectQueryIntent(query);
    const queryVector = getEmbedding(query);
    const allResults = [];

    console.log(`🔍 Query intent:`, intent);

    // ── ATTENDANCE: fetch ALL course_attendance via metadata filter ──
    // This is the key fix. We don't rely on vector similarity here at all.
    // We ask Pinecone "give me everything tagged course_attendance for this user"
    if (intent.isAttendance) {
      const dummyVec = new Array(1024).fill(0.001); // Pinecone requires a vector even for metadata-only queries

      const attendanceResults = await index.query({
        topK: 50,   // High enough to get ALL courses
        includeMetadata: true,
        filter: {
          userId: { $eq: userId.toString() },
          dataType: { $eq: 'course_attendance' },
        },
        vector: dummyVec,
      });

      // Deduplicate by courseId — keep only chunk 0 per course (has the full summary)
      const seenCourses = new Set();
      for (const match of attendanceResults.matches) {
        const cid = match.metadata.courseId;
        if (!seenCourses.has(cid) && match.metadata.chunkIndex === 0) {
          seenCourses.add(cid);
          allResults.push({
            text: match.metadata.text,
            source: match.metadata.courseName || 'Course Attendance',
            score: 1.0, // Treat metadata-matched results as perfect score
            type: 'course_attendance',
          });
        }
      }

      console.log(`✅ Found ${allResults.length} course attendance records`);

      // If specific course keywords mentioned, also filter by course name
      if (intent.courseKeywords.length > 0 && allResults.length > 0) {
        // Re-rank: put matching courses first
        allResults.sort((a, b) => {
          const aMatch = intent.courseKeywords.some((kw) =>
            (a.source || '').toLowerCase().includes(kw)
          );
          const bMatch = intent.courseKeywords.some((kw) =>
            (b.source || '').toLowerCase().includes(kw)
          );
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
      }
    }

    // ── STATS: fetch via metadata filter ──
    if (intent.isStat) {
      const dummyVec = new Array(1024).fill(0.001);
      const statsResults = await index.query({
        topK: 20,
        includeMetadata: true,
        filter: {
          userId: { $eq: userId.toString() },
          dataType: { $eq: 'user_stats' },
        },
        vector: dummyVec,
      });

      for (const match of statsResults.matches) {
        allResults.push({
          text: match.metadata.text,
          source: 'User Stats',
          score: 1.0,
          type: 'user_stats',
        });
      }

      // Also check testpad_result type
      const testpadResults = await index.query({
        topK: 20,
        includeMetadata: true,
        filter: {
          userId: { $eq: userId.toString() },
          dataType: { $eq: 'testpad_result' },
        },
        vector: queryVector,
      });

      for (const match of testpadResults.matches) {
        if (match.score > 0.2) {
          allResults.push({
            text: match.metadata.text,
            source: match.metadata.problemTitle || 'Testpad',
            score: match.score,
            type: 'testpad_result',
          });
        }
      }
    }

    // ── VAULT / PDF / DATE / SYLLABUS: vector search ──
    if (intent.isVault || intent.isDate || intent.isSyllabus) {
      const vaultResults = await index.query({
        topK: TOP_K_VAULT,
        includeMetadata: true,
        filter: {
          userId: { $eq: userId.toString() },
        },
        vector: queryVector,
      });

      console.log(`📦 Found ${vaultResults.matches.length} vault matches for query`);

      for (const match of vaultResults.matches) {
        // Only include vault items, skip attendance/stats (already handled above)
        if (
          match.metadata.dataType === 'course_attendance' ||
          match.metadata.dataType === 'user_stats'
        ) continue;

        // For vault items, include ALL matches regardless of score
        // (hash embeddings don't score high anyway)
        allResults.push({
          text: match.metadata.text,
          source: match.metadata.itemTitle || match.metadata.dataType || 'Vault',
          score: match.score,
          type: match.metadata.itemType || 'vault',
        });
      }
    }

    // ── FALLBACK: general vector search if nothing found yet ──
    if (allResults.length === 0) {
      console.log('⚠️ No results from intent-based search, falling back to general vector search');
      const fallback = await index.query({
        topK: TOP_K_RESULTS,
        includeMetadata: true,
        filter: { userId: { $eq: userId.toString() } },
        vector: queryVector,
      });

      console.log(`📦 Fallback found ${fallback.matches.length} results`);

      for (const match of fallback.matches) {
        // For vault items, include all — no score threshold
        // For other types, only include if above threshold
        const isVaultItem =
          match.metadata.itemType &&
          match.metadata.vaultItemId &&
          !match.metadata.dataType;

        if (isVaultItem || match.score > SCORE_THRESHOLD) {
          allResults.push({
            text: match.metadata.text,
            source: match.metadata.itemTitle || match.metadata.courseName || match.metadata.dataType || 'Context',
            score: match.score,
            type: match.metadata.itemType || match.metadata.dataType || 'unknown',
          });
        }
      }
    }

    // Deduplicate by text content
    const seen = new Set();
    const deduped = allResults.filter((item) => {
      const key = item.text?.slice(0, 100);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`✅ Returning ${deduped.length} context chunks for query`);
    return deduped;
  } catch (error) {
    console.error('Error searching context:', error);
    return [];
  }
};

// ─────────────────────────────────────────────
// INDEX SINGLE TESTPAD RESULT
// ─────────────────────────────────────────────
const indexTestpadResult = async (userId, testpadResult) => {
  try {
    if (!testpadResult || !testpadResult.problemTitle) {
      console.warn('Invalid testpad result - missing required fields');
      return null;
    }

    const index = await getPineconeIndex();
    const resultText = `Question: ${testpadResult.problemTitle}
Test Cases: ${testpadResult.passedCases}/${testpadResult.totalCases} passed
Attempts: ${testpadResult.attempts}
Last Attempted: ${new Date(testpadResult.lastAttemptedAt).toLocaleDateString()}
Status: ${testpadResult.passedCases === testpadResult.totalCases ? 'Solved' : 'In Progress'}`;

    const vectorId = `${userId}-testpad-${testpadResult._id.toString()}`;
    const vectorValues = getEmbedding(resultText);

    if (!vectorValues || !Array.isArray(vectorValues) || vectorValues.length === 0) {
      console.warn('Invalid vector generated for testpad result');
      return null;
    }

    const record = {
      id: vectorId,
      values: vectorValues,
      metadata: {
        userId: userId.toString(),
        dataType: 'testpad_result',
        problemTitle: String(testpadResult.problemTitle),
        passedCases: Number(testpadResult.passedCases),
        totalCases: Number(testpadResult.totalCases),
        attempts: Number(testpadResult.attempts),
        lastAttemptedAt: new Date(testpadResult.lastAttemptedAt).toISOString(),
        solved: testpadResult.passedCases === testpadResult.totalCases,
        text: truncateForMetadata(resultText),
        createdAt: new Date().toISOString(),
      },
    };

    await index.upsert({ records: [record] });
    console.log(`✓ Indexed testpad result: ${testpadResult.problemTitle} for user ${userId}`);
    return vectorId;
  } catch (error) {
    console.error('Error indexing testpad result:', error.message);
    return null;
  }
};

// ─────────────────────────────────────────────
// DELETE VAULT VECTORS
// ─────────────────────────────────────────────
const deleteVaultVectors = async (userId, vaultItemId) => {
  try {
    const index = await getPineconeIndex();
    const dummyVector = new Array(1024).fill(0);
    const results = await index.query({
      topK: 100,
      includeMetadata: true,
      filter: {
        userId: { $eq: userId.toString() },
        vaultItemId: { $eq: vaultItemId.toString() },
      },
      vector: dummyVector,
    });

    const idsToDelete = results.matches.map((match) => match.id);
    if (idsToDelete.length === 0) {
      console.log(`No vectors found for vault item ${vaultItemId}`);
      return true;
    }

    await index.deleteMany(idsToDelete);
    console.log(`✓ Deleted ${idsToDelete.length} vectors for vault item ${vaultItemId}`);
    return true;
  } catch (error) {
    console.error('Error deleting vectors:', error);
    throw error;
  }
};

module.exports = {
  indexUserVault,
  indexUserStats,
  indexTestpadResult,
  searchContext,
  deleteVaultVectors,
  chunkText,
  extractPdfText,
};