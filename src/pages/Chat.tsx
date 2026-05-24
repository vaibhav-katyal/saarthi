import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Loader2,
  Send,
  Trash2,
  Plus,
  FileText,
  History,
  X,
  Sparkles,
  Mic,
  ArrowRight,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
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
      topic?: string;
      subtopic?: string;
      level?: string;
      numQuestions?: number;
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
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [agenticMode, setAgenticMode] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [agenticPulse, setAgenticPulse] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-resize input textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

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
      setHistoryOpen(false);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversation(null);
    setInput('');
    setHistoryOpen(false);
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

      if (response.data.action?.type === 'navigate_to_testpad') {
        const query = response.data.action.questionQuery;
        toast.success('Opening testpad...');
        setTimeout(() => {
          navigate(`/testpad?question=${encodeURIComponent(query)}`);
        }, 500);
      } else if (response.data.action?.type === 'navigate_to_roadmap') {
        const topic = response.data.action.topic;
        toast.success('Opening roadmap...');
        setTimeout(() => {
          navigate(`/roadmap?topic=${encodeURIComponent(topic)}`);
        }, 500);
      } else if (response.data.action?.type === 'navigate_to_guide') {
        const topic = response.data.action.topic;
        toast.success('Opening guide...');
        setTimeout(() => {
          navigate(`/roadmap?topic=${encodeURIComponent(topic)}&tab=guide`);
        }, 500);
      } else if (response.data.action?.type === 'navigate_to_mcq') {
        const { topic, subtopic, level, numQuestions } = response.data.action;
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
      }

      if (!currentConversation) {
        setCurrentConversation(response.data.conversationId);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await api.delete(`/chat/conversation/${conversationId}`);
      setConversations((prev) =>
        prev.filter((c) => c._id !== conversationId)
      );
      if (currentConversation === conversationId) {
        startNewChat();
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleToggleAgentic = () => {
    const nextState = !agenticMode;
    setAgenticMode(nextState);
    if (nextState) {
      setAgenticPulse(true);
      setTimeout(() => setAgenticPulse(false), 800);
    }
  };


  const renderInputBar = () => {
    return (
      <div className="relative group">
        {/* Outer Glow Backdrops */}
        <AnimatePresence initial={false}>
          {agenticMode ? (
            /* Radiant neon gradient side glows when Agentic Mode is active */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-1 rounded-[22px] bg-gradient-to-r from-cyan-500/25 via-violet-500/10 to-cyan-500/25 blur-[12px] opacity-90 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse pointer-events-none"
            />
          ) : (
            /* Minimal clean white/gray side glow in standard mode */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 blur-[4px] opacity-70 group-hover:opacity-100 transition duration-500 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Central Input Card Container */}
        <div className={`relative bg-black/90 border rounded-[20px] transition-all duration-300 ${
          agenticMode 
            ? 'border-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.06)]' 
            : 'border-white/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
        }`}>
          
          {/* Horizontal flex for expanding textarea & button elements */}
          <div className="p-3 md:p-3.5 flex flex-col gap-3">
            
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask Saarthi anything..."
              disabled={loading}
              className="w-full bg-transparent outline-none resize-none text-[13.5px] md:text-[14px] text-white placeholder:text-white/25 px-2 py-1 leading-relaxed max-h-40 min-h-[24px]"
            />

            {/* Actions Row at the bottom of the input box */}
            <div className="flex items-center justify-between border-t border-white/[0.03] pt-2 px-1">
              
              {/* Left: mode switch button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAgentic}
                  className={`h-8 px-3.5 rounded-[12px] text-[11px] font-semibold uppercase tracking-[0.15em] border transition-all duration-300 flex items-center gap-1.5 ${
                    agenticMode
                      ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${agenticMode ? 'animate-pulse' : ''}`} />
                  <span>{agenticMode ? 'Agentic Mode' : 'Normal Mode'}</span>
                </button>
              </div>

              {/* Right: Audio input and Send button */}
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 rounded-[12px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-center transition-all duration-200 text-white/50 hover:text-white"
                  title="Voice Input"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`h-8 px-3.5 rounded-[12px] font-semibold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-1.5 shadow-sm ${
                    agenticMode
                      ? 'bg-cyan-400 text-black hover:bg-cyan-300 disabled:bg-white/10 disabled:text-white/30'
                      : 'bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Send</span>
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 h-screen bg-[#030303] text-white overflow-hidden relative font-sans">
      {/* Grayscale Background Overlay & Soft Spotlight */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Subtle radial spotlights to make it feel expensive */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] bg-white/[0.015] blur-[150px] rounded-full" />
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] bg-white/[0.02] blur-[120px] rounded-full" />
      </div>

      {/* Screen-space agentic pulse ripple */}
      <AnimatePresence>
        {agenticPulse && (
          <motion.div
            initial={{ opacity: 0.6, scale: 0.96 }}
            animate={{ opacity: 0, scale: 1.04 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="fixed inset-0 pointer-events-none z-50 border-[2px] border-cyan-500/40 rounded-none shadow-[inset_0_0_80px_rgba(6,182,212,0.2)]"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-white/[0.04] bg-black/40 backdrop-blur-md">
          {/* New Chat Button on Left */}
          <button
            onClick={startNewChat}
            className="h-9 px-4 rounded-[14px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-medium text-white/80 transition-all duration-200 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>

          {/* History Button on Right */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="h-9 w-9 rounded-[14px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-center transition-all duration-200 relative text-white/80"
            title="Chat History"
          >
            <History className="w-4 h-4" />
            {conversations.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>
        </header>

        {/* Sliding History Drawer */}
        <AnimatePresence>
          {historyOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setHistoryOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 pointer-events-auto"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="fixed top-0 right-0 w-80 md:w-96 h-full bg-[#0a0a0a] border-l border-white/[0.08] backdrop-blur-2xl z-50 flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.8)] pointer-events-auto"
              >
                {/* Header */}
                <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-white/60" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Chat History</h3>
                  </div>
                  <button
                    onClick={() => setHistoryOpen(false)}
                    className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>

                {/* List Container */}
                <ScrollArea className="flex-1 p-4">
                  {loadingConversations ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <MessageSquare className="w-8 h-8 mx-auto text-white/10 mb-3" />
                      <p className="text-xs text-white/40">No conversations yet.</p>
                      <p className="text-[11px] text-white/20 mt-1">Start chatting to record your history.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {conversations.map((conv) => (
                        <div
                          key={conv._id}
                          onClick={() => fetchConversation(conv._id)}
                          className={`group flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                            currentConversation === conv._id
                              ? 'bg-white/[0.05] border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.02)]'
                              : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/[0.03] hover:border-white/[0.06]'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <p className={`text-xs font-medium truncate ${
                              currentConversation === conv._id ? 'text-white' : 'text-white/70 group-hover:text-white'
                            }`}>
                              {conv.title || 'Untitled Chat'}
                            </p>
                            <p className="text-[10px] text-white/30 mt-1">
                              {new Date(conv.updatedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv._id);
                            }}
                            className="opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] p-1.5 rounded-lg text-white/40 hover:text-red-400 transition-all duration-200"
                            title="Delete Conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.06]">
                  <button
                    onClick={startNewChat}
                    className="w-full h-10 rounded-xl bg-white text-black hover:bg-white/90 font-medium text-xs tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Session
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <ScrollArea ref={scrollRef} className="flex-1 w-full relative">
          <div className="min-h-full flex flex-col justify-between">
            {messages.length === 0 ? (
              /* Empty Hero State - Redesigned to align greeting, chatbox, and suggestions */
              <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-[calc(100vh-5rem)]">
                <div className="w-full max-w-2xl flex flex-col items-center select-none">
                  
                  {/* Greeting Title - Plain elegant white text */}
                  <div className="flex items-center gap-3.5 mb-8 justify-center">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-white/95 leading-none">
                      How can Saarthi help today?
                    </h1>
                  </div>

                  {/* Centered Inline Input Box */}
                  <div className="w-full mb-6 text-left">
                    {renderInputBar()}
                  </div>

                  {/* Suggestions list directly under the chatbox in the center */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {[
                      'Check my attendance',
                      'Summarize uploaded notes',
                      'Generate DSA roadmap',
                      'Analyze coding performance',
                      'Find weak subjects',
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() => setInput(item)}
                        className="px-4 py-2 rounded-xl bg-white/[0.015] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] text-xs text-white/60 hover:text-white transition-all duration-200 shadow-sm"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Messages Populated State */
              <div className="max-w-3xl mx-auto w-full px-6 py-12 space-y-8 flex-1">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-5 border transition-all ${
                        msg.role === 'user'
                          ? 'bg-[#121212] text-white border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                          : 'bg-white/[0.02] border-white/[0.04] backdrop-blur-xl shadow-sm'
                      }`}
                    >
                      {/* Avatar Indicator inside bubbles */}
                      <div className="flex items-center gap-2 mb-2 select-none">
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${
                          msg.role === 'user' ? 'text-white/40' : 'text-cyan-400'
                        }`}>
                          {msg.role === 'user' ? 'You' : 'Saarthi AI'}
                        </span>
                      </div>

                      <p
                        className={`whitespace-pre-wrap leading-relaxed text-[13.5px] font-normal tracking-wide md:text-[14px] ${
                          msg.role === 'user' ? 'text-white/90' : 'text-white/80'
                        }`}
                      >
                        {msg.content}
                      </p>

                      {/* Sources Section */}
                      {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/[0.04]">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">
                            References
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {msg.metadata.sources.map((source, sidx) => (
                              <div
                                key={sidx}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                              >
                                <FileText className="w-3 h-3 text-white/40" />
                                <span className="text-[11px] text-white/60">
                                  {source}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading Bubble */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.02] border border-white/[0.04] backdrop-blur-xl rounded-2xl p-5 max-w-[80%] shadow-sm">
                      {agenticMode ? (
                        /* Beautiful Agentic Mode Thinking Waveform Animation */
                        <div className="flex flex-col gap-3 py-1 select-none">
                          <div className="flex items-center gap-2 text-cyan-400">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium animate-pulse">Saarthi Agent is calculating...</span>
                          </div>
                          
                          <div className="flex items-end gap-1 h-7 pl-1">
                            {[...Array(6)].map((_, i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  height: [10, 26, 10],
                                }}
                                transition={{
                                  duration: 1.1,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: "easeInOut"
                                }}
                                className="w-1 rounded-full bg-gradient-to-t from-cyan-400 via-indigo-500 to-violet-500"
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Clean Standard Mode Spinner */
                        <div className="flex items-center gap-2.5 text-white/50 py-1.5 select-none">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white/45" />
                          <span className="text-xs tracking-wider font-light">Saarthi is typing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Vacant padding spacer so scroll covers bottom float */}
            {messages.length > 0 && <div className="h-32 w-full flex-shrink-0" />}
          </div>
        </ScrollArea>

        {/* Floating Centered Chat Input Box - Rendered only when active messages exist */}
        {messages.length > 0 && (
          <div className="absolute bottom-6 left-0 right-0 z-30 pointer-events-none px-6">
            <div className="max-w-2xl mx-auto w-full pointer-events-auto">
              {renderInputBar()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}