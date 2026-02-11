import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import {
  Plus, Link as LinkIcon, Code2, FileText, Trash2, ExternalLink,
  Search, Copy, Check, Upload, File, Download, FolderOpen, X,
} from "lucide-react";

type ResourceType = "link" | "code" | "document";

interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  content: string;
  description: string;
  createdAt: string;
  fileName?: string;
  fileSize?: number;
}

const STORAGE_KEY = "saarthi-resources";
const FILES_STORAGE_KEY = "saarthi-resource-files";

const tabs: { type: ResourceType; label: string; icon: React.ElementType }[] = [
  { type: "link", label: "Links", icon: LinkIcon },
  { type: "code", label: "Code", icon: Code2 },
  { type: "document", label: "Documents", icon: FileText },
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState<ResourceType>("link");
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setResources(JSON.parse(stored));
  }, []);

  const save = (updated: Resource[]) => {
    setResources(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be under 2MB for local storage.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({ name: file.name, size: file.size, data: reader.result as string });
      if (!title.trim()) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsDataURL(file);
  };

  const addResource = () => {
    if (!title.trim()) return;
    if (activeTab !== "document" && !content.trim()) return;
    if (activeTab === "document" && !content.trim() && !uploadedFile) return;

    const id = crypto.randomUUID();
    if (uploadedFile) {
      try {
        const files = JSON.parse(localStorage.getItem(FILES_STORAGE_KEY) || "{}");
        files[id] = uploadedFile.data;
        localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
      } catch {
        alert("Storage is full. Try removing some resources first.");
        return;
      }
    }

    const newResource: Resource = {
      id, type: activeTab, title: title.trim(),
      content: content.trim() || (uploadedFile ? `[Uploaded: ${uploadedFile.name}]` : ""),
      description: description.trim(), createdAt: new Date().toISOString(),
      fileName: uploadedFile?.name, fileSize: uploadedFile?.size,
    };
    save([newResource, ...resources]);
    setTitle(""); setContent(""); setDescription(""); setUploadedFile(null); setShowAdd(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const deleteResource = (id: string) => {
    save(resources.filter((r) => r.id !== id));
    try {
      const files = JSON.parse(localStorage.getItem(FILES_STORAGE_KEY) || "{}");
      delete files[id];
      localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
    } catch {}
  };

  const downloadFile = (resource: Resource) => {
    try {
      const files = JSON.parse(localStorage.getItem(FILES_STORAGE_KEY) || "{}");
      const fileData = files[resource.id];
      if (!fileData) return;
      const link = document.createElement("a");
      link.href = fileData;
      link.download = resource.fileName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {}
  };

  const copyContent = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = resources
    .filter((r) => r.type === activeTab)
    .filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    link: resources.filter((r) => r.type === "link").length,
    code: resources.filter((r) => r.type === "code").length,
    document: resources.filter((r) => r.type === "document").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your personal vault — links, code snippets & documents all in one place.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 self-start sm:self-auto"
        >
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? "Close" : "Add Resource"}
        </button>
      </motion.div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => { setActiveTab(tab.type); setShowAdd(false); setUploadedFile(null); }}
            className={`glass-subtle rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.02] ${
              activeTab === tab.type ? "ring-2 ring-primary/30" : ""
            }`}
          >
            <tab.icon className={`h-5 w-5 mx-auto mb-2 ${activeTab === tab.type ? "text-primary" : "text-muted-foreground"}`} />
            <p className={`text-xl font-bold ${activeTab === tab.type ? "text-primary" : ""}`}>{counts[tab.type]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{tab.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Search ${tabs.find(t => t.type === activeTab)?.label.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
        />
      </div>

      {/* Add Form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Add new {activeTab === "link" ? "link" : activeTab === "code" ? "code snippet" : "document"}
            </h3>
            <input
              type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            {activeTab === "document" && (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-input rounded-xl p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors border-2 border-dashed border-border/60"
                >
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <File className="h-6 w-6 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">Click to upload a document</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOCX, TXT — Max 2MB</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.md,.ppt,.pptx,.xls,.xlsx" onChange={handleFileUpload} className="hidden" />
                </div>
                <p className="text-xs text-muted-foreground text-center">— or paste notes below —</p>
              </div>
            )}
            <textarea
              placeholder={activeTab === "link" ? "Paste URL here..." : activeTab === "code" ? "Paste code here..." : "Paste content or notes (optional if file uploaded)..."}
              value={content} onChange={(e) => setContent(e.target.value)}
              rows={activeTab === "code" ? 6 : 3}
              className={`w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none ${activeTab === "code" ? "font-mono text-xs" : ""}`}
            />
            <input
              type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowAdd(false); setUploadedFile(null); }} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted/50 transition-colors">Cancel</button>
              <button onClick={addResource} className="px-5 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Save</button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Resource List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <GlassCard variant="subtle" className="text-center py-16">
            <FolderOpen className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">
              No {tabs.find(t => t.type === activeTab)?.label.toLowerCase()} saved yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">Click "Add Resource" to get started</p>
          </GlassCard>
        ) : (
          filtered.map((resource, i) => (
            <motion.div key={resource.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlassCard variant="subtle" className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{resource.title}</h3>
                    {resource.description && <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>}
                    {resource.fileName && (
                      <div className="flex items-center gap-2 mt-2.5 glass-subtle rounded-lg px-3 py-2 w-fit">
                        <File className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium">{resource.fileName}</span>
                        {resource.fileSize && <span className="text-xs text-muted-foreground">({formatFileSize(resource.fileSize)})</span>}
                      </div>
                    )}
                    {resource.type === "code" ? (
                      <pre className="mt-3 text-xs font-mono bg-foreground/5 rounded-xl p-4 overflow-x-auto border border-border/30">{resource.content}</pre>
                    ) : resource.type === "link" ? (
                      <a href={resource.content} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 flex items-center gap-1 truncate">
                        {resource.content} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : !resource.fileName ? (
                      <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{resource.content}</p>
                    ) : null}
                    <p className="text-[10px] text-muted-foreground/50 mt-3">{new Date(resource.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {resource.fileName && (
                      <button onClick={() => downloadFile(resource)} className="p-2 rounded-xl hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary" title="Download"><Download className="h-4 w-4" /></button>
                    )}
                    <button onClick={() => copyContent(resource.id, resource.content)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground">
                      {copiedId === resource.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button onClick={() => deleteResource(resource.id)} className="p-2 rounded-xl hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Resources;
