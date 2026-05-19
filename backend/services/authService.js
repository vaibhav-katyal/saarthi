const User = require('../models/User');
const PGUser = require('../models/PGUser');
const jwt = require('jsonwebtoken');
const https = require('https');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendPasswordResetEmail } = require('../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to sign JWT
const getSignedJwtToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_development';
  const expire = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id }, secret, {
    expiresIn: expire
  });
};

// Helper function to format token response
const formatTokenResponse = (user) => {
  const token = getSignedJwtToken(user._id);

  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
    }
  };
};

// Helper: verify Google access token by calling Google's userinfo endpoint
function verifyGoogleAccessToken(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.googleapis.com',
      path: '/oauth2/v3/userinfo',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse Google response'));
          }
        } else {
          reject(new Error(`Google returned status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

// Register user service
const registerUser = async (name, email, password) => {
  let user = await User.findOne({ email });

  if (user) {
    throw new Error('User already exists');
  }

  user = await User.create({
    name,
    email,
    password,
  });

  // Store new user in PostgreSQL
  try {
    await PGUser.create({
      name: user.name,
      email: user.email,
      password: user.password
    });
    console.log('User stored in PostgreSQL:', email);
  } catch (pgError) {
    console.error('Failed to store user in PostgreSQL:', pgError.message);
    // Don't throw error - MongoDB user is already created
  }

  return formatTokenResponse(user);
};

// Login user service
const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Please provide an email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.password) {
    throw new Error('This account uses Google login. Please sign in with Google.');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return formatTokenResponse(user);
};

// Google OAuth login/register service
const googleAuth = async (credential, userInfo) => {
  if (!credential || !userInfo) {
    throw new Error('Google credential and userInfo are required');
  }

  // Server-side verification: call Google's userinfo API with the access token
  let verifiedInfo;
  try {
    verifiedInfo = await verifyGoogleAccessToken(credential);
    console.log('Google token verified for:', verifiedInfo.email);
  } catch (verifyErr) {
    console.error('Google token verification failed:', verifyErr.message);
    throw new Error('Invalid Google access token');
  }

  // Use the server-verified data for security
  const googleId = verifiedInfo.sub;
  const email = verifiedInfo.email;
  const name = verifiedInfo.name;
  const picture = verifiedInfo.picture;

  if (!email) {
    throw new Error('Could not retrieve email from Google');
  }

  // Check if user already exists with this Google ID
  let user = await User.findOne({ googleId });

  if (!user) {
    // Check if user exists with same email (registered via email/password)
    user = await User.findOne({ email });

    if (user) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.avatar = user.avatar || picture;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
      });

      // Store new user in PostgreSQL
      try {
        await PGUser.create({
          name: user.name,
          email: user.email,
          googleId: user.googleId,
          avatar: user.avatar
        });
        console.log('New Google user stored in PostgreSQL:', email);
      } catch (pgError) {
        console.error('Failed to store Google user in PostgreSQL:', pgError.message);
        // Don't throw error - MongoDB user is already created
      }
    }
  } else {
    // Update avatar if changed
    if (picture && user.avatar !== picture) {
      user.avatar = picture;
      await user.save();
    }
  }

  return formatTokenResponse(user);
};

// Forgot password service
const forgotPassword = async (email) => {
  if (!email) {
    throw new Error('Please provide an email');
  }

  const user = await User.findOne({ email });

  if (!user) {
    // Return success even if user not found to prevent email enumeration
    return {
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.'
    };
  }

  // Check if user has a password (not Google-only)
  const userWithPassword = await User.findById(user._id).select('+password');
  if (!userWithPassword.password) {
    throw new Error('This account uses Google login. Please sign in with Google.');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

  // Save token to user
  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  // Send email using EJS template
  const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);

  if (!emailResult.success) {
    console.error('Failed to send reset email:', emailResult.error);
    throw new Error(emailResult.error || 'Failed to send reset email. Please try again later.');
  }

  return {
    success: true,
    message: 'Password reset link sent to your email.'
  };
};

// Reset password service
const resetPassword = async (token, password) => {
  if (!token || !password) {
    throw new Error('Please provide reset token and new password');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Find user with valid token (explicitly select token fields since they have select: false)
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  }).select('+resetToken +resetTokenExpiry');

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Update password and clear token
  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return {
    success: true,
    message: 'Password reset successful. Please login with your new password.'
  };
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  forgotPassword,
  resetPassword
};
