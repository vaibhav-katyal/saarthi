const Conversation = require('../models/Conversation');
const { searchContext } = require('../services/ragService');
const { getUserStats } = require('../services/userStatsService');
const TestpadResult = require('../models/TestpadResult');
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Call Groq API for chat completion
 */
const callGroqAPI = async (messages, systemPrompt) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to generate AI response');
  }
};

/**
 * Detect user intent from query
 */
const detectIntent = (query) => {
  const lowerQuery = query.toLowerCase();

  if (
    lowerQuery.includes('attendance') ||
    lowerQuery.includes('lectures') ||
    lowerQuery.includes('present')
  ) {
    return 'stats_query';
  }

  if (
    lowerQuery.includes('question') ||
    lowerQuery.includes('ques') ||
    lowerQuery.includes('problem') ||
    lowerQuery.includes('prob') ||
    lowerQuery.includes('solve') ||
    lowerQuery.includes('code') ||
    lowerQuery.includes('dsa') ||
    lowerQuery.includes('linked list') ||
    lowerQuery.includes('tree') ||
    lowerQuery.includes('graph') ||
    lowerQuery.includes('array')
  ) {
    return 'question_request';
  }

  if (
    lowerQuery.includes('my results') ||
    lowerQuery.includes('how many') ||
    lowerQuery.includes('total') ||
    lowerQuery.includes('codeduel')
  ) {
    return 'stats_query';
  }

  return 'vault_query'; // Default to vault/PDF query
};

/**
 * Generate system prompt based on intent and context
 */
const generateSystemPrompt = (intent, context = '') => {
  let systemPrompt = `You are Saarthi, an AI tutor for students. Help with:
- Study materials (PDFs, notes)
- Progress stats (attendance, test results, achievements)
- DSA questions and topics
- Personalized learning guidance

Be friendly, concise, and encouraging. Use provided context for accurate answers.`;

  // Add context safely
  if (context && context.trim().length > 0) {
    // Limit context to avoid breaking the prompt
    const limitedContext = context.substring(0, 2000);
    systemPrompt += `\n\nUser Context:\n${limitedContext}`;
  }

  // Add intent-specific guidance
  if (intent === 'stats_query') {
    systemPrompt += `\n\nFor statistics questions:
- Use the user context to provide specific numbers
- Be encouraging and constructive
- Suggest improvements based on their data`;
  } else if (intent === 'question_request') {
    systemPrompt += `\n\nFor DSA questions:
- Include difficulty level (Easy/Medium/Hard)
- Mention the data structure/topic
- Suggest problems based on their level`;
  } else if (intent === 'vault_query') {
    systemPrompt += `\n\nFor vault/study material questions:
- Reference specific content from their materials
- Quote relevant sections when helpful
- Connect to their learning goals`;
  }

  return systemPrompt;
};

/**
 * Extract question query from user message
 */
const extractQuestionQuery = (message) => {
  const lowerMsg = message.toLowerCase();
  
  // Try to extract text after common phrases
  const phrases = ['question on ', 'question about ', 'problem on ', 'problem with ', 'find ', 'solve ', 'write code for '];
  
  for (const phrase of phrases) {
    const index = lowerMsg.indexOf(phrase);
    if (index !== -1) {
      return message.substring(index + phrase.length).trim();
    }
  }
  
  // If no phrase found, remove question/problem keywords and return the rest
  let query = message.replace(/^(write|find|solve|i want|i need)\s+/i, '');
  query = query.replace(/^(question|problem|a|the)\s+/i, '');
  return query.trim();
};

/**
 * Send message in conversation (Phase 1)
 */
