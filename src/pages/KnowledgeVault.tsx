import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import {
  Link2,
  Code2,
  FileText,
  Plus,
  Search,
  Grid3X3,
  List,
  Sparkles,
  ExternalLink,
  X,
  Trash2,
} from "lucide-react";
import { generateAISummary } from "@/lib/ai"; // AI helper for summaries
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";
import { toast } from "@/hooks/use-toast";

// Set up PDF.js worker with proper path
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

type ItemType = "link" | "snippet" | "pdf";
type ViewMode = "grid" | "list";

interface VaultItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  tags: string[];
  date: string;
  url?: string;
  preview?: string;
  fileName?: string;
  fileSize?: number;
  fileData?: string;
  folder?: string;        // optional folder assignment
  summary?: string;       // AI-generated summary
}

const initialItems: VaultItem[] = [
  {
    id: "1",
    type: "link",
    title: "React Server Components Deep Dive",
    description: "Comprehensive guide on RSC architecture and patterns",
    tags: ["React", "Frontend"],
    date: "2 hours ago",
    url: "https://react.dev",
    folder: "Frontend",
  },
  {
    id: "2",
    type: "snippet",
    title: "Binary Search Implementation",
    description: "Optimized binary search with edge case handling",
    tags: ["DSA", "Python"],
    date: "Yesterday",
    preview: "def binary_search(arr, target):\n    lo, hi = 0, len(arr)-1\n    ...",
    folder: "Algorithms",
  },
  {
    id: "3",
    type: "pdf",
    title: "Operating Systems – Chapter 5",
    description: "Process scheduling algorithms and deadlock prevention",
    tags: ["OS", "Theory"],
    date: "3 days ago",
    folder: "Operating Systems",
  },
  {
    id: "4",
    type: "link",
    title: "System Design Primer",
    description: "Learn how to design large-scale systems",
    tags: ["System Design"],
    date: "1 week ago",
    url: "https://github.com",
  },
  {
    id: "5",
    type: "snippet",
    title: "JWT Auth Middleware",
    description: "Express.js middleware for JWT token validation",
    tags: ["Node.js", "Auth"],
    date: "4 days ago",
    preview: "const verifyToken = (req, res, next) => {\n  const token = req.headers...",
  },
  {
    id: "6",
    type: "pdf",
    title: "Database Normalization Notes",
    description: "1NF to BCNF with examples and exercises",
    tags: ["DBMS", "Notes"],
    date: "5 days ago",
  },
];

const typeConfig = {
  link: { icon: Link2, label: "Link" },
  snippet: { icon: Code2, label: "Snippet" },
  pdf: { icon: FileText, label: "PDF" },
};

const filterOptions: { label: string; value: ItemType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Links", value: "link" },
  { label: "Snippets", value: "snippet" },
  { label: "PDFs", value: "pdf" },
];

// legacy mock summaries removed; real summaries are generated via AI when files are added or on request.


