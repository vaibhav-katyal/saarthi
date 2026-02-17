import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Download, Copy, Check, Send, Loader2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface DocData {
  id: string;
  title: string;
  fileName?: string;
  fileSize?: number;
  content: string;
  description: string;
  createdAt: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DocumentViewerProps {
  document: DocData | null;
  fileData: string | null;
  onClose: () => void;
}

const FilePreview = ({ fileName, fileData }: { fileName?: string; fileData?: string }) => {
  const [loading, setLoading] = useState(true);
  const [pdfPages, setPdfPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(false);
  }, [fileData]);

  if (!fileName || !fileData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No file to preview</p>
      </div>
    );
  }

  const fileExtension = fileName.split(".").pop()?.toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension || "");
  const isPdf = fileExtension === "pdf";
  const isText = ["txt", "md", "code", "js", "tsx", "ts", "py", "java"].includes(fileExtension || "");

  return (
    <div className="h-full flex flex-col bg-foreground/5 rounded-xl overflow-hidden">
      {loading && !isImage ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : isImage ? (
        <img
          src={fileData}
          alt={fileName}
          className="w-full h-full object-contain p-4"
          onLoad={() => setLoading(false)}
        />
      ) : isPdf ? (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto flex items-center justify-center bg-foreground/10">
            <Document
              file={fileData}
              onLoadSuccess={({ numPages }) => {
                setPdfPages(numPages);
                setLoading(false);
              }}
              loading={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
              error={<div className="text-sm text-destructive">Failed to load PDF</div>}
            >
              <Page pageNumber={currentPage} scale={1.5} />
            </Document>
          </div>
          {pdfPages > 1 && (
            <div className="flex-shrink-0 flex items-center justify-center gap-3 p-3 border-t border-border/30 bg-foreground/5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {pdfPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pdfPages, p + 1))}
                disabled={currentPage === pdfPages}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : isText ? (
        <pre className="flex-1 overflow-auto p-4 text-xs font-mono whitespace-pre-wrap break-words text-foreground/80">
          {atob(fileData.split(",")[1] || "")}
        </pre>
      ) : (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
          <div className="text-center">
            <p className="font-medium mb-2">📎 File: {fileName}</p>
            <p className="text-xs opacity-60">Preview not available for this file type</p>
          </div>
        </div>
      )}
    </div>
  );
};

const AISummarySection = ({
  document,
  onQuestion,
  isLoading,
}: {
  document: DocData;
  onQuestion: (question: string) => void;
  isLoading: boolean;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [summary, setSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate AI summary generation
    const timer = setTimeout(() => {
      const mockSummary = `📋 **Document Summary**\n\n${document.description || "This document contains important information."}\n\n**Key Points:**\n- Content Type: ${document.fileName ? document.fileName.split(".").pop()?.toUpperCase() : "Text"}\n- Created: ${new Date(document.createdAt).toLocaleDateString()}\n- Status: Ready for Q&A\n\nAsk me anything about this document!`;
      setSummary(mockSummary);
      setLoadingSummary(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [document]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `I understand your question about "${inputValue}". Based on the document provided, I can help you find relevant information. To provide accurate answers, please ensure the document content is properly indexed.`,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 800);

    onQuestion(inputValue);
  };

  const copyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Summary Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">AI Summary</h3>
        </div>
        {loadingSummary ? (
          <GlassCard variant="subtle" className="p-4 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Generating summary...</span>
          </GlassCard>
        ) : (
          <GlassCard variant="subtle" className="p-4 relative">
            <button
              onClick={() => copyContent(summary, "summary")}
              className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              title="Copy"
            >
              {copiedId === "summary" ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <p className="text-xs text-foreground/80 whitespace-pre-wrap pr-8">{summary}</p>
          </GlassCard>
        )}
      </div>

      {/* Messages Section */}
      <div className="flex-1 flex flex-col min-h-0 gap-2">
        <h3 className="font-semibold text-sm">Ask Questions</h3>
        <div className="flex-1 overflow-y-auto space-y-2 rounded-xl bg-foreground/5 p-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
              <p>Ask anything about this document...</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg px-3 py-2 text-xs max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="flex-shrink-0 flex gap-2">
        <input
          type="text"
          placeholder="Ask about the document..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={isLoading}
          className="flex-1 glass-input rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

const DocumentViewer = ({ document:doc, fileData, onClose }: DocumentViewerProps) => {
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!doc) return null;

  const downloadFile = () => {
    if (!fileData) return;
    const link = document.createElement("a");
    link.href = fileData;
    link.download = doc.fileName || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-6xl h-[90vh] bg-background rounded-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 p-4 border-b border-border/50">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">{doc.title}</h2>
            {doc.fileName && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{doc.fileName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {doc.fileName && fileData && (
              <button
                onClick={downloadFile}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={copyContent.bind(null, doc.content, "title")}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Copy content"
            >
              {copiedId === "title" ? (
                <Check className="h-5 w-5 text-primary" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-4 overflow-hidden p-4">
          {/* Left: File Preview */}
          <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-border/50 bg-foreground/5">
            <FilePreview fileName={doc.fileName} fileData={fileData} />
          </div>

          {/* Right: AI Summary & Q&A */}
          <div className="w-96 flex flex-col gap-2 min-w-0">
            <AISummarySection
              document={doc}
              onQuestion={(q) => {
                setIsQaLoading(true);
                setTimeout(() => setIsQaLoading(false), 1000);
              }}
              isLoading={isQaLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <p>{new Date(doc.createdAt).toLocaleDateString()}</p>
          {doc.description && <p className="max-w-xs truncate">{doc.description}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DocumentViewer;
