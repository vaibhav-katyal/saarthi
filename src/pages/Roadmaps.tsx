import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import { Sparkles, ChevronDown, ChevronRight, CheckCircle2, Circle, Trash2, Map, Target } from "lucide-react";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  substeps: string[];
  completed: boolean;
}

interface Roadmap {
  id: string;
  goal: string;
  steps: RoadmapStep[];
  createdAt: string;
}

const STORAGE_KEY = "saarthi-roadmaps";

const generateMockRoadmap = (goal: string): RoadmapStep[] => {
  return [
    { id: crypto.randomUUID(), title: "Research & Understand", description: "Gather foundational knowledge about the topic.", substeps: ["Read documentation", "Watch introductory videos", "Join relevant communities"], completed: false },
    { id: crypto.randomUUID(), title: "Set Up Environment", description: "Prepare tools and resources needed.", substeps: ["Install required software", "Set up project structure", "Configure development environment"], completed: false },
    { id: crypto.randomUUID(), title: "Learn Core Concepts", description: "Master the fundamental building blocks.", substeps: ["Study key theories", "Practice basic exercises", "Take notes and review"], completed: false },
    { id: crypto.randomUUID(), title: "Build Practice Projects", description: "Apply knowledge through hands-on projects.", substeps: ["Start with simple projects", "Gradually increase complexity", "Document your progress"], completed: false },
    { id: crypto.randomUUID(), title: "Advanced Topics", description: "Dive into specialized areas.", substeps: ["Explore advanced patterns", "Optimize solutions", "Study best practices"], completed: false },
    { id: crypto.randomUUID(), title: "Real-world Application", description: "Work on real projects and contribute.", substeps: ["Build a portfolio project", "Contribute to open source", "Share your knowledge"], completed: false },
  ];
};

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [goalInput, setGoalInput] = useState("");
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setRoadmaps(parsed);
      if (parsed.length > 0) setSelectedRoadmap(parsed[0].id);
    }
  }, []);

  const save = (updated: Roadmap[]) => {
    setRoadmaps(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const generateRoadmap = async () => {
    if (!goalInput.trim()) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    const newRoadmap: Roadmap = {
      id: crypto.randomUUID(),
      goal: goalInput.trim(),
      steps: generateMockRoadmap(goalInput),
      createdAt: new Date().toISOString(),
    };
    const updated = [newRoadmap, ...roadmaps];
    save(updated);
    setSelectedRoadmap(newRoadmap.id);
    setGoalInput("");
    setGenerating(false);
  };

  const toggleStep = (roadmapId: string, stepId: string) => {
    const updated = roadmaps.map((r) =>
      r.id === roadmapId
        ? { ...r, steps: r.steps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s)) }
        : r
    );
    save(updated);
  };

  const deleteRoadmap = (id: string) => {
    const updated = roadmaps.filter((r) => r.id !== id);
    save(updated);
    if (selectedRoadmap === id) setSelectedRoadmap(updated[0]?.id || null);
  };

  const activeRoadmap = roadmaps.find((r) => r.id === selectedRoadmap);
  const completedCount = activeRoadmap?.steps.filter((s) => s.completed).length || 0;
  const totalSteps = activeRoadmap?.steps.length || 0;
  const progress = totalSteps ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Roadmaps</h1>
        <p className="text-muted-foreground text-sm mt-1">Describe your goal and get a structured learning path.</p>
      </motion.div>

      {/* Generator */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">What do you want to learn?</span>
        </div>
        <textarea
          value={goalInput} onChange={(e) => setGoalInput(e.target.value)}
          placeholder="e.g. 'Learn React Native from scratch' or 'Prepare for GATE CS exam'"
          rows={3}
          className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
        <button
          onClick={generateRoadmap} disabled={generating || !goalInput.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Sparkles className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Generating..." : "Generate Roadmap"}
        </button>
      </GlassCard>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Roadmap List */}
        {roadmaps.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">Your Roadmaps ({roadmaps.length})</p>
            {roadmaps.map((r) => {
              const done = r.steps.filter(s => s.completed).length;
              const pct = r.steps.length ? Math.round((done / r.steps.length) * 100) : 0;
              return (
                <button
                  key={r.id} onClick={() => setSelectedRoadmap(r.id)}
                  className={`w-full text-left p-4 rounded-xl text-sm transition-all duration-200 group ${
                    selectedRoadmap === r.id ? "glass" : "glass-subtle hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 font-medium text-xs">{r.goal}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRoadmap(r.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded-lg transition-all text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Roadmap */}
        {activeRoadmap ? (
          <div className="space-y-4">
            <GlassCard className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-bold text-base">{activeRoadmap.goal}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(activeRoadmap.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-primary">{progress}%</p>
                  <p className="text-xs text-muted-foreground">{completedCount}/{totalSteps} done</p>
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </GlassCard>

            {activeRoadmap.steps.map((step, i) => (
              <motion.div key={step.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <GlassCard variant="subtle" className="p-5">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleStep(activeRoadmap.id, step.id)} className="mt-0.5 shrink-0">
                      {step.completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground/30" />}
                    </button>
                    <div className="flex-1">
                      <button onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)} className="flex items-center gap-2 w-full text-left">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">Step {i + 1}</span>
                        <span className={`font-semibold text-sm flex-1 ${step.completed ? "line-through text-muted-foreground" : ""}`}>{step.title}</span>
                        {expandedStep === step.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </button>
                      {expandedStep === step.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                          <ul className="space-y-2 ml-1">
                            {step.substeps.map((sub, j) => (
                              <li key={j} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                                {sub}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard variant="subtle" className="text-center py-20">
            <Map className="h-12 w-12 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-medium">No roadmap selected</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Describe your goal above to generate one</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default Roadmaps;
