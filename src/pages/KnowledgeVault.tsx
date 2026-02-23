import { useState } from "react";
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
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";
import { toast } from "@/hooks/use-toast";

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
  },
  {
    id: "2",
    type: "snippet",
    title: "Binary Search Implementation",
    description: "Optimized binary search with edge case handling",
    tags: ["DSA", "Python"],
    date: "Yesterday",
    preview: "def binary_search(arr, target):\n    lo, hi = 0, len(arr)-1\n    ...",
  },
  {
    id: "3",
    type: "pdf",
    title: "Operating Systems – Chapter 5",
    description: "Process scheduling algorithms and deadlock prevention",
    tags: ["OS", "Theory"],
    date: "3 days ago",
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

const summaryData: Record<string, string[]> = {
  "Operating Systems – Chapter 5": [
    "Process scheduling determines the order in which processes access the CPU using algorithms like FCFS, SJF, Round Robin, and Priority Scheduling.",
    "Deadlock occurs when processes hold resources while waiting for others — four conditions: mutual exclusion, hold & wait, no preemption, circular wait.",
    "Prevention strategies include resource ordering, timeout mechanisms, and the Banker's algorithm for safe state detection.",
    "Context switching overhead is a key factor in choosing scheduling algorithms for real-time vs batch systems.",
  ],
  "Database Normalization Notes": [
    "1NF eliminates repeating groups — each cell must hold a single atomic value.",
    "2NF removes partial dependencies — all non-key attributes must depend on the entire primary key.",
    "3NF removes transitive dependencies — non-key attributes must not depend on other non-key attributes.",
    "BCNF (Boyce-Codd) strengthens 3NF — every determinant must be a candidate key.",
  ],
};

export default function KnowledgeVault() {
  const [items, setItems] = useState<VaultItem[]>(initialItems);
  const [view, setView] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ type: "link" as ItemType, title: "", description: "", url: "", tags: "", preview: "" });

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

  const handleAdd = () => {
    if (!newItem.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
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
    };
    setItems((prev) => [item, ...prev]);
    setNewItem({ type: "link", title: "", description: "", url: "", tags: "", preview: "" });
    setShowAddModal(false);
    toast({ title: "Item added to vault!" });
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Item removed from vault" });
  };

  const handleSummarize = (title: string) => {
    setSummaryTitle(title);
    setSummarizing(true);
    setShowSummary(true);
    setSummaryPoints([]);
    // Simulate AI summarization
    const points = summaryData[title] || [
      "This document covers key theoretical concepts and their practical applications.",
      "Important formulas and definitions are highlighted throughout the text.",
      "Practice problems are included at the end of each section for self-assessment.",
      "References to additional reading materials are provided for deeper understanding.",
    ];
    points.forEach((point, i) => {
      setTimeout(() => {
        setSummaryPoints((prev) => [...prev, point]);
        if (i === points.length - 1) setSummarizing(false);
      }, 600 * (i + 1));
    });
  };

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <PageWrapper title="Knowledge Vault" subtitle="Your curated library of links, code & documents">
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
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
                <div className="flex items-center gap-1">
                  {item.type === "pdf" && (
                    <button
                      onClick={() => handleSummarize(item.title)}
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
              {item.preview && (
                <pre className="mb-3 rounded-md bg-muted p-2.5 text-[11px] text-muted-foreground font-mono line-clamp-3 overflow-hidden">
                  {item.preview}
                </pre>
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
