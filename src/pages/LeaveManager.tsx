import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import { Calculator, AlertTriangle, PartyPopper, BookOpen, CalendarCheck, TrendingDown, TrendingUp } from "lucide-react";

const LeaveManager = () => {
  const [totalLectures, setTotalLectures] = useState("");
  const [attended, setAttended] = useState("");
  const [requiredPercent, setRequiredPercent] = useState("75");
  const [result, setResult] = useState<{
    currentPercent: number;
    canSkip: number;
    needToAttend: number;
    status: "safe" | "warning" | "danger";
  } | null>(null);

  const calculate = () => {
    const total = parseInt(totalLectures);
    const att = parseInt(attended);
    const req = parseInt(requiredPercent);
    if (isNaN(total) || isNaN(att) || isNaN(req) || total <= 0 || att < 0 || att > total || req <= 0 || req > 100) return;

    const currentPercent = (att / total) * 100;
    const canSkipRaw = (100 * att - req * total) / req;
    const canSkip = Math.max(0, Math.floor(canSkipRaw));
    let needToAttend = 0;
    if (currentPercent < req) {
      needToAttend = Math.ceil((req * total - 100 * att) / (100 - req));
    }
    const status: "safe" | "warning" | "danger" =
      currentPercent >= req + 10 ? "safe" : currentPercent >= req ? "warning" : "danger";
    setResult({ currentPercent, canSkip, needToAttend, status });
  };

  const statusConfig = {
    safe: { icon: PartyPopper, label: "You're safe! 🎉", desc: "You have room to take breaks.", color: "text-primary", bg: "bg-primary/10" },
    warning: { icon: AlertTriangle, label: "Be careful!", desc: "You're close to the limit.", color: "text-accent-foreground", bg: "bg-accent" },
    danger: { icon: AlertTriangle, label: "Attendance too low!", desc: "You need to attend more lectures.", color: "text-destructive", bg: "bg-destructive/10" },
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Leave Manager</h1>
        <p className="text-muted-foreground text-sm mt-1">Calculate how many lectures you can safely skip.</p>
      </motion.div>

      {/* Calculator */}
      <GlassCard className="space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <CalendarCheck className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Attendance Calculator</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Total Lectures</label>
            <input type="number" value={totalLectures} onChange={(e) => setTotalLectures(e.target.value)}
              placeholder="e.g. 120" min="1"
              className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Attended</label>
            <input type="number" value={attended} onChange={(e) => setAttended(e.target.value)}
              placeholder="e.g. 95" min="0"
              className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Required %</label>
            <input type="number" value={requiredPercent} onChange={(e) => setRequiredPercent(e.target.value)}
              placeholder="75" min="1" max="100"
              className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <button onClick={calculate}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full justify-center"
        >
          <Calculator className="h-4 w-4" /> Calculate
        </button>
      </GlassCard>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
          {/* Status Banner */}
          {(() => {
            const config = statusConfig[result.status];
            return (
              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-2xl ${config.bg} flex items-center justify-center shrink-0`}>
                    <config.icon className={`h-7 w-7 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
                    <p className="text-sm text-muted-foreground">{config.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-bold">{result.currentPercent.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">current attendance</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                    <motion.div
                      className={`h-full rounded-full ${
                        result.status === "danger" ? "bg-destructive" : result.status === "warning" ? "bg-accent-foreground" : "bg-primary"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(result.currentPercent, 100)}%` }}
                      transition={{ duration: 0.8 }}
                    />
                    {/* Required marker */}
                    <div className="absolute top-0 h-full w-0.5 bg-foreground/30"
                      style={{ left: `${parseInt(requiredPercent)}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground">0%</span>
                    <span className="text-[10px] text-muted-foreground/60" style={{ marginLeft: `${parseInt(requiredPercent) - 10}%` }}>
                      {requiredPercent}% required
                    </span>
                    <span className="text-[10px] text-muted-foreground">100%</span>
                  </div>
                </div>
              </GlassCard>
            );
          })()}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard variant="subtle" className="p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold">{result.canSkip}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {result.canSkip === 1 ? "lecture you can skip" : "lectures you can skip"}
              </p>
            </GlassCard>
            <GlassCard variant="subtle" className="p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
              <p className="text-3xl font-bold">{result.needToAttend}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {result.needToAttend === 0 ? "no extra needed" : "must attend to recover"}
              </p>
            </GlassCard>
          </div>

          {/* Tip */}
          <GlassCard variant="subtle" className="p-5 flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">How it works</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                We calculate based on the formula: <code className="glass-input px-1.5 py-0.5 rounded text-[10px]">X = (100×A − R×T) ÷ R</code> where A = attended, T = total, R = required %. 
                The "must attend" count assumes all future lectures are attended consecutively.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default LeaveManager;