export default function KnowledgeVault() {
  const [items, setItems] = useState<VaultItem[]>(initialItems);
  const [view, setView] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ type: "link" as ItemType, title: "", description: "", url: "", tags: "", preview: "", file: null as File | null, folder: "" });

  // folders that exist in the system (in-memory for now)
  const [folders, setFolders] = useState<string[]>(() => {
    const existing = initialItems
      .map((i) => i.folder)
      .filter((f): f is string => !!f);
    return Array.from(new Set(existing));
  });
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [suggestedFolder, setSuggestedFolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [dropFiles, setDropFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const extractFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // Text-based files
      if (file.type.startsWith("text/") || file.name.endsWith(".json") || file.name.endsWith(".md") || file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve(content);
        };
        reader.onerror = () => {
          console.error("Failed to read text file");
          resolve(`Error reading file: ${file.name}`);
        };
        reader.readAsText(file);
      } 
      // PDF files - use pdfjs
      else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            console.log("Starting PDF extraction for:", file.name);
            
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            console.log("PDF loaded, pages:", pdf.numPages);
            
            let text = `PDF: ${file.name}\n\n`;
            
            // Extract text from first 5 pages
            const maxPages = Math.min(5, pdf.numPages);
            for (let i = 1; i <= maxPages; i++) {
              try {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                text += `--- Page ${i} ---\n${pageText}\n\n`;
              } catch (pageErr) {
                console.error(`Error extracting page ${i}:`, pageErr);
                text += `--- Page ${i} ---\n[Could not extract text]\n\n`;
              }
            }
            
            if (pdf.numPages > maxPages) {
              text += `\n(Document has ${pdf.numPages} pages total, showing first ${maxPages})`;
            }
            
            console.log("PDF extraction complete, text length:", text.length);
            resolve(text);
          } catch (err) {
            console.error("PDF extraction error:", err);
            // Fallback to metadata if PDF parsing fails
            resolve(`PDF Document: "${file.name}"\nSize: ${(file.size / 1024).toFixed(2)} KB\n\nNote: Could not extract text from PDF. Summary based on filename.`);
          }
        };
        reader.onerror = () => {
          console.error("Failed to read PDF file");
          resolve(`Error reading PDF: ${file.name}`);
        };
        reader.readAsArrayBuffer(file);
      } 
      // Other file types
      else {
        resolve(`File: ${file.name}\nType: ${file.type}\nSize: ${file.size} bytes\n\nNote: This file format is not supported for content extraction.`);
      }
    });
  };

  const addDroppedFiles = (files: File[], folder: string) => {
    files.forEach(async (file) => {
      try {
        const content = await extractFileContent(file);
        console.log("File content extracted for:", file.name, "length:", content.length);
        
        const item: VaultItem = {
          id: Date.now().toString() + Math.random(),
          type: "pdf",
          title: file.name,
          description: "",
          tags: [],
          date: "Just now",
          fileName: file.name,
          fileSize: file.size,
          fileData: "", // We'll use content for summary, not storing base64
          folder,
        };
        
        console.log("Generating summary for:", item.title);
        try {
          item.summary = await generateAISummary(content);
          console.log("Summary generated:", item.summary?.substring(0, 100));
        } catch (err) {
          console.warn("AI summary error", err);
        }
        
        setItems((prev) => [item, ...prev]);
      } catch (err) {
        console.error("Error processing file:", file.name, err);
        toast({ title: "Error processing file", variant: "destructive" });
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    // attempt to deduce folder name from path or type
    const file = files[0];
    let folderName = "";
    const wp = (file as any).webkitRelativePath;
    if (wp && wp.includes("/")) {
      folderName = wp.split("/")[0];
    } else {
      folderName = file.type.split("/")[0] || file.name.split(".")[0];
    }
    if (folders.includes(folderName)) {
      addDroppedFiles(files, folderName);
    } else {
      setSuggestedFolder(folderName);
      setNewFolderName(folderName);
      setDropFiles(files);
      setShowFolderModal(true);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders((prev) => [...prev, newFolderName]);
    addDroppedFiles(dropFiles, newFolderName);
    setShowFolderModal(false);
    setDropFiles([]);
  };


  // Summarize modal state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryTitle, setSummaryTitle] = useState("");
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [summarizing, setSummarizing] = useState(false);

  const filtered = items.filter((item) => {
    if (filter !== "all" && item.type !== filter) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = async () => {
    if (!newItem.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (newItem.type === "pdf" && !newItem.file) {
      toast({ title: "PDF file is required", variant: "destructive" });
      return;
    }

    const folderToUse = newItem.folder?.trim();
    if (folderToUse && !folders.includes(folderToUse)) {
      setFolders((prev) => [...prev, folderToUse]);
    }

    // Convert file to data URL if it's a PDF
    if (newItem.type === "pdf" && newItem.file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        const content = await extractFileContent(newItem.file);
        const item: VaultItem = {
          id: Date.now().toString(),
          type: newItem.type,
          title: newItem.title,
          description: newItem.description,
          tags: newItem.tags.split(",").map((t) => t.trim()).filter(Boolean),
          date: "Just now",
          url: newItem.type === "link" ? newItem.url : undefined,
          preview: newItem.type === "snippet" ? newItem.preview : undefined,
          fileName: newItem.type === "pdf" && newItem.file ? newItem.file.name : undefined,
          fileSize: newItem.type === "pdf" && newItem.file ? newItem.file.size : undefined,
          fileData: fileData,
          folder: folderToUse || undefined,
        };
        // generate AI summary in background using actual file content
        try {
          item.summary = await generateAISummary(content);
        } catch (err) {
          console.warn("AI summary failed", err);
        }
        setItems((prev) => [item, ...prev]);
        setNewItem({ type: "link", title: "", description: "", url: "", tags: "", preview: "", file: null, folder: "" });
        setShowAddModal(false);
        toast({ title: "Item added to vault!" });
      };
      reader.readAsDataURL(newItem.file);
    } else {
      // For links and snippets, generate summary from content
      let contentForSummary = "";
      if (newItem.type === "link") {
        contentForSummary = `Link: ${newItem.title}\nURL: ${newItem.url}\nDescription: ${newItem.description}`;
      } else if (newItem.type === "snippet") {
        contentForSummary = `Snippet: ${newItem.title}\n\n${newItem.preview}\n\nDescription: ${newItem.description}`;
      }
      
      const item: VaultItem = {
        id: Date.now().toString(),
        type: newItem.type,
        title: newItem.title,
        description: newItem.description,
        tags: newItem.tags.split(",").map((t) => t.trim()).filter(Boolean),
        date: "Just now",
        url: newItem.type === "link" ? newItem.url : undefined,
        preview: newItem.type === "snippet" ? newItem.preview : undefined,
        folder: folderToUse || undefined,
      };
      
      // Generate AI summary for links and snippets
      if (contentForSummary) {
        try {
          item.summary = await generateAISummary(contentForSummary);
        } catch (err) {
          console.warn("AI summary failed", err);
        }
      }
      
      setItems((prev) => [item, ...prev]);
      setNewItem({ type: "link", title: "", description: "", url: "", tags: "", preview: "", file: null, folder: "" });
      setShowAddModal(false);
      toast({ title: "Item added to vault!" });
    }
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Item removed from vault" });
  };

  const handleSummarize = async (item: VaultItem) => {
    setSummaryTitle(item.title);
    setShowSummary(true);
    setSummaryPoints([]);

    // if we already generated a summary before just show it
    if (item.summary) {
      const parts = item.summary.split("\n").filter(Boolean);
      parts.forEach((point, i) => {
        setTimeout(() => {
          setSummaryPoints((prev) => [...prev, point]);
          if (i === parts.length - 1) setSummarizing(false);
        }, 600 * (i + 1));
      });
      return;
    }

    setSummarizing(true);
    let content = item.fileData || item.preview || item.url || item.description;
    try {
      const summary = await generateAISummary(content || "");
      // persist to item
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, summary } : i))
      );
      let parts = summary.split("\n").map(p => p.trim()).filter(Boolean);
      // drop filler lines or bullets that look like preamble or mention 'summary'
      parts = parts.filter(p => !/^(?:ok(?:ay)?|sure|here(?:'s)?|alright)[\s,:-]/i.test(p));
      parts = parts.filter(p => !/summary/i.test(p));
      parts.forEach((point, i) => {
        setTimeout(() => {
          setSummaryPoints((prev) => [...prev, point]);
          if (i === parts.length - 1) setSummarizing(false);
        }, 600 * (i + 1));
      });
    } catch (err) {
      console.error("summarization error", err);
      setSummaryPoints(["Failed to generate summary."]);
      setSummarizing(false);
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenPDF = (fileData: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileData;
    link.target = "_blank";
    link.download = fileName;
    link.click();
  };

  return (
    <PageWrapper title="Knowledge Vault" subtitle="Your curated library of links, code & documents">
      {/* Toolbar + drop zone */}
      <div
        className="relative"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* overlay while dragging */}
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/20 backdrop-blur-sm pointer-events-none">
            <p className="text-lg font-medium text-primary-foreground">Drop files or folders here</p>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-c
        enter gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                filter === opt.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-44 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
            />
          </div>
          <button
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            className="btn-ghost p-1.5 rounded-lg"
          >
            {view === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Items grid */}
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-2"
        }
      >
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No items found. Try adjusting your filters or add a new item.
          </div>
        )}
        {filtered.map((item) => {
          const cfg = typeConfig[item.type];
          const Icon = cfg.icon;
          return (
            <GlassCard key={item.id} hover>
              <div className="flex items-start justify-between mb-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                  <Icon className="h-3 w-3" />
                  {cfg.label}
                </span>
                {item.folder && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {item.folder}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  {item.type === "pdf" && (
                    <button
                      onClick={() => handleSummarize(item)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-primary hover:bg-secondary transition-colors"
                    >
                      <Sparkles className="h-3 w-3" />
                      Summarize
                    </button>
                  )}
                  {item.url && (
                    <button
                      onClick={() => handleOpenLink(item.url!)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-medium text-sm text-foreground leading-snug mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {item.description}
              </p>
              {item.summary && (
                <p className="text-xs text-primary mb-3">📌 AI summary available</p>
              )}
              {item.preview && (
                <pre className="mb-3 rounded-md bg-muted p-2.5 text-[11px] text-muted-foreground font-mono line-clamp-3 overflow-hidden">
                  {item.preview}
                </pre>
              )}
              {item.fileName && (
                <div 
                  onClick={() => item.fileData && handleOpenPDF(item.fileData, item.fileName || "document.pdf")}
                  className="mb-3 rounded-md bg-secondary p-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <p className="text-xs font-medium text-foreground mb-1">
                    📄 {item.fileName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.fileSize ? `${(item.fileSize / 1024).toFixed(2)} KB` : "PDF"}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground">{item.date}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
      {/* wrapper end for drag/drop zone */}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-foreground">Add to Vault</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Type selector */}
            <div className="flex gap-1.5 mb-4">
              {(["link", "snippet", "pdf"] as ItemType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewItem((p) => ({ ...p, type: t }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    newItem.type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
              />
              <input
                type="text"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
              />
              {newItem.type === "pdf" && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-foreground">PDF File *</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setNewItem((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors cursor-pointer"
                    />
                    {newItem.file && (
                      <div className="mt-2 rounded-lg bg-secondary p-2.5">
                        <p className="text-xs font-medium text-foreground">
                          📄 {newItem.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(newItem.file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* optional folder assignment */}
              <input
                type="text"
                placeholder="Folder (optional)"
                value={newItem.folder}
                onChange={(e) => setNewItem((p) => ({ ...p, folder: e.target.value }))}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
              />

              {newItem.type === "link" && (
                <input
                  type="url"
                  placeholder="URL (https://...)"
                  value={newItem.url}
                  onChange={(e) => setNewItem((p) => ({ ...p, url: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
                />
              )}
              {newItem.type === "snippet" && (
                <textarea
                  placeholder="Code snippet..."
                  value={newItem.preview}
                  onChange={(e) => setNewItem((p) => ({ ...p, preview: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-mono outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors resize-none"
                />
              )}
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={newItem.tags}
                onChange={(e) => setNewItem((p) => ({ ...p, tags: e.target.value }))}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowAddModal(false)} className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder suggestion modal (triggered by drop) */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowFolderModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-foreground">Folder Assignment</h2>
              <button onClick={() => setShowFolderModal(false)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              We detected a folder suggestion based on the file path: <strong>{suggestedFolder}</strong>
            </p>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
            />
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowFolderModal(false)} className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                Cancel
              </button>
              <button onClick={handleCreateFolder} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Create & assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summarize Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowSummary(false)}>
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">AI Summary</h2>
              </div>
              <button onClick={() => setShowSummary(false)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{summaryTitle}</p>
            <div className="space-y-3">
              {summaryPoints.map((point, i) => (
                <div key={i} className="flex gap-3 rounded-lg bg-muted p-3">
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">{point}</p>
                </div>
              ))}
              {summarizing && (
                <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Analyzing document...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
