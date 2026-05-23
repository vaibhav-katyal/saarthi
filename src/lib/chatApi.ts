import api from './api';

interface ChatMessage {
  conversationId: string;
  message: string;
  intent: string;
  sources: string[];
}

interface Conversation {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: any[];
}

/**
 * Send a message in a conversation
 */
export const sendChatMessage = async (
  conversationId: string | null,
  message: string
): Promise<ChatMessage> => {
  const response = await api.post('/chat/send', {
    conversationId: conversationId || 'new',
    message,
  });
  return response.data;
};

/**
 * Get all conversations for current user
 */
export const getConversations = async (limit = 50): Promise<Conversation[]> => {
  const response = await api.get('/chat/conversations', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get a specific conversation with all messages
 */
export const getConversation = async (conversationId: string): Promise<Conversation> => {
  const response = await api.get(`/chat/conversation/${conversationId}`);
  return response.data;
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId: string): Promise<void> => {
  await api.delete(`/chat/conversation/${conversationId}`);
};

/**
 * Archive a conversation
 */
export const archiveConversation = async (conversationId: string): Promise<Conversation> => {
  const response = await api.patch(`/chat/conversation/${conversationId}/archive`);
  return response.data;
};

export default {
  sendChatMessage,
  getConversations,
  getConversation,
  deleteConversation,
  archiveConversation,
};
