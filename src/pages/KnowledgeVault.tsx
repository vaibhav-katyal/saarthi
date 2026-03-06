import { useState, useEffect, useRef } from "react";
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
  FolderPlus
} from "lucide-react";
import { generateAISummary } from "@/lib/ai";
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";
import { toast } from "@/hooks/use-toast";

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
  link: { icon: Link2, label: "Link" },
  snippet: { icon: Code2, label: "Snippet" },
  pdf: { icon: FileText, label: "Document" },
  other: { icon: AlignLeft, label: "Notes" },
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
      const res = await fetch(`http://localhost:5000/api/vault${qs}`, {
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
      const res = await fetch(`http://localhost:5000/api/vault/folders`, {
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

      const res = await fetch(`http://localhost:5000/api/vault`, {
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
      const res = await fetch(`http://localhost:5000/api/vault/${endpoint}`, {
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
    if (filter !== "all") return false; // Hide folders if type filter is active
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <PageWrapper
      title="Knowledge Vault"
      subtitle="Your curated library of links, code, and documents"
      icon={<Database className="h-4 w-4" />}
      badge="Resources"
    >
      {/* Toolbar & Breadcrumbs */}
      <div className="mb-6 flex flex-col gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground overflow-x-auto pb-1 scrollbar-none">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.id || "root"} className="flex items-center gap-1.5 shrink-0">
              {idx > 0 && <ChevronRight className="h-4 w-4 opacity-50" />}
              <button
                onClick={() => navigateToFolder(crumb.id, crumb.name)}
                className={`hover:text-foreground transition-colors ${idx === breadcrumbs.length - 1 ? "text-foreground font-semibold" : ""}`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 shrink-0 ${filter === opt.value
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
                className="h-8 w-full sm:w-44 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
              />
            </div>
            <button
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="btn-ghost p-1.5 rounded-lg shrink-0"
            >
              {view === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-3"}>
          {filteredFolders.length === 0 && filteredItems.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center text-center text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 opacity-30" />
              </div>
              <p className="font-semibold text-foreground">Vault is empty here.</p>
              <p className="text-sm mt-1">Use the + button below to add items or folders.</p>
            </div>
          )}

          {/* Folders */}
          {filteredFolders.map((folder) => (
            <GlassCard key={folder._id} hover className="cursor-pointer group flex flex-col" onClick={() => navigateToFolder(folder._id, folder.name)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 fill-blue-500/20" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-blue-400 transition-colors">{folder.name}</h3>
                    <p className="text-[11px] text-muted-foreground">Folder</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteItem(folder._id, true) }}
                  className="p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-secondary transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </GlassCard>
          ))}

          {/* Items */}
          {filteredItems.map((item) => {
            const cfg = typeConfig[item.type];
            const Icon = cfg.icon;

            const handleCardClick = () => {
              if (item.type === "link" && item.url) window.open(item.url, "_blank");
              if (item.type === "snippet") setViewSnippet(item);
              if (item.type === "pdf" || item.type === "other") setViewPdf(item); // Using viewPdf for 'other' as well for reading
            };

            return (
              <GlassCard key={item._id} hover className="flex flex-col cursor-pointer group" onClick={handleCardClick}>
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary border border-border px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground uppercase tracking-wider">
                    <Icon className="h-3 w-3" /> {cfg.label}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.type === "link" && (
                      <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Open Link">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem(item._id, false) }}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors" title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-[15px] text-foreground leading-snug mb-1 group-hover:text-[#00F5FF] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-[13px] text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {item.description || "No description provided."}
                </p>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded border border-white/5 bg-white/5 text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between text-[11px] text-muted-foreground mt-auto">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.type === "pdf" && item.summary && (
                    <span className="flex items-center gap-1 text-[#7B61FF] font-medium">
                      <Sparkles className="h-3 w-3" /> AI Summary Attached
                    </span>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Persistent Floating Action Button */}
      <div
        className="fixed bottom-8 right-8 z-40"
        onMouseEnter={() => setShowFabMenu(true)}
        onMouseLeave={() => setShowFabMenu(false)}
      >
        {showFabMenu && (
          <div className="absolute bottom-full right-0 mb-4 w-48 bg-card border border-border rounded-xl shadow-2xl p-2 flex flex-col gap-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <button onClick={() => setShowItemModal({ show: true, type: "link" })} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
              <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center"><Link2 className="w-3.5 h-3.5 text-blue-400" /></div> Link
            </button>
            <button onClick={() => setShowItemModal({ show: true, type: "snippet" })} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center"><Code2 className="w-3.5 h-3.5 text-emerald-400" /></div> Code Snippet
            </button>
            <button onClick={() => setShowItemModal({ show: true, type: "pdf" })} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
              <div className="w-7 h-7 rounded-md bg-pink-500/10 flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-pink-400" /></div> Document (PDF)
            </button>
            <button onClick={() => setShowItemModal({ show: true, type: "other" })} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
              <div className="w-7 h-7 rounded-md bg-orange-500/10 flex items-center justify-center"><AlignLeft className="w-3.5 h-3.5 text-orange-400" /></div> Any Other
            </button>
            <div className="h-px w-full bg-border my-1" />
            <button onClick={() => setShowFolderModal(true)} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center"><FolderPlus className="w-3.5 h-3.5 text-primary" /></div> New Folder
            </button>
          </div>
        )}
        <button className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(0,245,255,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Folder Creation Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowFolderModal(false)}>
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">Create New Folder</h2>
              <button onClick={() => setShowFolderModal(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 transition-colors"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder() }}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowFolderModal(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                Cancel
              </button>
              <button onClick={handleCreateFolder} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Creation Modal */}
      {showItemModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowItemModal({ show: false, type: null })}>
          <div className={`w-full ${showItemModal.type === 'snippet' || showItemModal.type === 'other' ? 'max-w-2xl' : 'max-w-md'} rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {showItemModal.type === 'link' && <><Link2 className="w-5 h-5 text-blue-400" /> Add Link</>}
                {showItemModal.type === 'snippet' && <><Code2 className="w-5 h-5 text-emerald-400" /> Add Code Snippet</>}
                {showItemModal.type === 'pdf' && <><FileText className="w-5 h-5 text-pink-400" /> Add Document</>}
                {showItemModal.type === 'other' && <><AlignLeft className="w-5 h-5 text-orange-400" /> Add Note</>}
              </h2>
              <button onClick={() => setShowItemModal({ show: false, type: null })} className="p-2 rounded-full text-muted-foreground hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-2 scrollbar-thin">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
                <input type="text" value={itemForm.title} onChange={e => setItemForm({ ...itemForm, title: e.target.value })} placeholder="Give it a clear title" className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm focus:border-primary/50 outline-none transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                <input type="text" value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="What's this about?" className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm focus:border-primary/50 outline-none transition-colors" />
              </div>

              {showItemModal.type === 'link' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL *</label>
                  <input type="url" value={itemForm.url} onChange={e => setItemForm({ ...itemForm, url: e.target.value })} placeholder="https://" className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm focus:border-primary/50 outline-none transition-colors" />
                </div>
              )}

              {showItemModal.type === 'snippet' && (
                <div className="space-y-1 h-64 flex flex-col">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code *</label>
                  <textarea value={itemForm.preview} onChange={e => setItemForm({ ...itemForm, preview: e.target.value })} placeholder="Paste your code here..." className="w-full flex-1 rounded-lg border border-border bg-[#0A0E17] px-4 py-3 text-[13px] font-mono text-emerald-400 focus:border-primary/50 outline-none transition-colors resize-none scrollbar-thin" />
                </div>
              )}

              {showItemModal.type === 'other' && (
                <div className="space-y-1 h-64 flex flex-col">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes / Content</label>
                  <textarea value={itemForm.preview} onChange={e => setItemForm({ ...itemForm, preview: e.target.value })} placeholder="Start typing your notes..." className="w-full flex-1 rounded-lg border border-border bg-muted px-4 py-3 text-sm focus:border-primary/50 outline-none transition-colors resize-none scrollbar-thin leading-relaxed" />
                </div>
              )}

              {showItemModal.type === 'pdf' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">File *</label>
                  <div className="flex items-center justify-center w-full mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-xl cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Plus className="w-6 h-6 text-muted-foreground mb-2" />
                        <p className="text-sm text-foreground font-medium mb-1">{itemForm.file ? itemForm.file.name : "Click to upload"}</p>
                        <p className="text-xs text-muted-foreground">{itemForm.file ? `${(itemForm.file.size / 1024).toFixed(1)} KB` : "PDF, JPG, PNG allowed"}</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setItemForm({ ...itemForm, file: e.target.files?.[0] || null })} />
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</label>
                <input type="text" value={itemForm.tags} onChange={e => setItemForm({ ...itemForm, tags: e.target.value })} placeholder="react, typescript, ui (comma separated)" className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm focus:border-primary/50 outline-none transition-colors" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button onClick={() => setShowItemModal({ show: false, type: null })} className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={handleCreateItem} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-[0_0_15px_rgba(0,245,255,0.2)]">Save to Vault</button>
            </div>
          </div>
        </div>
      )}

      {/* Snippet Viewer Modal */}
      {viewSnippet && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-md p-4 sm:p-8" onClick={() => setViewSnippet(null)}>
          <div className="w-full max-w-4xl h-full max-h-[85vh] rounded-2xl border border-border bg-[#070B14] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-400" /> {viewSnippet.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{viewSnippet.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { navigator.clipboard.writeText(viewSnippet.preview || ""); toast({ title: "Code copied!" }) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={() => setViewSnippet(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-[#0A0E17]">
              <pre className="font-mono text-sm text-emerald-400/90 leading-relaxed tabular-nums">
                {viewSnippet.preview}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* PDF / Document / Note Reader View (Split screen if summary exists) */}
      {viewPdf && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background p-0 sm:p-6" onClick={() => setViewPdf(null)}>
          <div className="w-full h-full sm:rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="h-14 border-b border-border bg-muted/30 px-4 sm:px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                {viewPdf.type === 'other' ? <AlignLeft className="w-5 h-5 text-orange-400 shrink-0" /> : <FileText className="w-5 h-5 text-pink-400 shrink-0" />}
                <h2 className="text-base font-bold text-foreground truncate">{viewPdf.title}</h2>
              </div>
              <button onClick={() => setViewPdf(null)} className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors shrink-0"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-safe">
              {/* Content Area (Left) */}
              <div className={`flex-1 overflow-y-auto p-6 sm:p-10 border-r border-border scrollbar-thin ${!viewPdf.summary ? 'md:border-none md:max-w-4xl md:mx-auto' : ''}`}>
                {viewPdf.type === 'pdf' ? (
                  <div className="h-full flex flex-col pt-0">
                    {viewPdf.fileData ? (
                      <iframe
                        src={`http://localhost:5000${viewPdf.fileData}#toolbar=0`}
                        className="w-full h-full rounded-xl border border-border/50 bg-white"
                        title={viewPdf.fileName}
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20">
                        <FileText className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
                        <p className="text-lg font-semibold mb-2">{viewPdf.fileName}</p>
                        <p className="text-sm text-muted-foreground">Original file unavailable.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-[15px] leading-loose text-foreground/90 font-medium">
                      {viewPdf.preview || "No content available."}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Area (Right) */}
              {viewPdf.summary && (
                <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 bg-secondary/30 flex flex-col border-t md:border-t-0 border-border z-10">
                  <div className="p-5 border-b border-border bg-card">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Sparkles className="w-4 h-4 text-[#7B61FF]" /> AI Summary
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <div className="space-y-4">
                      {viewPdf.summary.split("\n").filter(p => !/^(?:ok(?:ay)?|sure|here(?:'s)?|alright)[\s,:-]/i.test(p) && !/summary/i.test(p) && p.trim().length > 0).map((point, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-sm leading-relaxed text-sm">
                          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#7B61FF]/10 text-[11px] font-bold text-[#7B61FF]">
                            {i + 1}
                          </span>
                          <p className="text-foreground/90">{point.replace(/^[\*\-•\s]+/, "")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
