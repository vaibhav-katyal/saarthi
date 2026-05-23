const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation,
  archiveConversation,
} = require('../controllers/chatController');

// All chat routes require authentication
router.use(protect);

/**
 * POST /api/chat/send
 * Send a message in a conversation
 */
router.post('/send', async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    
    // Extract user ID - handle both _id and id fields
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const result = await sendMessage(userId, conversationId, message);
    res.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
});

/**
 * GET /api/chat/conversations
 * Get all conversations for user
 */
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const limit = req.query.limit || 50;

    const conversations = await getConversations(userId, limit);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * GET /api/chat/conversation/:id
 * Get specific conversation with all messages
 */
router.get('/conversation/:id', async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { id } = req.params;

    const conversation = await getConversation(userId, id);
    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res
      .status(404)
      .json({ error: error.message || 'Conversation not found' });
  }
});

/**
 * DELETE /api/chat/conversation/:id
 * Delete a conversation
 */
router.delete('/conversation/:id', async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { id } = req.params;

    const result = await deleteConversation(userId, id);
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res
      .status(404)
      .json({ error: error.message || 'Failed to delete conversation' });
  }
});

/**
 * PATCH /api/chat/conversation/:id/archive
 * Archive a conversation
 */
router.patch('/conversation/:id/archive', async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { id } = req.params;

    const conversation = await archiveConversation(userId, id);
    res.json(conversation);
  } catch (error) {
    console.error('Error archiving conversation:', error);
    res
      .status(404)
      .json({ error: error.message || 'Failed to archive conversation' });
  }
});

module.exports = router;
