const express = require('express');
const { 
  registerUser, 
  loginUser, 
  googleAuth, 
  forgotPassword, 
  resetPassword, 
  verifyResetToken 
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;

