import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
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
  Database,
  FolderOpen,
  ChevronRight,
  AlignLeft,
  Copy,
  FolderPlus,
  Settings,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { generateAISummary } from "@/lib/ai";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ApiGuideModal } from "@/components/ApiGuideModal";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

type ItemType = "link" | "snippet" | "pdf" | "other";
type ViewMode = "grid" | "list";

interface VaultFolder {
  _id: string;
  name: string;
  parentFolder: string | null;
}

interface VaultItem {
  _id: string;
  type: ItemType;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  url?: string;
  preview?: string;
  fileName?: string;
  fileSize?: number;
  fileData?: string;
  folder?: string;
  summary?: string;
}

const typeConfig = {
  link: { icon: Link2, label: "Link", color: "text-blue-400", bg: "bg-blue-500/10", glow: "group-hover:text-blue-400" },
  snippet: { icon: Code2, label: "Snippet", color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "group-hover:text-emerald-400" },
  pdf: { icon: FileText, label: "Document", color: "text-pink-400", bg: "bg-pink-500/10", glow: "group-hover:text-pink-400" },
  other: { icon: AlignLeft, label: "Notes", color: "text-orange-400", bg: "bg-orange-500/10", glow: "group-hover:text-orange-400" },
};

const filterOptions: { label: string; value: ItemType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Links", value: "link" },
  { label: "Snippets", value: "snippet" },
  { label: "Documents", value: "pdf" },
  { label: "Other", value: "other" },
];

