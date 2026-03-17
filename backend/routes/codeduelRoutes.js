const express = require('express');
const router = express.Router();
const codeduelController = require('../controllers/codeduelController');

// Get all achievements for a user
router.get('/achievements/:userId', codeduelController.getUserAchievements);

// Get user stats
router.get('/stats/:userId', codeduelController.getUserStats);

// Save a new achievement
router.post('/achievements', codeduelController.saveAchievement);

module.exports = router;
