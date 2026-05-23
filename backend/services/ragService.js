const { getPineconeIndex } = require('../config/pinecone');
const axios = require('axios');
const { PDFParse } = require('pdf-parse');

const CHUNK_SIZE = 200;           // words per chunk (reduced to keep metadata small)
const TOP_K_RESULTS = 5;
const METADATA_TEXT_LIMIT = 500; // chars stored in Pinecone metadata (40KB limit per vector)

const truncateForMetadata = (text) =>
  text.length > METADATA_TEXT_LIMIT ? text.slice(0, METADATA_TEXT_LIMIT) + '…' : text;

/**
 * Extract plain text from a Cloudinary PDF URL using pdf-parse (v2+ class API)
 */
const extractPdfText = async (pdfUrl) => {
  try {
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    // pdf-parse v2+ uses a class-based API: new PDFParse({ data: buffer })
    const parser = new PDFParse({ data: buffer });
    await parser.load(buffer);
    const result = await parser.getText();

    // result.text contains the full extracted text
    const text = (result.text || '')
      .replace(/-- \d+ of \d+ --/g, '') // strip page markers
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`✓ Extracted ${text.length} chars from PDF`);
    return text;
  } catch (error) {
    console.error('Error extracting PDF:', error.message);
    return '';
  }
};

/**
 * Split text into chunks for vectorization
 */
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

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
};

/**
 * Simple embedding function using text hash for semantic search
 * Dimension: 1024 (matches Pinecone index)
 */
const getEmbedding = (text) => {
  const vector = new Array(1024).fill(0);
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  for (let i = 0; i < 1024; i++) {
    vector[i] = Math.sin((hash + i) / 1024) * 0.5 + 0.5;
  }
  return vector;
};

/**
 * Index vault items (PDFs, notes, links) into Pinecone
 */
const indexUserVault = async (userId, vaultItems) => {
  try {
    const index = await getPineconeIndex();
    const records = [];

    if (!Array.isArray(vaultItems) || vaultItems.length === 0) {
      console.warn('No vault items to index');
      return 0;
    }

    for (const item of vaultItems) {
      if (!item || !item._id) {
        console.warn('Skipping invalid vault item');
        continue;
      }

      let textContent = '';

      if (item.type === 'pdf' && item.fileData) {
        textContent = await extractPdfText(item.fileData);
      } else if (item.type === 'snippet') {
        textContent = item.preview || item.content || item.url || '';
      } else if (item.type === 'link') {
        textContent = item.url || item.preview || '';
      } else if (item.type === 'other' || item.type === 'note') {
        // For notes and other items, use preview (content) or description
        textContent = item.preview || item.description || item.content || '';
      }

      if (!textContent || textContent.trim().length === 0) {
        console.warn(`Skipping vault item ${item._id} - no text content`);
        continue;
      }

      console.log(`✓ Found ${textContent.length} chars of content for vault item ${item._id} (${item.title})`);

      const chunks = chunkText(textContent);

      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        const chunkId = `${userId}-${item._id}-chunk-${i}`;
        const vectorValues = getEmbedding(chunkContent);

        if (!vectorValues || !Array.isArray(vectorValues) || vectorValues.length === 0) {
          console.warn(`Skipping invalid vector for chunk ${i}`);
          continue;
        }

        records.push({
          id: chunkId,
          values: vectorValues,
          metadata: {
            userId: userId.toString(),
            vaultItemId: item._id.toString(),
            itemType: item.type,
            itemTitle: String(item.title || 'Untitled'),
            chunkIndex: i,
            text: truncateForMetadata(chunkContent),
            createdAt: new Date().toISOString(),
          },
        });
      }
    }

    if (!records.length) {
      console.warn(`No valid vectors generated for vault items for user ${userId}`);
      return 0;
    }

    console.log(`Preparing to upsert ${records.length} vault vectors for user ${userId}`);
    await index.upsert({ records });
    console.log(`✅ Successfully indexed ${records.length} vault vector chunks to Pinecone`);

    return records.length;
  } catch (error) {
    console.error('Error indexing vault:', error);
    throw error;
  }
};

