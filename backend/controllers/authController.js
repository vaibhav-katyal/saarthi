const User = require('../models/User');
const jwt = require('jsonwebtoken');
const https = require('https');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to sign JWT
const getSignedJwtToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_development';
  const expire = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id }, secret, {
    expiresIn: expire
  });
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = getSignedJwtToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
    }
  });
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

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    user = await User.create({
      name,
      email,
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, error: 'This account uses Google login. Please sign in with Google.' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { credential, userInfo } = req.body;

    if (!credential || !userInfo) {
      return res.status(400).json({ success: false, error: 'Google credential and userInfo are required' });
    }

    // Server-side verification: call Google's userinfo API with the access token
    let verifiedInfo;
    try {
      verifiedInfo = await verifyGoogleAccessToken(credential);
      console.log('Google token verified for:', verifiedInfo.email);
    } catch (verifyErr) {
      console.error('Google token verification failed:', verifyErr.message);
      return res.status(401).json({ success: false, error: 'Invalid Google access token' });
    }

    // Use the server-verified data for security
    const googleId = verifiedInfo.sub;
    const email = verifiedInfo.email;
    const name = verifiedInfo.name;
    const picture = verifiedInfo.picture;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Could not retrieve email from Google' });
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
      }
    } else {
      // Update avatar if changed
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        await user.save();
      }
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Google auth error:', error.message || error);
    res.status(500).json({ success: false, error: 'Google authentication failed: ' + (error.message || 'Unknown error') });
  }
};
