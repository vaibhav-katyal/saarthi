const cron = require('node-cron');
const User = require('../models/User');
const { sendWeeklySummaryEmail } = require('./emailService');
const { getWeeklySummaryForUser } = require('./weeklySummaryHelper');

/**
 * Schedule weekly summary emails to be sent every Sunday at 9:00 AM
 * Cron format: minute hour day-of-month month day-of-week
 * '0 9 * * 0' = Every Sunday at 9:00 AM
 */
const scheduleWeeklyEmails = () => {
  console.log('📅 Scheduling weekly summary emails (Sundays at 9:00 AM)');
  
  cron.schedule('0 9 * * 0', async () => {
    console.log('⏰ Running weekly email job...');
    await sendWeeklyEmailsToAllUsers();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Adjust timezone as needed
  });
  
  console.log('✅ Weekly email scheduler started');
};

/**
 * Send weekly summary emails to all users
 * This function can also be called manually for testing
 */
const sendWeeklyEmailsToAllUsers = async () => {
  try {
    const startTime = Date.now();
    console.log('🚀 Starting weekly summary email dispatch...');
    
    // Fetch all users
    const users = await User.find({}).select('name email');
    console.log(`📨 Found ${users.length} users to notify`);
    
    let sentCount = 0;
    let failedCount = 0;
    
    // Process each user
    for (const user of users) {
      try {
        // Get weekly summary for this user
        const summary = await getWeeklySummaryForUser(user._id);
        
        // Skip if no activity this week
        if (summary.problemsSolved === 0 && summary.mcqsAttempted === 0) {
          console.log(`⏭️  Skipping ${user.email} - no activity this week`);
          continue;
        }
        
        // Send email
        const result = await sendWeeklySummaryEmail(
          user.email,
          user.name,
          summary
        );
        
        if (result.success) {
          sentCount++;
          console.log(`✅ Sent to: ${user.email}`);
        } else {
          failedCount++;
          console.error(`❌ Failed to send to ${user.email}:`, result.error);
        }
        
        // Small delay to avoid rate limiting
        await delay(500);
        
      } catch (userError) {
        failedCount++;
        console.error(`❌ Error processing user ${user.email}:`, userError.message);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`📊 Weekly email job completed in ${duration}s`);
    console.log(`   ✅ Sent: ${sentCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   ⏭️  Skipped (no activity): ${users.length - sentCount - failedCount}`);
    
  } catch (error) {
    console.error('💥 Weekly email job failed:', error.message);
  }
};

/**
 * Send weekly summary to a specific user (for testing)
 * @param {string} userId - MongoDB user ID
 */
const sendWeeklySummaryToUser = async (userId) => {
  try {
    const user = await User.findById(userId).select('name email');
    if (!user) {
      throw new Error('User not found');
    }
    
    const summary = await getWeeklySummaryForUser(userId);
    const result = await sendWeeklySummaryEmail(user.email, user.name, summary);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to send weekly summary:', error.message);
    return { success: false, error: error.message };
  }
};

// Utility function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  scheduleWeeklyEmails,
  sendWeeklyEmailsToAllUsers,
  sendWeeklySummaryToUser
};

