import { useState } from "react";
import {
  ArrowBigUp,
  MessageSquare,
  Plus,
  X,
} from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";
import { toast } from "@/hooks/use-toast";

interface Issue {
  id: string;
  title: string;
  description: string;
  author: string;
  upvotes: number;
  comments: number;
  status: "pending" | "resolved" | "in-review";
  category: string;
  time: string;
  voted?: boolean;
}

const mockIssues: Issue[] = [
  {
    id: "1",
    title: "WiFi connectivity issues in Library Block B",
    description: "The WiFi keeps dropping every 10 minutes on the 2nd floor of the library. Multiple students affected.",
    author: "Ananya S.",
    upvotes: 47,
    comments: 12,
    status: "in-review",
    category: "Infrastructure",
    time: "2h ago",
  },
  {
    id: "2",
    title: "Extend lab hours during exam season",
    description: "CS lab closes at 6 PM but many students need access for project work till at least 9 PM during exams.",
    author: "Raj M.",
    upvotes: 89,
    comments: 23,
    status: "pending",
    category: "Academics",
    time: "5h ago",
  },
  {
    id: "3",
    title: "Water cooler broken near Auditorium",
    description: "The water cooler near the main auditorium has been out of service for 3 days now.",
    author: "Priya K.",
    upvotes: 34,
    comments: 5,
    status: "resolved",
    category: "Facilities",
    time: "1d ago",
  },
  {
    id: "4",
    title: "Request for more elective options in Semester 6",
    description: "Current elective choices are limited. Students want ML, Cloud Computing, and Cybersecurity options.",
    author: "Vikram D.",
    upvotes: 112,
    comments: 31,
    status: "pending",
    category: "Academics",
    time: "2d ago",
  },
];

const statusStyles = {
  pending: "text-warning",
  resolved: "text-success",
  "in-review": "text-primary",
};

const statusLabels = {
  pending: "Pending",
  resolved: "Resolved",
  "in-review": "In Review",
};

const categories = ["Infrastructure", "Academics", "Facilities", "Hostel", "Other"];

export default function Community() {
  const [issues, setIssues] = useState(mockIssues);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: "", description: "", category: "Academics" });

  const handleUpvote = (id: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              upvotes: issue.voted ? issue.upvotes - 1 : issue.upvotes + 1,
              voted: !issue.voted,
            }
          : issue
      )
    );
  };

  const handleSubmitIssue = () => {
    if (!newIssue.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const issue: Issue = {
      id: Date.now().toString(),
      title: newIssue.title,
      description: newIssue.description,
      author: "You",
      upvotes: 1,
      comments: 0,
      status: "pending",
      category: newIssue.category,
      time: "Just now",
      voted: true,
    };
    setIssues((prev) => [issue, ...prev]);
    setNewIssue({ title: "", description: "", category: "Academics" });
    setShowModal(false);
    toast({ title: "Issue raised successfully!" });
  };

  const filtered = issues
    .filter((i) => filterStatus === "all" || i.status === filterStatus)
    .sort((a, b) => b.upvotes - a.upvotes);

  return (
    <PageWrapper title="Community" subtitle="Raise issues, upvote what matters, track resolutions">
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          {["all", "pending", "in-review", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 capitalize ${
                filterStatus === s
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {s === "all" ? "All" : statusLabels[s as keyof typeof statusLabels]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
          Raise Issue
        </button>
      </div>

      {/* Issues list */}
      <div className="space-y-2">
        {filtered.map((issue) => (
          <GlassCard key={issue.id} hover>
            <div className="flex gap-3">
              {/* Upvote */}
              <div className="flex flex-col items-center gap-0.5 pt-0.5">
                <button
                  onClick={() => handleUpvote(issue.id)}
                  className={`rounded-md p-1 transition-colors ${
                    issue.voted
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowBigUp className="h-5 w-5" />
                </button>
                <span className={`text-xs font-semibold ${issue.voted ? "text-primary" : "text-foreground"}`}>
                  {issue.upvotes}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <h3 className="font-medium text-sm text-foreground leading-snug">
                    {issue.title}
                  </h3>
                  <span className={`shrink-0 text-[11px] font-medium ${statusStyles[issue.status]}`}>
                    {statusLabels[issue.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {issue.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{issue.author}</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {issue.comments}
                  </span>
                  <span>{issue.time}</span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                    {issue.category}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Raise Issue Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-foreground">Raise an Issue</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Issue title"
                value={newIssue.title}
                onChange={(e) => setNewIssue((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
              />
              <textarea
                placeholder="Describe the issue in detail..."
                value={newIssue.description}
                onChange={(e) => setNewIssue((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors resize-none"
              />
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewIssue((p) => ({ ...p, category: cat }))}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        newIssue.category === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmitIssue} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Submit Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
