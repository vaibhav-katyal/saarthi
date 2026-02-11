import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import { Plus, ArrowUp, MessageSquare, Tag, Trash2, X, Users } from "lucide-react";

type PostTag = "issue" | "complaint" | "suggestion" | "discussion";

interface Post {
  id: string;
  title: string;
  description: string;
  tag: PostTag;
  upvotes: number;
  upvoted: boolean;
  author: string;
  createdAt: string;
}

const STORAGE_KEY = "saarthi-community";

const tagColors: Record<PostTag, string> = {
  issue: "bg-destructive/10 text-destructive",
  complaint: "bg-destructive/10 text-destructive",
  suggestion: "bg-primary/10 text-primary",
  discussion: "bg-accent text-accent-foreground",
};

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState<PostTag>("discussion");
  const [filter, setFilter] = useState<PostTag | "all">("all");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setPosts(JSON.parse(stored));
  }, []);

  const save = (updated: Post[]) => {
    setPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const createPost = () => {
    if (!title.trim() || !description.trim()) return;
    const newPost: Post = {
      id: crypto.randomUUID(), title: title.trim(), description: description.trim(),
      tag, upvotes: 0, upvoted: false, author: "You", createdAt: new Date().toISOString(),
    };
    save([newPost, ...posts]);
    setTitle(""); setDescription(""); setShowCreate(false);
  };

  const toggleUpvote = (id: string) => {
    const updated = posts.map((p) =>
      p.id === id ? { ...p, upvotes: p.upvoted ? p.upvotes - 1 : p.upvotes + 1, upvoted: !p.upvoted } : p
    );
    save(updated);
  };

  const deletePost = (id: string) => save(posts.filter((p) => p.id !== id));

  const filtered = filter === "all" ? posts : posts.filter((p) => p.tag === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground text-sm mt-1">Raise issues, share suggestions, and discuss with peers.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 self-start sm:self-auto"
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "Close" : "New Post"}
        </button>
      </motion.div>

      {/* Create Form */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Create a post
            </h3>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            <textarea placeholder="Describe your issue, suggestion or topic..." value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {(["discussion", "suggestion", "issue", "complaint"] as PostTag[]).map((t) => (
                <button key={t} onClick={() => setTag(t)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${tag === t ? tagColors[t] : "text-muted-foreground hover:bg-muted/50"}`}
                >{t}</button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted/50">Cancel</button>
              <button onClick={createPost} className="px-5 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Post</button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "discussion", "suggestion", "issue", "complaint"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
              filter === f ? "bg-primary/10 text-primary" : "glass-subtle text-muted-foreground hover:text-foreground"
            }`}
          >{f}</button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} post{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <GlassCard variant="subtle" className="text-center py-16">
            <Users className="h-10 w-10 text-muted-foreground/15 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">No posts yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start a conversation with your college community!</p>
          </GlassCard>
        ) : (
          filtered.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlassCard variant="subtle" className="p-5">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button onClick={() => toggleUpvote(post.id)}
                      className={`p-2 rounded-xl transition-colors ${post.upvoted ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
                    ><ArrowUp className="h-4 w-4" /></button>
                    <span className={`text-xs font-bold ${post.upvoted ? "text-primary" : ""}`}>{post.upvotes}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold capitalize ${tagColors[post.tag]}`}>{post.tag}</span>
                      <span className="text-[10px] text-muted-foreground/50">{post.author} · {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                    <h3 className="font-semibold text-sm">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">{post.description}</p>
                  </div>
                  <button onClick={() => deletePost(post.id)}
                    className="p-2 rounded-xl hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive shrink-0 self-start"
                  ><Trash2 className="h-4 w-4" /></button>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;