export default function KnowledgeVault() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: "Root" }]);
  const [view, setView] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [apiKey, setApiKey] = useState("");
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showApiGuide, setShowApiGuide] = useState(false);

  // Modals state
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState<{ show: boolean, type: ItemType | null }>({ show: false, type: null });
  const [newFolderName, setNewFolderName] = useState("");

  // Item Form State
  const [itemForm, setItemForm] = useState({
    title: "", description: "", url: "", tags: "", preview: "", file: null as File | null
  });

  // Presentation Modals (Snippet view, PDF Summary view)
  const [viewSnippet, setViewSnippet] = useState<VaultItem | null>(null);
  const [viewPdf, setViewPdf] = useState<VaultItem | null>(null);

  const fetchVaultData = async (folderId: string | null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const qs = folderId ? `?folderId=${folderId}` : "";
      const res = await fetch(`${API_BASE_URL}/vault${qs}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setFolders(json.data.folders);
        setItems(json.data.items);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to fetch vault data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultData(currentFolder);
  }, [currentFolder]);

  useEffect(() => {
    const saved = localStorage.getItem("groq_api_key");
    if (saved) setApiKey(saved);
  }, []);

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({ title: "Please enter a valid API key", variant: "destructive" });
      return;
    }
    localStorage.setItem("groq_api_key", apiKey);
    toast({ title: "API key saved successfully" });
    setShowApiSettings(false);
  };

  const navigateToFolder = (folderId: string | null, folderName: string) => {
    setCurrentFolder(folderId);
    if (!folderId) {
      setBreadcrumbs([{ id: null, name: "Root" }]);
    } else {
      const existingIdx = breadcrumbs.findIndex(b => b.id === folderId);
      if (existingIdx >= 0) {
        setBreadcrumbs(breadcrumbs.slice(0, existingIdx + 1));
      } else {
        setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
      }
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/vault/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newFolderName, parentFolder: currentFolder })
      });
      const json = await res.json();
      if (json.success) {
        setFolders([json.data, ...folders]);
        setShowFolderModal(false);
        setNewFolderName("");
        toast({ title: "Folder created" });
      } else {
        toast({ title: json.error || "Failed to create folder", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to create folder", variant: "destructive" });
    }
  };

  const extractFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = `PDF: ${file.name}\n\n`;
            const maxPages = Math.min(5, pdf.numPages);
            for (let i = 1; i <= maxPages; i++) {
              try {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                text += `--- Page ${i} ---\n${pageText}\n\n`;
              } catch (pageErr) {
                text += `--- Page ${i} ---\n[Could not extract text]\n\n`;
              }
            }
            resolve(text);
          } catch (err) {
            resolve(`PDF Document: "${file.name}"\nSize: ${(file.size / 1024).toFixed(2)} KB\n\nNote: Could not extract text from PDF. Summary based on filename.`);
          }
        };
        reader.onerror = () => resolve(`Error reading PDF: ${file.name}`);
        reader.readAsArrayBuffer(file);
      } else {
        resolve(`File: ${file.name}\nType: ${file.type}\nSize: ${file.size} bytes`);
      }
    });
  };

  const handleCreateItem = async () => {
    if (!itemForm.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const type = showItemModal.type;
    if (type === "pdf" && !itemForm.file) {
      toast({ title: "Document file is required", variant: "destructive" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("type", type!);
      formData.append("title", itemForm.title);
      formData.append("description", itemForm.description);
      formData.append("tags", itemForm.tags);
      if (itemForm.url) formData.append("url", itemForm.url);
      if (itemForm.preview) formData.append("preview", itemForm.preview);
      if (currentFolder) formData.append("folder", currentFolder);

      let summaryContent = "";
      if (type === "pdf" && itemForm.file) {
        formData.append("file", itemForm.file);
        summaryContent = await extractFileContent(itemForm.file);
      } else if (type === "snippet") {
        summaryContent = `Snippet: ${itemForm.title}\n\n${itemForm.preview}\n\nDescription: ${itemForm.description}`;
      } else if (type === "link") {
        summaryContent = `Link: ${itemForm.title}\nURL: ${itemForm.url}\nDescription: ${itemForm.description}`;
      } else if (type === "other") {
        summaryContent = `Notes: ${itemForm.title}\n\n${itemForm.preview}\n\nDescription: ${itemForm.description}`;
      }

      if (summaryContent) {
        try {
          const aiSummary = await generateAISummary(summaryContent);
          formData.append("summary", aiSummary);
        } catch (err) {
          console.warn("AI summary error", err);
        }
      }

      const res = await fetch(`${API_BASE_URL}/vault`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        setItems([json.data, ...items]);
        setShowItemModal({ show: false, type: null });
        setItemForm({ title: "", description: "", url: "", tags: "", preview: "", file: null });
        toast({ title: "Item added successfully!" });
      } else {
        toast({ title: json.error || "Failed to add item", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to add item", variant: "destructive" });
    }
  };

  const handleDeleteItem = async (id: string, isFolder: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = isFolder ? `folders/${id}` : `${id}`;
      const res = await fetch(`${API_BASE_URL}/vault/${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        if (isFolder) setFolders(folders.filter(f => f._id !== id));
        else setItems(items.filter(i => i._id !== id));
        toast({ title: isFolder ? "Folder deleted" : "Item deleted" });
      }
    } catch (err) {
      toast({ title: "Deletion failed", variant: "destructive" });
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter !== "all" && item.type !== filter) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredFolders = folders.filter((f) => {
    if (filter !== "all") return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#02040A] min-h-screen text-white font-sans relative pb-10 selection:bg-white/20">
      {/* Cinematic Background Layer */}
      <div className="sticky top-0 left-0 w-full h-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-screen overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-screen" />
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00F5FF]/20 blur-[180px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#7B61FF]/20 blur-[180px] mix-blend-screen" />
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-pink-500/15 blur-[150px] mix-blend-screen" />
        </div>
      </div>

      {/* API Guide Modal */}
      <ApiGuideModal isOpen={showApiGuide} onClose={() => setShowApiGuide(false)} />

      {/* API Settings Modal */}
      <AnimatePresence>
        {showApiSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" 
            onClick={() => setShowApiSettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0E17] p-6 md:p-8 shadow-2xl flex flex-col" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3 text-white tracking-tight">
                  <Settings className="w-5 h-5 text-[#00F5FF]" /> API Settings
                </h2>
                <button onClick={() => setShowApiSettings(false)} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Groq API Key</label>
                  <input 
                    type="password" 
                    value={apiKey} 
                    onChange={e => setApiKey(e.target.value)} 
                    placeholder="gsk_..." 
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#00F5FF]/50 outline-none transition-all font-mono" 
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3">
                  <p className="text-xs text-neutral-400 flex items-start gap-1">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-neutral-500"/> Get your free API key from console.groq.com
                  </p>
                  <button
                      onClick={() => setShowApiGuide(true)}
                      className="text-xs font-medium text-[#00F5FF] hover:text-[#00F5FF]/80 transition-colors underline underline-offset-2 flex items-center gap-1 shrink-0"
                  >
                      <HelpCircle className="w-3.5 h-3.5" />
                      How to get API key?
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-auto pt-6 border-t border-white/10">
                <button onClick={() => setShowApiSettings(false)} className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={saveApiKey} className="rounded-xl bg-white/10 border border-white/10 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 relative z-10 space-y-6 md:space-y-8">
        
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8 space-y-3"
        >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-neutral-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-1">
                <Database className="h-3 w-3 text-[#7B61FF]" />
                Resources
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-heading">
                Knowledge{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                    Vault.
                </span>
            </h1>
            <p className="text-sm text-neutral-400 font-medium max-w-xl leading-relaxed">
                Your curated library of links, code, and documents.
            </p>
        </motion.div>

        {/* Toolbar & Breadcrumbs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-4 mb-6"
        >
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-500 overflow-x-auto pb-1 scrollbar-none">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.id || "root"} className="flex items-center gap-1.5 shrink-0">
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
                <button
                  onClick={() => navigateToFolder(crumb.id, crumb.name)}
                  className={`hover:text-white transition-colors ${idx === breadcrumbs.length - 1 ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" : ""}`}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[1.25rem] bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] p-3 lg:p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all shrink-0 ${filter === opt.value
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-neutral-500 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search vault..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full sm:w-56 rounded-xl border border-white/10 bg-black/50 pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all font-medium"
                />
              </div>
              <button
                onClick={() => setView(view === "grid" ? "list" : "grid")}
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all shrink-0"
              >
                {view === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setShowApiSettings(true)}
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all shrink-0"
                title="API Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00F5FF]/50 border-t-[#00F5FF]" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={view === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-4"}
          >
            {filteredFolders.length === 0 && filteredItems.length === 0 && (
              <div className="col-span-full py-24 flex flex-col items-center text-center text-neutral-500">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 opacity-50" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Vault is empty</p>
                <p className="text-xs font-medium mt-1">Use the + button below to add items.</p>
              </div>
            )}

            {/* Folders */}
            <AnimatePresence>
              {filteredFolders.map((folder, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  key={folder._id} 
                  className="relative group rounded-[1.25rem] bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-[2px] transition-all cursor-pointer" 
                  onClick={() => navigateToFolder(folder._id, folder.name)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#00F5FF]/10 text-[#00F5FF] flex items-center justify-center border border-[#00F5FF]/10">
                        <FolderOpen className="w-5 h-5 fill-[#00F5FF]/20" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-[#00F5FF] group-hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.4)] transition-all">
                          {folder.name}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-0.5">Folder</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem(folder._id, true) }}
                      className="p-1.5 rounded-lg text-neutral-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Items */}
              {filteredItems.map((item, i) => {
                const cfg = typeConfig[item.type] || typeConfig.other;
                const Icon = cfg.icon;

                const handleCardClick = () => {
                  if (item.type === "link" && item.url) window.open(item.url, "_blank");
                  if (item.type === "snippet") setViewSnippet(item);
                  if (item.type === "pdf" || item.type === "other") setViewPdf(item);
                };

                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: (filteredFolders.length + i) * 0.05 }}
                    key={item._id} 
                    className="relative group rounded-[1.25rem] bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-[2px] transition-all cursor-pointer h-full min-h-[220px]" 
                    onClick={handleCardClick}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg ${cfg.bg} border border-${cfg.color.replace('text-', '')}/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>
                        <Icon className="h-3 w-3" /> {cfg.label}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.type === "link" && (
                          <button className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors" title="Open Link">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteItem(item._id, false) }}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className={`font-bold text-[16px] text-white leading-snug mb-2 ${cfg.glow} transition-all line-clamp-2`}>
                      {item.title}
                    </h3>
                    <p className="text-[12px] text-neutral-400 mb-4 line-clamp-2 flex-1 font-medium leading-relaxed">
                      {item.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-1.5 mb-4 flex-wrap mt-auto">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-neutral-400 font-bold tracking-wider uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.type === "pdf" && item.summary && (
                        <span className="flex items-center gap-1 text-[#7B61FF]">
                          <Sparkles className="h-3 w-3" /> AI Summary
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Floating Action Menu */}
      <div
        className="fixed bottom-8 right-8 z-40"
        onMouseEnter={() => setShowFabMenu(true)}
        onMouseLeave={() => setShowFabMenu(false)}
      >
        <AnimatePresence>
          {showFabMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full right-0 mb-4 w-52 bg-[#0A0E17]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1"
            >
              <button onClick={() => setShowItemModal({ show: true, type: "link" })} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors"><Link2 className="w-4 h-4 text-blue-400" /></div> Link
              </button>
              <button onClick={() => setShowItemModal({ show: true, type: "snippet" })} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors"><Code2 className="w-4 h-4 text-emerald-400" /></div> Snippet
              </button>
              <button onClick={() => setShowItemModal({ show: true, type: "pdf" })} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors"><FileText className="w-4 h-4 text-pink-400" /></div> Document
              </button>
              <button onClick={() => setShowItemModal({ show: true, type: "other" })} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors"><AlignLeft className="w-4 h-4 text-orange-400" /></div> Note
              </button>
              <div className="h-px w-full bg-white/10 my-1" />
              <button onClick={() => setShowFolderModal(true)} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
                <div className="w-8 h-8 rounded-lg bg-[#00F5FF]/10 flex items-center justify-center group-hover:bg-[#00F5FF]/20 transition-colors"><FolderPlus className="w-4 h-4 text-[#00F5FF]" /></div> Folder
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button className="w-14 h-14 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] text-white shadow-[0_0_30px_rgba(0,245,255,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Folder Creation Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" 
            onClick={() => setShowFolderModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0A0E17] p-6 shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight">Create Folder</h2>
                <button onClick={() => setShowFolderModal(false)} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-[#00F5FF]/50 transition-all font-medium"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder() }}
              />
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setShowFolderModal(false)} className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button onClick={handleCreateFolder} className="rounded-xl bg-white/10 border border-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all">
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Creation Modal */}
      <AnimatePresence>
        {showItemModal.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" 
            onClick={() => setShowItemModal({ show: false, type: null })}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full ${showItemModal.type === 'snippet' || showItemModal.type === 'other' ? 'max-w-2xl' : 'max-w-md'} rounded-2xl border border-white/10 bg-[#0A0E17] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`} 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3 text-white tracking-tight">
                  {showItemModal.type === 'link' && <><Link2 className="w-5 h-5 text-blue-400" /> New Link</>}
                  {showItemModal.type === 'snippet' && <><Code2 className="w-5 h-5 text-emerald-400" /> New Snippet</>}
                  {showItemModal.type === 'pdf' && <><FileText className="w-5 h-5 text-pink-400" /> New Document</>}
                  {showItemModal.type === 'other' && <><AlignLeft className="w-5 h-5 text-orange-400" /> New Note</>}
                </h2>
                <button onClick={() => setShowItemModal({ show: false, type: null })} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-5 pb-2 scrollbar-thin">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Title <span className="text-red-400">*</span></label>
                  <input type="text" value={itemForm.title} onChange={e => setItemForm({ ...itemForm, title: e.target.value })} placeholder="Title..." className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#00F5FF]/50 outline-none transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Description</label>
                  <input type="text" value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Short description..." className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#00F5FF]/50 outline-none transition-all font-medium" />
                </div>

                {showItemModal.type === 'link' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">URL <span className="text-red-400">*</span></label>
                    <input type="url" value={itemForm.url} onChange={e => setItemForm({ ...itemForm, url: e.target.value })} placeholder="https://" className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#00F5FF]/50 outline-none transition-all font-medium" />
                  </div>
                )}

                {showItemModal.type === 'snippet' && (
                  <div className="space-y-2 h-64 flex flex-col">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Code <span className="text-red-400">*</span></label>
                    <textarea value={itemForm.preview} onChange={e => setItemForm({ ...itemForm, preview: e.target.value })} placeholder="Paste your code..." className="w-full flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-[13px] font-mono text-emerald-400 focus:border-emerald-500/50 outline-none transition-all resize-none scrollbar-thin" />
                  </div>
                )}

                {showItemModal.type === 'other' && (
                  <div className="space-y-2 h-64 flex flex-col">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Content</label>
                    <textarea value={itemForm.preview} onChange={e => setItemForm({ ...itemForm, preview: e.target.value })} placeholder="Write your notes..." className="w-full flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#00F5FF]/50 outline-none transition-all resize-none scrollbar-thin leading-relaxed font-medium" />
                  </div>
                )}

                {showItemModal.type === 'pdf' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">File <span className="text-red-400">*</span></label>
                    <div className="flex items-center justify-center w-full mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Plus className="w-6 h-6 text-neutral-500 group-hover:text-white transition-colors mb-2" />
                          <p className="text-sm text-white font-bold tracking-tight mb-1">{itemForm.file ? itemForm.file.name : "Click to upload"}</p>
                          <p className="text-xs font-semibold text-neutral-500">{itemForm.file ? `${(itemForm.file.size / 1024).toFixed(1)} KB` : "PDF, JPG, PNG allowed"}</p>
                        </div>
                        <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setItemForm({ ...itemForm, file: e.target.files?.[0] || null })} />
                      </label>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tags (comma separated)</label>
                  <input type="text" value={itemForm.tags} onChange={e => setItemForm({ ...itemForm, tags: e.target.value })} placeholder="react, typescript, ui" className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#00F5FF]/50 outline-none transition-all font-medium" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                <button onClick={() => setShowItemModal({ show: false, type: null })} className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleCreateItem} className="rounded-xl bg-white/10 border border-white/10 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snippet Viewer Modal */}
      <AnimatePresence>
        {viewSnippet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8" 
            onClick={() => setViewSnippet(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl h-full max-h-[85vh] rounded-[1.5rem] border border-white/10 bg-[#0A0E17] shadow-2xl flex flex-col overflow-hidden" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5 backdrop-blur-md">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-3 tracking-tight">
                    <Code2 className="w-5 h-5 text-emerald-400" /> {viewSnippet.title}
                  </h2>
                  {viewSnippet.description && <p className="text-xs font-medium text-neutral-400 mt-1">{viewSnippet.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => { navigator.clipboard.writeText(viewSnippet.preview || ""); toast({ title: "Code copied!" }) }} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button onClick={() => setViewSnippet(null)} className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 md:p-8 bg-black/40">
                <pre className="font-mono text-[13px] text-emerald-400/90 leading-relaxed tabular-nums">
                  {viewSnippet.preview}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF / Note Reader View */}
      <AnimatePresence>
        {viewPdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-6" 
            onClick={() => setViewPdf(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full sm:rounded-[1.5rem] border border-white/10 bg-[#0A0E17] shadow-2xl flex flex-col overflow-hidden" 
              onClick={e => e.stopPropagation()}
            >
              <div className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  {viewPdf.type === 'other' ? <AlignLeft className="w-5 h-5 text-orange-400 shrink-0" /> : <FileText className="w-5 h-5 text-pink-400 shrink-0" />}
                  <h2 className="text-base font-bold text-white tracking-tight truncate">{viewPdf.title}</h2>
                </div>
                <button onClick={() => setViewPdf(null)} className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors shrink-0"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-safe">
                {/* Content Area (Left) */}
                <div className={`flex-1 overflow-y-auto bg-black/40 p-6 sm:p-8 border-r border-white/10 scrollbar-thin ${!viewPdf.summary ? 'md:border-none md:max-w-4xl md:mx-auto' : ''}`}>
                  {viewPdf.type === 'pdf' ? (
                    <div className="h-full flex flex-col">
                      {viewPdf.fileData ? (
                        <iframe
                          src={`${API_BASE_URL.replace('/api', '')}/vault/${viewPdf.fileData}#toolbar=0`}
                          className="w-full h-full rounded-xl border border-white/10 bg-white"
                          title={viewPdf.fileName}
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-white/5">
                          <FileText className="w-16 h-16 text-neutral-600 mb-4" />
                          <p className="text-lg font-bold text-white mb-2">{viewPdf.fileName}</p>
                          <p className="text-sm font-medium text-neutral-500">Original file unavailable.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-[15px] leading-loose text-white/90 font-medium">
                        {viewPdf.preview || "No content available."}
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Area (Right) */}
                {viewPdf.summary && (
                  <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 bg-[#0A0E17] flex flex-col border-t md:border-t-0 border-white/10 z-10">
                    <div className="p-5 border-b border-white/10 bg-white/5">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-[#7B61FF]">
                        <Sparkles className="w-4 h-4" /> AI Summary
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-4">
                      {viewPdf.summary.split("\n").filter(p => !/^(?:ok(?:ay)?|sure|here(?:'s)?|alright)[\s,:-]/i.test(p) && !/summary/i.test(p) && p.trim().length > 0).map((point, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + (i * 0.05) }}
                          key={i} 
                          className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm leading-relaxed text-[13px] font-medium text-neutral-300"
                        >
                          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-[#7B61FF]/20 text-[11px] font-bold text-[#7B61FF] border border-[#7B61FF]/20">
                            {i + 1}
                          </span>
                          <p className="mt-0.5">{point.replace(/^[\*\-•\s]+/, "")}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
