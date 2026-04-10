const fs = require('fs');
const path = require('path');

// Base directory for logs
const LOGS_DIR = path.join(__dirname, '../public/logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Get the log file path for a specific section (one file per section)
 * @param {string} section - The section name (vault, mcq, testpad)
 * @returns {string} Log file path
 */
const getLogFilePath = (section) => {
  // One log file per section (e.g., vault.log, testpad.log, mcq.log)
  return path.join(LOGS_DIR, `${section}.log`);
};

/**
 * Format a log entry with timestamp and user ID
 * @param {string} action - The action performed
 * @param {string} userId - The user ID
 * @param {object} details - Additional details about the action
 * @returns {string} Formatted log entry
 */
const formatLogEntry = (action, userId, details = {}) => {
  const timestamp = new Date().toISOString();
  const detailsStr = Object.keys(details).length > 0 ? JSON.stringify(details) : '';
  return `[${timestamp}] [${action}] [User: ${userId}] ${detailsStr}\n`;
};

/**
 * Log an activity to the section-specific log file (appends to single file per section)
 * @param {string} section - The section name (vault, mcq, testpad)
 * @param {string} action - The action performed
 * @param {string} userId - The user ID
 * @param {object} details - Additional details about the action
 */
const logActivity = (section, action, userId, details = {}) => {
  try {
    const logFilePath = getLogFilePath(section);
    const logEntry = formatLogEntry(action, userId, details);
    
    fs.appendFileSync(logFilePath, logEntry);
    console.log(`[LOG] ${section.toUpperCase()}: ${action} by User ${userId}`);
  } catch (error) {
    console.error(`[LOG ERROR] Failed to log activity: ${error.message}`);
  }
};

/**
 * Read logs for a specific section (all data from the single file)
 * @param {string} section - The section name
 * @returns {string} Log contents
 */
const readLogs = (section) => {
  try {
    const logFilePath = getLogFilePath(section);
    
    if (fs.existsSync(logFilePath)) {
      return fs.readFileSync(logFilePath, 'utf-8');
    }
    return '';
  } catch (error) {
    console.error(`[LOG ERROR] Failed to read logs: ${error.message}`);
    return '';
  }
};

/**
 * Read logs for a specific section filtered by user ID
 * @param {string} section - The section name
 * @param {string} userId - The user ID to filter by
 * @returns {string} Filtered log contents
 */
const readLogsByUser = (section, userId) => {
  try {
    const logFilePath = getLogFilePath(section);
    
    if (fs.existsSync(logFilePath)) {
      const allLogs = fs.readFileSync(logFilePath, 'utf-8');
      // Filter lines containing the specific user ID
      const lines = allLogs.split('\n').filter(line => line.includes(`[User: ${userId}]`));
      return lines.join('\n');
    }
    return '';
  } catch (error) {
    console.error(`[LOG ERROR] Failed to read logs by user: ${error.message}`);
    return '';
  }
};

/**
 * Get recent activities for a user across all sections from the last 7 days
 * @param {string} userId - The user ID to filter by
 * @returns {Array} Array of activity objects sorted by timestamp (newest first)
 */
const getRecentActivities = (userId) => {
  try {
    const sections = ['testpad', 'mcq', 'codeduel', 'vault', 'roadmap'];
    const activities = [];
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log(`[LOG] Fetching activities for user: ${userId}, from last 7 days (after ${sevenDaysAgo.toISOString()})`);

    for (const section of sections) {
      const logFilePath = getLogFilePath(section);
      
      if (fs.existsSync(logFilePath)) {
        const allLogs = fs.readFileSync(logFilePath, 'utf-8');
        const lines = allLogs.split('\n').filter(line => line.includes(`[User: ${userId}]`) && line.trim());
        
        console.log(`[LOG] ${section.toUpperCase()}: Found ${lines.length} lines for user ${userId}`);
        
        for (const line of lines) {
          try {
            // Parse log line format: [timestamp] [action] [User: userId] {details}
            const timestampMatch = line.match(/\[(.*?)\]/);
            const actionMatch = line.match(/\] \[(.*?)\] \[/);
            const detailsMatch = line.match(/\]\s+({.*})$/);
            
            if (timestampMatch && actionMatch) {
              const timestamp = new Date(timestampMatch[1]);
              const action = actionMatch[1];
              
              // Filter out intermediate/generation logs - only show COMPLETED activities
              if (action === 'TESTS_RUN' || action === 'QUIZ_GENERATED') {
                continue;
              }
              
              console.log(`[LOG] Parsed - timestamp: ${timestamp.toISOString()}, sevenDaysAgo: ${sevenDaysAgo.toISOString()}, isWithin7Days: ${timestamp >= sevenDaysAgo}`);
              
              // Only include activities from the last 7 days
              if (timestamp < sevenDaysAgo) {
                console.log(`[LOG] Skipping activity (older than 7 days): ${action}`);
                continue;
              }
              
              let details = {};
              
              if (detailsMatch) {
                try {
                  details = JSON.parse(detailsMatch[1]);
                } catch (parseError) {
                  console.warn(`[LOG] Failed to parse JSON details from line: ${line}`);
                }
              }
              
              // Format the activity for display
              let displayAction = '';
              let displaySubject = '';
              let icon = 'Code2';
              let color = 'text-foreground';
              let iconBg = 'bg-slate-500/10';
              
              // Map actions to display names
              switch(action) {
                case 'PROBLEM_GENERATED':
                  displayAction = 'Generated problem';
                  displaySubject = details.topic || 'New Problem';
                  if (section === 'testpad') {
                    icon = 'Code2';
                    color = 'text-emerald-400';
                    iconBg = 'bg-emerald-400/10';
                  } else if (section === 'codeduel') {
                    icon = 'Swords';
                    color = 'text-orange-400';
                    iconBg = 'bg-orange-400/10';
                  }
                  break;
                case 'TEST_COMPLETED':
                  displayAction = 'Completed tests';
                  displaySubject = `${details.problemTitle || 'Problem'} — ${details.passedCases || 0}/${details.totalCases || 0} passed`;
                  icon = 'CheckCircle2';
                  color = 'text-emerald-400';
                  iconBg = 'bg-emerald-400/10';
                  break;
                case 'TESTS_RUN':
                  displayAction = 'Ran tests';
                  displaySubject = `${details.problemTitle || 'Problem'} — ${details.passedCases || 0}/${details.totalCases || 0} passed`;
                  icon = 'CheckCircle2';
                  color = 'text-emerald-400';
                  iconBg = 'bg-emerald-400/10';
                  break;
                case 'QUIZ_GENERATED':
                  displayAction = 'Generated MCQ quiz';
                  displaySubject = `${details.topic || 'Quiz'} — ${details.numQuestions} questions`;
                  icon = 'Brain';
                  color = 'text-pink-400';
                  iconBg = 'bg-pink-400/10';
                  break;
                case 'QUIZ_COMPLETED':
                  displayAction = 'Completed MCQ quiz';
                  displaySubject = `Score: ${details.score || 0}% — ${details.correctAnswers || 0}/${details.totalQuestions || 0}`;
                  icon = 'Brain';
                  color = 'text-pink-400';
                  iconBg = 'bg-pink-400/10';
                  break;
                case 'DUEL_WON':
                  displayAction = 'Won Code Duel';
                  displaySubject = `vs opponent — ${details.roomId || 'Duel'}`;
                  icon = 'Swords';
                  color = 'text-orange-400';
                  iconBg = 'bg-orange-400/10';
                  break;
                case 'DUEL_LOST':
                  displayAction = 'Lost Code Duel';
                  displaySubject = `vs opponent — ${details.roomId || 'Duel'}`;
                  icon = 'Swords';
                  color = 'text-orange-400';
                  iconBg = 'bg-orange-400/10';
                  break;
                case 'ITEM_CREATED':
                  displayAction = 'Saved note';
                  displaySubject = details.title || 'New Note';
                  icon = 'FileText';
                  color = 'text-accent';
                  iconBg = 'bg-accent/10';
                  break;
                case 'ROADMAP_GENERATED':
                case 'ROADMAP_SELECTED':
                  displayAction = 'Generated roadmap';
                  displaySubject = details.topic || details.roadmapName || 'New Roadmap';
                  icon = 'Map';
                  color = 'text-primary';
                  iconBg = 'bg-primary/10';
                  break;
                default:
                  displayAction = action.replace(/_/g, ' ').toLowerCase();
                  displaySubject = section.charAt(0).toUpperCase() + section.slice(1);
              }
              
              activities.push({
                timestamp,
                action: displayAction,
                subject: displaySubject,
                icon,
                color,
                iconBg,
                rawAction: action,
                section,
                problemTitle: details.problemTitle || details.topic || null,
                topic: details.topic || null
              });
            }
          } catch (lineError) {
            console.error(`[LOG] Error parsing log line: ${lineError.message}`);
          }
        }
      }
    }

    console.log(`[LOG] Total activities found before sorting: ${activities.length}`);
    // Sort by timestamp (newest first) 
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    // Deduplication: Keep only the latest entry per session/problem/quiz
    const seen = new Map(); // Maps session key to true if already included
    const deduplicated = [];
    
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      let sessionKey = '';
      let shouldSkip = false;
      
      if (activity.section === 'testpad' && activity.rawAction === 'TEST_COMPLETED') {
        // For testpad: group by problemTitle - keep only latest TEST_COMPLETED per problem
        // Extract problem name more reliably - normalize the name
        let problemName = activity.problemTitle || activity.subject.split(' — ')[0];
        problemName = problemName.trim().toLowerCase();
        sessionKey = `testpad_test_${problemName}`;
        console.log(`[LOG] TEST_COMPLETED problem: "${problemName}", key: "${sessionKey}", exists: ${seen.has(sessionKey)}`);
      } else if (activity.section === 'mcq' && activity.rawAction === 'QUIZ_COMPLETED') {
        // For MCQ: group by topic - keep only latest QUIZ_COMPLETED per topic
        let topicName = activity.topic || activity.subject.split(' — ')[0];
        topicName = topicName.trim().toLowerCase();
        sessionKey = `mcq_quiz_${topicName}`;
      } else if (activity.section === 'testpad' && activity.rawAction === 'PROBLEM_GENERATED') {
        // Skip PROBLEM_GENERATED if we already have a TEST_COMPLETED for this problem
        let problemName = activity.problemTitle || activity.subject;
        problemName = problemName.trim().toLowerCase();
        const testKey = `testpad_test_${problemName}`;
        if (seen.has(testKey)) {
          console.log(`[LOG] Skipping PROBLEM_GENERATED for "${problemName}" (TEST_COMPLETED exists)`);
          shouldSkip = true;
        } else {
          sessionKey = `testpad_gen_${problemName}`;
        }
      } else {
        // Keep all other entries (no deduplication)
        // Use unique key for codeduel, vault, roadmap
        sessionKey = `${activity.section}_${activity.rawAction}_${Math.random()}`;
      }
      
      if (!shouldSkip && !seen.has(sessionKey)) {
        seen.set(sessionKey, true);
        deduplicated.push(activity);
        console.log(`[LOG] Added activity (${activity.rawAction}): ${sessionKey}`);
      } else if (!shouldSkip) {
        console.log(`[LOG] Skipped duplicate (${activity.rawAction}): ${sessionKey}`);
      }
    }
    
    console.log(`[LOG] Activities after deduplication: ${deduplicated.length} (was ${activities.length})`);
    
    const result = deduplicated.map(activity => ({
      action: activity.action,
      subject: activity.subject,
      time: formatTimeAgo(activity.timestamp),
      icon: activity.icon,
      color: activity.color,
      iconBg: activity.iconBg
    }));
    
    console.log(`[LOG] Returning ${result.length} activities`);
    return result;
  } catch (error) {
    console.error(`[LOG ERROR] Failed to get recent activities: ${error.message}`);
    console.error(error.stack);
    return [];
  }
};

/**
 * Format a timestamp to a relative time string (e.g., "2 hours ago")
 * @param {Date} date - The date to format
 * @returns {string} Relative time string
 */
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  // For older dates, format as "N days ago" or fall back to date
  const daysAgo = Math.floor(diffInSeconds / 86400);
  return daysAgo <= 7 ? `${daysAgo} days ago` : date.toLocaleDateString();
};

module.exports = {
  logActivity,
  readLogs,
  readLogsByUser,
  getRecentActivities,
  formatTimeAgo,
  getLogFilePath
};

