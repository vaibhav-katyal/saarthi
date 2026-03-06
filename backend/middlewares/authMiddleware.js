const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_development';
    const decoded = jwt.verify(token, secret);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User does not exist anymore' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};