const sendMessage = async (userId, conversationId, userMessage, agenticMode = false) => {
  try {
    console.log(`📨 sendMessage called with agenticMode=${agenticMode}, intent will be detected`);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    let conversation = null;

    if (conversationId && conversationId !== 'new') {
      // Load existing conversation
      conversation = await Conversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        throw new Error('Conversation not found');
      }
    } else {
      // Create new conversation
      const firstMessagePreview = userMessage.substring(0, 50);
      conversation = new Conversation({
        userId,
        title: firstMessagePreview,
        messages: [],
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Detect intent
    const intent = detectIntent(userMessage);
    console.log(`🎯 Intent detected: "${intent}" | agenticMode: ${agenticMode} | message: "${userMessage}"`);

    // If agentic mode and question request, return navigation action
    if (agenticMode && intent === 'question_request') {
      const questionQuery = extractQuestionQuery(userMessage);
      console.log(`🤖 AGENTIC MODE TRIGGERED! Query: "${questionQuery}"`);
      
      const aiResponse = {
        role: 'assistant',
        content: `I found your request! Taking you to create a question about "${questionQuery}"...`,
        timestamp: new Date(),
        metadata: { intent },
      };
      
      conversation.messages.push(aiResponse);
      await conversation.save();
      
      return {
        conversationId: conversation._id,
        message: `I found your request! Taking you to create a question about "${questionQuery}"...`,
        intent,
        action: {
          type: 'navigate_to_testpad',
          questionQuery,
        },
        sources: [],
      };
    }

    // Build context for AI from Pinecone
    let context = '';
    let sources = [];

    // Always search Pinecone for relevant context
    try {
      const searchResults = await searchContext(userId, userMessage);
      
      if (searchResults && searchResults.length > 0) {
        // Filter out invalid results and build clean context
        const validResults = searchResults.filter(
          (c) => c.text && c.text.trim().length > 0
        );
        
        if (validResults.length > 0) {
          sources = validResults.map((c) => c.source || 'User Data');
          context = validResults
            .map((c, idx) => `[${c.source || 'Data'}]: ${c.text}`)
            .join('\n\n');
          
          console.log(`✓ Found ${validResults.length} relevant vectors for context`);
        }
      }
    } catch (searchError) {
      console.error('Error searching Pinecone:', searchError);
      // Continue without Pinecone context
    }

    // If no Pinecone results and it's a stats query, fallback to getUserStats
    if (!context && intent === 'stats_query') {
      try {
        const userStats = await getUserStats(userId);
        if (userStats) {
          context = `User Statistics:\n- Testpad Results: ${userStats.testpadResults?.length || 0} completed\n- Codeduel Achievements: ${userStats.codeduelAchievements?.length || 0}\n- Attendance: ${userStats.attendance?.attended || 0}/${userStats.attendance?.delivered || 0} lectures (${userStats.attendance?.percentage || 0}%)`;
          sources = ['User Statistics'];
        }
      } catch (statsError) {
        console.error('Error fetching stats fallback:', statsError);
      }
    }

    // Prepare messages for Groq (keep conversation context)
    const groqMessages = conversation.messages
      .slice(-10) // Keep last 10 messages for context
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Generate system prompt
    const systemPrompt = generateSystemPrompt(intent, context);

    // Call Groq API
    const aiResponse = await callGroqAPI(groqMessages, systemPrompt);

    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      metadata: {
        sources,
        intent,
      },
    });

    // Save conversation
    await conversation.save();

    return {
      conversationId: conversation._id,
      message: aiResponse,
      intent,
      sources,
    };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};

/**
 * Get all conversations for user
 */
const getConversations = async (userId, limit = 50) => {
  try {
    const conversations = await Conversation.find({ userId, isArchived: false })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('_id title createdAt updatedAt')
      .lean();

    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

/**
 * Get specific conversation with messages
 */
const getConversation = async (userId, conversationId) => {
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

/**
 * Delete conversation
 */
const deleteConversation = async (userId, conversationId) => {
  try {
    const result = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId,
    });

    if (!result) {
      throw new Error('Conversation not found');
    }

    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

/**
 * Archive conversation
 */
const archiveConversation = async (userId, conversationId) => {
  try {
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { isArchived: true },
      { new: true }
    );

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation,
  archiveConversation,
  callGroqAPI,
  detectIntent,
};
