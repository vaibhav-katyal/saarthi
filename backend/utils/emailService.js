const ejs = require('ejs');
const path = require('path');
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Check if SMTP credentials are configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📧 Using configured SMTP transporter:', process.env.SMTP_HOST);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Fallback to Ethereal for development (test emails)
  if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
    console.log('📧 Using Ethereal transporter from env');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
      }
    });
  }

  console.log('⚠️  No email credentials found in env. Will try auto-creating Ethereal account.');
  // No credentials configured — return null so caller can handle gracefully
  return null;
};

// Create an Ethereal test account automatically for development
const createEtherealTransporter = async () => {
  try {
    console.log('🔄 Creating Ethereal test account for development...');
    const testAccount = await nodemailer.createTestAccount();
    
    const etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('✅ Ethereal test account created:', testAccount.user);
    return etherealTransporter;
  } catch (error) {
    console.error('❌ Failed to create Ethereal test account:', error.message);
    return null;
  }
};

// Get or create transporter instance
let transporter = null;
let transporterVerified = false;
let etherealAttempted = false;

const getTransporter = async () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  // If no env credentials, try auto-creating Ethereal test account once
  if (!transporter && !etherealAttempted) {
    etherealAttempted = true;
    transporter = await createEtherealTransporter();
  }
  return transporter;
};

/**
 * Send email using EJS template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - EJS template name (without .ejs)
 * @param {Object} options.data - Data to pass to EJS template
 * @returns {Promise<Object>} - Nodemailer info object
 */
const sendTemplatedEmail = async ({ to, subject, template, data }) => {
  try {
    const transport = await getTransporter();

    // If no transporter available after all attempts
    if (!transport) {
      console.error('❌ No email credentials configured and failed to create Ethereal test account.');
      console.error('   Set SMTP_HOST, SMTP_USER, SMTP_PASS or ETHEREAL_USER, ETHEREAL_PASS in .env');
      console.error('   Recipient:', to);
      console.error('   Subject:', subject);
      return { success: false, error: 'Email service not configured. Please set SMTP credentials in environment variables.' };
    }

    // Verify connection on first use
    if (!transporterVerified) {
      try {
        await transport.verify();
        transporterVerified = true;
        console.log('✅ Email transporter verified');
      } catch (verifyErr) {
        console.error('❌ Email transporter verification failed:', verifyErr.message);
        console.error('   SMTP Host:', process.env.SMTP_HOST);
        console.error('   SMTP Port:', process.env.SMTP_PORT || 587);
        console.error('   SMTP User:', process.env.SMTP_USER);
        console.error('   SMTP Secure:', process.env.SMTP_SECURE === 'true');
        console.error('   Hint: For Gmail, use an App Password (not your regular password) and ensure 2FA is enabled.');
        // Reset so next call retries creation
        transporter = null;
        return { success: false, error: `Transporter verification failed: ${verifyErr.message}` };
      }
    }

    const templatePath = path.join(__dirname, '../views/emails', `${template}.ejs`);
    
    // Render EJS template with data
    const html = await ejs.renderFile(templatePath, data);
    
    const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@saarthi.dev';
    
    const mailOptions = {
      from: `Saarthi <${fromAddress}>`,
      to,
      subject,
      html
    };
    
    const info = await transport.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    
    // Log Ethereal URL for development
    if (info.ethereal) {
      console.log(`📬 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return { success: true, messageId: info.messageId, previewUrl: info.ethereal ? nodemailer.getTestMessageUrl(info) : null };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} resetToken - Reset token
 */
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
  
  console.log(`🔐 Sending password reset email to ${email}`);
  console.log(`   Reset link: ${resetLink}`);
  
  return sendTemplatedEmail({
    to: email,
    subject: '🔐 Reset Your Saarthi Password',
    template: 'password-reset',
    data: {
      name,
      resetLink
    }
  });
};

/**
 * Send weekly summary email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {Object} stats - Weekly statistics
 */
const sendWeeklySummaryEmail = async (email, name, stats) => {
  const dashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/dashboard`;
  
  // Pre-compute values for template
  const progressWidth = Math.min(stats.accuracy || 0, 100);
  
  return sendTemplatedEmail({
    to: email,
    subject: `📊 Your Weekly Summary - ${stats.weekStart} to ${stats.weekEnd}`,
    template: 'weekly-summary',
    data: {
      name,
      stats: {
        problemsSolved: stats.problemsSolved || 0,
        mcqsAttempted: stats.mcqsAttempted || 0,
        accuracy: stats.accuracy || 0,
        activeDays: stats.activeDays || 0,
        bestDay: stats.bestDay || 'N/A'
      },
      weekStart: stats.weekStart,
      weekEnd: stats.weekEnd,
      dashboardLink,
      progressWidth
    }
  });
};

/**
 * Verify transporter connection
 */
const verifyConnection = async () => {
  try {
    const transport = await getTransporter();
    if (!transport) {
      console.error('❌ Email service not configured');
      return false;
    }
    await transport.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service connection failed:', error.message);
    return false;
  }
};

module.exports = {
  sendTemplatedEmail,
  sendPasswordResetEmail,
  sendWeeklySummaryEmail,
  verifyConnection,
  getTransporter
};
