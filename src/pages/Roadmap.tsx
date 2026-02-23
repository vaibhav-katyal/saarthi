import { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";
import { toast } from "@/hooks/use-toast";

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: "done" | "current" | "upcoming";
  resources: string[];
  subtasks: string[];
}

const roadmapBank: Record<string, RoadmapNode[]> = {
  default: [
    {
      id: "1", title: "Programming Fundamentals", description: "Master core programming concepts with Python or JavaScript",
      duration: "2 weeks", status: "done", resources: ["freeCodeCamp", "CS50"],
      subtasks: ["Variables & Data Types", "Control Flow", "Functions", "OOP Basics"],
    },
    {
      id: "2", title: "Data Structures & Algorithms", description: "Learn essential DSA for technical interviews",
      duration: "4 weeks", status: "current", resources: ["LeetCode", "NeetCode 150"],
      subtasks: ["Arrays & Hashing", "Linked Lists", "Trees & Graphs", "Dynamic Programming"],
    },
    {
      id: "3", title: "Backend Development", description: "Build RESTful APIs and understand server architecture",
      duration: "3 weeks", status: "upcoming", resources: ["Node.js Docs", "Express.js Guide"],
      subtasks: ["HTTP & REST", "Express.js", "Authentication", "Database Integration"],
    },
    {
      id: "4", title: "Databases", description: "Master SQL and NoSQL database systems",
      duration: "2 weeks", status: "upcoming", resources: ["PostgreSQL Tutorial", "MongoDB University"],
      subtasks: ["SQL Fundamentals", "Schema Design", "Indexing", "Transactions"],
    },
    {
      id: "5", title: "System Design", description: "Learn to design scalable distributed systems",
      duration: "3 weeks", status: "upcoming", resources: ["System Design Primer", "Designing Data-Intensive Applications"],
      subtasks: ["Load Balancing", "Caching", "Message Queues", "Microservices"],
    },
  ],
  "frontend": [
    {
      id: "1", title: "HTML & CSS Mastery", description: "Build pixel-perfect layouts with semantic HTML and modern CSS",
      duration: "2 weeks", status: "done", resources: ["MDN Web Docs", "CSS-Tricks"],
      subtasks: ["Semantic HTML", "Flexbox & Grid", "Responsive Design", "CSS Animations"],
    },
    {
      id: "2", title: "JavaScript Deep Dive", description: "Understand closures, async/await, and the event loop",
      duration: "3 weeks", status: "current", resources: ["JavaScript.info", "Eloquent JS"],
      subtasks: ["ES6+ Features", "DOM Manipulation", "Promises & Async", "Event Loop"],
    },
    {
      id: "3", title: "React Ecosystem", description: "Build modern SPAs with React and its ecosystem",
      duration: "4 weeks", status: "upcoming", resources: ["React Docs", "React Router"],
      subtasks: ["Components & Props", "Hooks", "State Management", "React Router"],
    },
    {
      id: "4", title: "TypeScript & Testing", description: "Add type safety and write reliable tests",
      duration: "2 weeks", status: "upcoming", resources: ["TypeScript Handbook", "Vitest Docs"],
      subtasks: ["Type System", "Generics", "Unit Testing", "Integration Testing"],
    },
  ],
  "data science": [
    {
      id: "1", title: "Python for Data Science", description: "Master NumPy, Pandas, and Matplotlib",
      duration: "3 weeks", status: "done", resources: ["Kaggle Learn", "Python DS Handbook"],
      subtasks: ["NumPy Arrays", "Pandas DataFrames", "Data Visualization", "Data Cleaning"],
    },
    {
      id: "2", title: "Statistics & Probability", description: "Build a strong mathematical foundation",
      duration: "3 weeks", status: "current", resources: ["Khan Academy", "StatQuest"],
      subtasks: ["Descriptive Stats", "Probability", "Hypothesis Testing", "Regression"],
    },
    {
      id: "3", title: "Machine Learning", description: "Learn supervised and unsupervised learning algorithms",
      duration: "5 weeks", status: "upcoming", resources: ["Andrew Ng's Course", "Scikit-learn Docs"],
      subtasks: ["Linear Regression", "Classification", "Clustering", "Model Evaluation"],
    },
    {
      id: "4", title: "Deep Learning", description: "Neural networks, CNNs, and transformers",
      duration: "4 weeks", status: "upcoming", resources: ["Fast.ai", "PyTorch Tutorials"],
      subtasks: ["Neural Networks", "CNNs", "RNNs & LSTMs", "Transformers"],
    },
  ],
};

const statusConfig = {
  done: { icon: CheckCircle2, color: "text-success", label: "Done" },
  current: { icon: Circle, color: "text-primary", label: "In Progress" },
  upcoming: { icon: Circle, color: "text-muted-foreground", label: "Upcoming" },
};

export default function Roadmap() {
  const [goal, setGoal] = useState("Become a Backend Engineer");
  const [expandedId, setExpandedId] = useState<string | null>("2");
  const [roadmap, setRoadmap] = useState<RoadmapNode[]>(roadmapBank.default);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!goal.trim()) {
      toast({ title: "Enter a goal first", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setExpandedId(null);

    setTimeout(() => {
      const key = Object.keys(roadmapBank).find((k) =>
        goal.toLowerCase().includes(k)
      );
      setRoadmap(roadmapBank[key || "default"]);
      setExpandedId("2");
      setGenerating(false);
      toast({ title: "Roadmap generated!" });
    }, 1500);
  };

  return (
    <PageWrapper title="AI Roadmap" subtitle="Describe a goal and get a personalized learning path">
      {/* Input */}
      <GlassCard className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="e.g., Become a Frontend Developer, Data Science, Backend Engineer"
            className="flex-1 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50"
          >
            {generating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>
      </GlassCard>

      {/* Timeline */}
      {generating ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Building your personalized roadmap...</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-3">
            {roadmap.map((node) => {
              const cfg = statusConfig[node.status];
              const Icon = cfg.icon;
              const isExpanded = expandedId === node.id;

              return (
                <div key={node.id} className="relative flex gap-3 pl-0">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card border border-border">
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>

                  {/* Card */}
                  <GlassCard
                    className="flex-1 cursor-pointer"
                    hover
                    onClick={() => setExpandedId(isExpanded ? null : node.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-medium text-sm text-foreground">{node.title}</h3>
                          {node.status === "current" && (
                            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              {cfg.label}
                            </span>
                          )}
                          {node.status === "done" && (
                            <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                              {cfg.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{node.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{node.duration}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-medium text-foreground mb-2">Subtasks</h4>
                            <div className="space-y-1">
                              {node.subtasks.map((st, j) => (
                                <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <ArrowRight className="h-3 w-3 text-muted-foreground/60" />
                                  {st}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-foreground mb-2">Resources</h4>
                            <div className="space-y-1">
                              {node.resources.map((r, j) => (
                                <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <BookOpen className="h-3 w-3 text-muted-foreground/60" />
                                  {r}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
