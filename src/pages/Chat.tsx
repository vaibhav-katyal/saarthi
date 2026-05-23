import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Trash2, Plus, MessageCircle, ArrowRight, Zap } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  metadata?: {
    sources?: string[];
    intent?: string;
    action?: {
      type: string;
      questionQuery?: string;
    };
  };
}

interface Conversation {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [agenticMode, setAgenticMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await api.get('/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchConversation = async (conversationId: string) => {
    try {
      const response = await api.get(`/chat/conversation/${conversationId}`);
      setMessages(response.data.messages || []);
      setCurrentConversation(conversationId);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversation(null);
    setInput('');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      setLoading(true);
      const userMessage: Message = {
        role: 'user',
        content: input,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');

      console.log(`📤 Sending message with agenticMode=${agenticMode}`);

      const response = await api.post('/chat/send', {
        conversationId: currentConversation || 'new',
        message: input,
        agenticMode,
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString(),
        metadata: {
          sources: response.data.sources,
          intent: response.data.intent,
          action: response.data.action,
        },
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Handle agentic actions
      if (response.data.action?.type === 'navigate_to_testpad') {
        const query = response.data.action.questionQuery;
        console.log(`🎯 Navigating to testpad with query: "${query}"`);
        toast.success('Opening testpad...');
        setTimeout(() => {
          navigate(`/testpad?question=${encodeURIComponent(query)}`);
        }, 500);
      } else if (response.data.action?.type === 'navigate_to_roadmap') {
        const topic = response.data.action.topic;
        console.log(`🗺️ Navigating to roadmap with topic: "${topic}"`);
        toast.success('Opening roadmap...');
        setTimeout(() => {
          navigate(`/roadmap?topic=${encodeURIComponent(topic)}`);
        }, 500);
      } else if (response.data.action?.type === 'navigate_to_guide') {
        const topic = response.data.action.topic;
        console.log(`📖 Navigating to guide with topic: "${topic}"`);
        toast.success('Opening guide...');
        setTimeout(() => {
          navigate(`/roadmap?topic=${encodeURIComponent(topic)}&tab=guide`);
        }, 500);
      } else if (response.data.action?.type === 'navigate_to_mcq') {
        const { topic, subtopic, level, numQuestions } = response.data.action;
        console.log(`❓ Navigating to MCQ with topic: "${topic}"`);
        toast.success('Opening MCQ...');
        const params = new URLSearchParams({
          topic: topic || '',
          subtopic: subtopic || '',
          difficulty: level || 'Intermediate',
          numQuestions: numQuestions?.toString() || '5',
        });
        setTimeout(() => {
          navigate(`/mcq?${params.toString()}`);
        }, 500);
      } else {
        console.log(`📨 No action in response. action:`, response.data.action);
      }

      // Update current conversation if it's new
      if (!currentConversation) {
        setCurrentConversation(response.data.conversationId);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove the user message if sending failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await api.delete(`/chat/conversation/${conversationId}`);
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      if (currentConversation === conversationId) {
        startNewChat();
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Conversations List */}
      <div className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-violet-500/10">
          <button
            onClick={startNewChat}
            className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-background font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            New Chat
          </button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          {loadingConversations ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-500/50" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-300 flex items-start justify-between group backdrop-blur-sm border ${
                    currentConversation === conv._id
                      ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-100'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-foreground'
                  }`}
                >
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => fetchConversation(conv._id)}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1.5 hover:bg-red-500/20 rounded transition-all duration-300 hover:border hover:border-red-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-background via-background to-violet-950/10">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm px-6 py-4 bg-gradient-to-r from-black/50 to-violet-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-lg border border-cyan-500/30">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {currentConversation
                    ? conversations.find((c) => c._id === currentConversation)?.title || 'Chat'
                    : 'New Chat'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask me about your studies, performance, or learning materials
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setAgenticMode(!agenticMode);
                toast.success(`Agentic mode ${!agenticMode ? 'enabled ⚡' : 'disabled ✓'}`);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 border ${
                agenticMode
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 hover:bg-violet-500/30'
                  : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">{agenticMode ? 'Agentic ⚡' : 'Normal'}</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                  <MessageCircle className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Start a Conversation</h2>
                <p className="text-muted-foreground">
                  Ask me about your uploaded materials, performance stats, or DSA concepts
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-5 py-3.5 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-background rounded-br-none shadow-lg shadow-cyan-500/20 ml-12'
                        : 'bg-white/10 border border-white/20 text-foreground rounded-bl-none hover:bg-white/15 mr-12'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                    {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-current/20">
                        <p className="text-xs font-semibold mb-2 opacity-75 flex items-center gap-1">
                          <span>📚 Sources</span>
                        </p>
                        <div className="space-y-1.5">
                          {msg.metadata.sources.map((source, sidx) => (
                            <div key={sidx} className="flex items-start gap-2 text-xs opacity-75 bg-black/20 px-2 py-1 rounded">
                              <span className="flex-shrink-0 mt-0.5">📄</span>
                              <span>{source}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.metadata?.intent && (
                      <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-current/40 rounded-full"></span>
                        {msg.metadata.intent.replace(/_/g, ' ').toLowerCase()}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/20 text-foreground px-5 py-3.5 rounded-2xl rounded-bl-none backdrop-blur-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/40 backdrop-blur-sm px-6 py-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="w-full min-h-12 max-h-32 p-3.5 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 text-foreground placeholder-muted-foreground resize-none transition-all duration-300 disabled:bg-white/5 disabled:cursor-not-allowed"
                disabled={loading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 disabled:from-cyan-500/50 disabled:to-violet-500/50 text-background font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
