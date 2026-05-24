import { useState, useEffect, useRef, useCallback } from 'react';
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
  MessageSquare,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


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

const normalSuggestions = [
  'Check my attendance',
  'Summarize uploaded notes',
  'Generate DSA roadmap',
  'Analyze coding performance',
  'Find weak subjects',
];

const agenticSuggestions = [
  'I want to practice a question on ',
  'I want an AI roadmap for ',
  'I want an AI guide for ',
  'I want 10 MCQs on the topic ',
];

/* ── Code Block with copy button ── */
function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.06] bg-[#0d0d0d]">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/[0.06]">
        <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-medium">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed font-mono text-white/80">
        <code>{children}</code>
      </pre>
    </div>
  );
}

/* ── Collapsible references toggle ── */
function ReferencesToggle({ sources }: { sources: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors"
        title="View references"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-[0.15em] font-medium">
          {sources.length === 1 ? 'source' : 'sources'}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 mt-2">
              {sources.map((source, sidx) => (
                <div
                  key={sidx}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                >
                  <FileText className="w-3 h-3 text-white/40" />
                  <span className="text-[11px] text-white/60">{source}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  const [loadingStatus, setLoadingStatus] = useState('Processing your request...');


  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      setLoadingStatus('Processing your request...');

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
        setLoadingStatus('Opening Testpad...');
        setTimeout(() => {
          navigate(`/testpad?question=${encodeURIComponent(query)}`);
        }, 800);
      } else if (response.data.action?.type === 'navigate_to_roadmap') {
        const topic = response.data.action.topic;
        setLoadingStatus('Opening Roadmap...');
        setTimeout(() => {
          navigate(`/roadmap?topic=${encodeURIComponent(topic)}`);
        }, 800);
      } else if (response.data.action?.type === 'navigate_to_guide') {
        const topic = response.data.action.topic;
        setLoadingStatus('Opening Guide...');
        setTimeout(() => {
          navigate(`/roadmap?topic=${encodeURIComponent(topic)}&tab=guide`);
        }, 800);
      } else if (response.data.action?.type === 'navigate_to_mcq') {
        const { topic, subtopic, level, numQuestions } = response.data.action;
        setLoadingStatus('Opening MCQs...');
        const params = new URLSearchParams({
          topic: topic || '',
          subtopic: subtopic || '',
          difficulty: level || 'Intermediate',
          numQuestions: numQuestions?.toString() || '5',
        });
        setTimeout(() => {
          navigate(`/mcq?${params.toString()}`);
        }, 800);
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
    setAgenticMode(!agenticMode);
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
              className="absolute -inset-1 rounded-[22px] bg-gradient-to-r from-cyan-500/25 via-violet-500/10 to-cyan-500/25 blur-[12px] opacity-90 animate-pulse pointer-events-none"
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
        <div ref={scrollRef} className="flex-1 w-full relative overflow-y-auto scrollbar-thin">
          <div className="min-h-full flex flex-col justify-between">
            {messages.length === 0 ? (
              /* Empty Hero State - Redesigned to align greeting, chatbox, and suggestions */
              <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-[calc(100vh-5rem)]">
                <div className="w-full max-w-2xl flex flex-col items-center select-none">
                  
                  {/* Greeting Title - Plain elegant white text with shimmering Saarthi */}
                  <div className="flex items-center gap-3.5 mb-8 justify-center">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-white/90 leading-none">
                      How can <span className="bg-gradient-to-r from-white/70 via-white to-white/70 bg-[length:200%_auto] animate-[shimmer-sweep_3s_linear_infinite] bg-clip-text text-transparent">Saarthi</span> help today?
                    </h1>
                  </div>

                  {/* Centered Inline Input Box */}
                  <div className="w-full mb-6 text-left">
                    {renderInputBar()}
                  </div>

                  {/* Suggestions list directly under the chatbox in the center */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-xl min-h-[80px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={agenticMode ? 'agentic' : 'normal'}
                        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="flex flex-wrap items-center justify-center gap-2.5"
                      >
                        {(agenticMode ? agenticSuggestions : normalSuggestions).map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              setInput(item);
                              if (agenticMode && textareaRef.current) {
                                setTimeout(() => textareaRef.current?.focus(), 50);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl border text-xs transition-all duration-200 shadow-sm flex items-center gap-0.5 ${
                              agenticMode
                                ? 'bg-cyan-500/[0.02] hover:bg-cyan-500/[0.08] border-cyan-500/10 hover:border-cyan-500/30 text-cyan-400/70 hover:text-cyan-300'
                                : 'bg-white/[0.015] hover:bg-white/[0.04] border-white/[0.04] hover:border-white/[0.08] text-white/60 hover:text-white'
                            }`}
                          >
                            {item}

                          </button>
                        ))}
                      </motion.div>
                    </AnimatePresence>
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
                      className={`transition-all ${
                        msg.role === 'user'
                          ? 'max-w-[85%] md:max-w-[80%] bg-[#2f2f2f] text-white rounded-[22px] px-5 py-2.5 shadow-sm'
                          : 'w-full'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-[14px] font-normal tracking-wide text-white">
                          {msg.content}
                        </p>
                      ) : (
                        <div className="prose-chat leading-relaxed text-[13.5px] md:text-[14px] text-white/80">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const isBlock = match || (typeof children === 'string' && children.includes('\n'));
                                if (isBlock) {
                                  return <CodeBlock language={match?.[1] || ''}>{String(children).replace(/\n$/, '')}</CodeBlock>;
                                }
                                return <code className="bg-white/[0.06] text-cyan-300/90 px-1.5 py-0.5 rounded text-[12px] font-mono" {...props}>{children}</code>;
                              },
                              p({ children }) {
                                return <p className="mb-3 last:mb-0">{children}</p>;
                              },
                              strong({ children }) {
                                return <strong className="font-semibold text-white/95">{children}</strong>;
                              },
                              ul({ children }) {
                                return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
                              },
                              ol({ children }) {
                                return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
                              },
                              li({ children }) {
                                return <li className="text-white/80">{children}</li>;
                              },
                              h1({ children }) {
                                return <h1 className="text-lg font-bold text-white/95 mb-2 mt-4">{children}</h1>;
                              },
                              h2({ children }) {
                                return <h2 className="text-base font-bold text-white/95 mb-2 mt-3">{children}</h2>;
                              },
                              h3({ children }) {
                                return <h3 className="text-sm font-bold text-white/95 mb-1 mt-2">{children}</h3>;
                              },
                              blockquote({ children }) {
                                return <blockquote className="border-l-2 border-cyan-500/30 pl-3 my-2 text-white/60 italic">{children}</blockquote>;
                              },
                              a({ href, children }) {
                                return <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">{children}</a>;
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Collapsible References */}
                      {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                        <ReferencesToggle sources={msg.metadata.sources} />
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading Bubble */}
                {loading && (
                  <div className="w-full">
                    <div className="py-2">
                      {agenticMode ? (
                        <div className="flex items-center gap-2.5 py-1 select-none">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={loadingStatus}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.25 }}
                              className="text-[13px] font-medium tracking-wide shimmer-text"
                            >
                              {loadingStatus}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                      ) : (
                        /* Clean Standard Mode – bouncing dots */
                        <div className="flex items-center gap-1.5 py-2.5 px-1 select-none">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-2 h-2 rounded-full bg-white/40"
                              animate={{ y: [0, -6, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: 'easeInOut',
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
              {/* Vacant padding spacer so scroll covers bottom float */}
              {messages.length > 0 && <div className="h-40 w-full flex-shrink-0" />}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

        {/* Floating Chat Input Bar at the bottom – seamless gradient bg */}
        {messages.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none px-6 pb-6 pt-12 bg-gradient-to-t from-[#030303] via-[#030303] to-transparent">
            <div className="max-w-2xl mx-auto w-full pointer-events-auto">
              {renderInputBar()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}