/**
 * Index user stats (test results, codeduel, attendance) into Pinecone
 */
const indexUserStats = async (userId, testpadResults, codeduelAchievements, courseData) => {
  try {
    const index = await getPineconeIndex();
    const records = [];

    // Index testpad and codeduel in shared stats chunks
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

    // Index test/codeduel stats if they exist
    if (statsText !== `User Statistics\n\n`) {
      const chunks = chunkText(statsText);

      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        const statsChunkId = `${userId}-stats-chunk-${i}`;
        const vectorValues = getEmbedding(chunkContent);

        if (!vectorValues || !Array.isArray(vectorValues) || vectorValues.length === 0) {
          console.warn(`Skipping invalid vector for stats chunk ${i}`);
          continue;
        }

        records.push({
          id: statsChunkId,
          values: vectorValues,
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

    // Index course attendance with SEPARATE, COURSE-SPECIFIC chunks
    if (courseData && courseData._id) {
      const courseName = courseData.name || 'Course';
      const attended = courseData.attended || 0;
      const delivered = courseData.delivered || 0;
      const required = courseData.requiredAttendance || 75;
      
      const currentAttendancePercent = delivered > 0 
        ? Math.round((attended / delivered) * 100) 
        : 0;
      
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
      
      if (lecturesCanSkip > 0) {
        courseAttendanceText += `- Can skip: ${lecturesCanSkip} lecture${lecturesCanSkip !== 1 ? 's' : ''}\n`;
      }
      if (lecturesNeedToAttend > 0) {
        courseAttendanceText += `- Must attend: ${lecturesNeedToAttend} more lecture${lecturesNeedToAttend !== 1 ? 's' : ''}\n`;
      }

      const courseChunks = chunkText(courseAttendanceText);
      
      for (let i = 0; i < courseChunks.length; i++) {
        const chunkContent = courseChunks[i];
        // Use course-specific ID: userId-course-{courseId}-attendance-chunk-{index}
        const courseChunkId = `${userId}-course-${courseData._id.toString()}-attendance-chunk-${i}`;
        const vectorValues = getEmbedding(chunkContent);

        if (!vectorValues || !Array.isArray(vectorValues) || vectorValues.length === 0) {
          console.warn(`Skipping invalid vector for course chunk ${i}`);
          continue;
        }

        records.push({
          id: courseChunkId,
          values: vectorValues,
          metadata: {
            userId: userId.toString(),
            courseId: courseData._id.toString(),
            courseName: courseName,
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
      console.warn(`No valid vectors generated for stats indexing for user ${userId}`);
      return 0;
    }

    console.log(`Preparing to upsert ${records.length} stats vectors for user ${userId}`);
    await index.upsert({ records });
    console.log(`✅ Successfully indexed ${records.length} stats vector chunks to Pinecone`);

    return records.length;
  } catch (error) {
    console.error('Error indexing stats:', error);
    throw error;
  }
};

/**
 * Search Pinecone for relevant context based on user query
 */
const searchContext = async (userId, query) => {
  try {
    const index = await getPineconeIndex();

    const queryVector = getEmbedding(query);

    const results = await index.query({
      topK: TOP_K_RESULTS,
      includeMetadata: true,
      filter: {
        userId: { $eq: userId.toString() },
      },
      vector: queryVector,
    });

    const context = results.matches
      .map((match) => ({
        text: match.metadata.text,
        source: match.metadata.itemTitle || match.metadata.dataType,
        score: match.score,
        type: match.metadata.itemType || match.metadata.dataType,
      }))
      .filter((item) => item.score > 0.5);

    return context;
  } catch (error) {
    console.error('Error searching context:', error);
    return [];
  }
};

/**
 * Index a single testpad result for semantic search
 */
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

    console.log(`Preparing to upsert testpad result with ID: ${vectorId}`);

    await index.upsert({ records: [record] });
    console.log(`✓ Indexed testpad result: ${testpadResult.problemTitle} for user ${userId}`);

    return vectorId;
  } catch (error) {
    console.error('Error indexing testpad result:', error.message);
    console.error('Full error:', error);
    return null;
  }
};

/**
 * Delete all vectors for a specific vault item
 */
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