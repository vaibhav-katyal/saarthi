/**
 * Standalone script to test weekly summary email
 *
 * Usage:
 *   cd backend && node scripts/testWeeklyEmail.js
 *   cd backend && EMAIL=user@example.com node scripts/testWeeklyEmail.js
 *   cd backend && DRY_RUN=1 node scripts/testWeeklyEmail.js
 *   cd backend && EMAIL=user@example.com DRY_RUN=1 node scripts/testWeeklyEmail.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const { sendWeeklySummaryEmail } = require('../utils/emailService');
const { getWeeklySummaryForUser } = require('../utils/weeklySummaryHelper');

const dryRun = process.env.DRY_RUN === '1';
const targetEmail = process.env.EMAIL;

const runTest = async () => {
  try {
    console.log('📡 Connecting to database...');
    await connectDB();

    // Find target user
    let user;
    if (targetEmail) {
      user = await User.findOne({ email: targetEmail }).select('name email');
      if (!user) {
        console.error(`❌ User with email "${targetEmail}" not found`);
        process.exit(1);
      }
    } else {
      user = await User.findOne({}).select('name email');
      if (!user) {
        console.error('❌ No users found in database');
        process.exit(1);
      }
    }

    console.log(`\n👤 Target user: ${user.name} (${user.email})`);
    console.log(`🔍 User ID: ${user._id}`);

    // Generate summary
    console.log('\n📊 Generating weekly summary...');
    const summary = await getWeeklySummaryForUser(user._id);
    console.log('Weekly summary:', JSON.stringify(summary, null, 2));

    if (dryRun) {
      console.log('\n🛑 DRY RUN — email not sent');
      console.log('   To actually send, run without DRY_RUN=1');
      process.exit(0);
    }

    // Check if user had any activity
    if (summary.problemsSolved === 0 && summary.mcqsAttempted === 0) {
      console.log('\n⚠️  User had no activity this week. Email would be skipped in production.');
      console.log('   Sending anyway for testing purposes...\n');
    }

    // Send email
    console.log('\n📧 Sending weekly summary email...');
    const result = await sendWeeklySummaryEmail(user.email, user.name, summary);

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      if (result.previewUrl) {
        console.log(`   Preview URL: ${result.previewUrl}`);
      }
    } else {
      console.error('❌ Failed to send email:', result.error);
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

runTest();
