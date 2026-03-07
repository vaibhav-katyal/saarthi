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

module.exports = {
  logActivity,
  readLogs,
  readLogsByUser,
  getLogFilePath
};

