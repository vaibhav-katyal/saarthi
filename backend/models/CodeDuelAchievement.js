const mongoose = require('mongoose');

const CodeDuelAchievementSchema = new mongoose.Schema({
  winner: {
    type: String,
    required: true
  },
  winnerName: {
    type: String,
    required: true
  },
  opponent: {
    type: String,
    required: true
  },
  opponentName: {
    type: String,
    required: true
  },
  problemTitle: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  roomId: {
    type: String,
    required: true
  },
  winTime: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('CodeDuelAchievement', CodeDuelAchievementSchema);
