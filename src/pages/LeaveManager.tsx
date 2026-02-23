import { useState, useMemo } from "react";
import { Calculator, TrendingDown, AlertTriangle, Info } from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";

export default function LeaveManager() {
  const [currentAttendance, setCurrentAttendance] = useState(78);
  const [targetAttendance, setTargetAttendance] = useState(75);
  const [totalClasses, setTotalClasses] = useState(120);

  const result = useMemo(() => {
    const attended = Math.round((currentAttendance / 100) * totalClasses);
    const required = Math.ceil((targetAttendance / 100) * totalClasses);
    const canSkip = attended - required;

    return {
      attended,
      canSkip: Math.max(0, canSkip),
      safe: canSkip > 0,
      message:
        canSkip > 0
          ? `You can safely skip ${canSkip} more lectures.`
          : canSkip === 0
          ? "You're at the edge — don't skip any."
          : `You need to attend ${Math.abs(canSkip)} more lectures.`,
    };
  }, [currentAttendance, targetAttendance, totalClasses]);

  return (
    <PageWrapper title="Leave Manager" subtitle="Calculate how many lectures you can safely skip">
      <div className="mx-auto max-w-md space-y-4">
        {/* Calculator Card */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Attendance Calculator</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Current Attendance</label>
                <span className="text-xs font-semibold text-foreground">{currentAttendance}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={currentAttendance}
                onChange={(e) => setCurrentAttendance(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Target Attendance</label>
                <span className="text-xs font-semibold text-foreground">{targetAttendance}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={targetAttendance}
                onChange={(e) => setTargetAttendance(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Total Classes</label>
              <input
                type="number"
                value={totalClasses}
                onChange={(e) => setTotalClasses(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary/40 transition-colors"
              />
            </div>
          </div>
        </GlassCard>

        {/* Result Card */}
        <GlassCard>
          <div className="text-center py-2">
            <div className="mb-3">
              {result.safe ? (
                <TrendingDown className="h-5 w-5 text-success mx-auto mb-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-2" />
              )}
              <span className={`text-4xl font-bold ${result.safe ? "text-success" : "text-warning"}`}>
                {result.canSkip}
              </span>
              <p className="text-xs text-muted-foreground mt-1">lectures you can skip</p>
            </div>
            <p className="text-sm text-foreground">{result.message}</p>
            <p className="mt-3 text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Info className="h-3 w-3" />
              Attended {result.attended} of {totalClasses} classes
            </p>
          </div>
        </GlassCard>

        {/* Tips */}
        <GlassCard>
          <h3 className="text-xs font-medium text-foreground mb-2">Quick Tips</h3>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• Most colleges require 75% minimum for exam eligibility</li>
            <li>• Plan leaves early when your percentage is high</li>
            <li>• Medical leaves are usually separate — check your policy</li>
          </ul>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}
