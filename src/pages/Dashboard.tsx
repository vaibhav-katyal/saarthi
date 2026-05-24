import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
    BookOpen,
    Map,
    Brain,
    Code2,
    Swords,
    TrendingUp,
    Clock,
    Activity,
    Sparkles,
    CalendarDays,
    FileText,
    BarChart3,
    LayoutDashboard,
    CheckCircle2,
    Zap,
    Trophy,
    Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

const iconMap: Record<string, any> = {
    Code2,
    Swords,
    Brain,
    FileText,
    Map,
    CheckCircle2,
};

const getIcon = (iconName: string) => {
    return iconMap[iconName] || Code2;
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
};

const Dashboard = () => {
    const { user } = useAuth();
    const greeting = getGreeting();
    const firstName = user?.name?.split(" ")[0] || "Student";
    const [submissionsCount, setSubmissionsCount] = useState<number | string>("...");
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    const [weeklySummary, setWeeklySummary] = useState({
        problemsSolved: "...",
        mcqsAttempted: "...",
        accuracy: "...",
        activeDays: "...",
        bestDay: "...",
        loading: true
    });

    const [attendancePercent, setAttendancePercent] = useState<number | string>("...");
    const [skipClasses, setSkipClasses] = useState<number | string>("...");
    const [dayStreak, setDayStreak] = useState<number | string>("0");
    const [duelWins, setDuelWins] = useState<number | string>("0");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                try {
                    const summaryRes = await fetch(`${API_BASE_URL}/activity/weekly-summary`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (summaryRes.ok) {
                        const summaryData = await summaryRes.json();
                        if (summaryData.success && summaryData.data) {
                            setWeeklySummary({
                                problemsSolved: summaryData.data.problemsSolved,
                                mcqsAttempted: summaryData.data.mcqsAttempted,
                                accuracy: summaryData.data.accuracy,
                                activeDays: summaryData.data.activeDays,
                                bestDay: summaryData.data.bestDay,
                                loading: false
                            });
                        }
                    }
                } catch (error) {
                    console.error("[Dashboard] Failed to fetch weekly summary:", error);
                    setWeeklySummary(prev => ({ ...prev, loading: false }));
                }

                try {
                    const activityRes = await fetch(`${API_BASE_URL}/activity/recent`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (activityRes.ok) {
                        const activityData = await activityRes.json();
                        if (activityData.success && Array.isArray(activityData.data)) {
                            setRecentActivity(activityData.data);
                        }
                    }
                } catch (error) {
                    console.error("[Dashboard] Failed to fetch recent activities:", error);
                }

                const subRes = await fetch(`${API_BASE_URL}/testpad`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (subRes.ok) {
                    const subData = await subRes.json();
                    if (subData.success && Array.isArray(subData.data)) {
                        setSubmissionsCount(subData.data.length);
                    }
                }

                const courseRes = await fetch(`${API_BASE_URL}/courses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (courseRes.ok) {
                    const courseData = await courseRes.json();
                    if (courseData.success && Array.isArray(courseData.data)) {
                        const courses = courseData.data;
                        if (courses.length > 0) {
                            let totalDelivered = 0;
                            let totalAttended = 0;
                            let totalSafeSkips = 0;

                            courses.forEach((course: any) => {
                                totalDelivered += course.delivered || 0;
                                totalAttended += course.attended || 0;

                                const req = course.requiredAttendance || 75;
                                const del = course.delivered || 0;
                                const att = course.attended || 0;

                                const currentPercent = del === 0 ? 0 : (att / del) * 100;
                                if (currentPercent >= req && req > 0 && del > 0) {
                                    const skipRaw = (100 * att - req * del) / req;
                                    totalSafeSkips += Math.floor(Math.max(0, skipRaw));
                                }
                            });

                            const overallPercent = totalDelivered === 0 ? 0 : (totalAttended / totalDelivered) * 100;
                            setAttendancePercent(overallPercent.toFixed(1) + "%");
                            setSkipClasses("Can skip " + totalSafeSkips);
                        } else {
                            setAttendancePercent("N/A");
                            setSkipClasses("Add courses");
                        }
                    }
                }

                try {
                    const duelRes = await fetch(`${API_BASE_URL}/duel/stats`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (duelRes.ok) {
                        const duelData = await duelRes.json();
                        if (duelData.success && duelData.data) {
                            setDuelWins(duelData.data.wins || 0);
                        }
                    }
                } catch (error) {
                    console.error("[Dashboard] Failed to fetch duel stats:", error);
                }

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchData();
    }, []);

    const statsCards = [
        {
            label: "Problems Solved",
            value: submissionsCount.toString(),
            change: "+12% this week",
            icon: Code2,
            trend: "up",
        },
        {
            label: "Attendance",
            value: attendancePercent.toString(),
            change: skipClasses.toString(),
            icon: Activity,
            trend: "up",
        },
        {
            label: "Weekly Productivity",
            value: "87%",
            change: "+5% from last week",
            icon: Zap,
            trend: "up",
        },
        {
            label: "Day Streak",
            value: weeklySummary.loading ? "..." : String(weeklySummary.activeDays),
            change: "days in a row",
            icon: Flame,
            trend: "neutral",
        },
        {
            label: "Code Duel Wins",
            value: duelWins.toString(),
            change: "victories",
            icon: Trophy,
            trend: "up",
        },
    ];

    const initialActivities = recentActivity.slice(0, 7);
    const remainingActivities = recentActivity.slice(7);

    return (
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-black min-h-screen text-white font-sans relative pb-10 selection:bg-white/20">
            {/* Subtle Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 relative z-10 space-y-8">

                {/* Header - Same Style */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="space-y-3"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white/50 mb-2">
                        <LayoutDashboard className="h-3 w-3" />
                        Dashboard
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-heading">
                        {greeting},{" "}
                        <span className="text-white">
                            {firstName}
                        </span>
                        .
                    </h1>
                    <p className="text-sm text-white/40 max-w-xl leading-relaxed">
                        Track your academic journey and stay productive.
                    </p>
                </motion.div>

                {/* Stats Cards Row - 5 Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {statsCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 * i }}
                            className="group rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center border border-white/[0.08]">
                                    <stat.icon className="h-4 w-4 text-white/60" />
                                </div>
                                {stat.trend === "up" && (
                                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400/60" />
                                )}
                            </div>
                            <p className="text-2xl font-bold text-white tracking-tight mb-0.5">
                                {stat.value}
                            </p>
                            <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-[10px] text-white/30">{stat.change}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Weekly Summary - Horizontal Analytics Format */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5"
                >
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart3 className="h-4 w-4 text-white/40" />
                        <h2 className="text-sm font-medium text-white/80 tracking-tight">Weekly Summary</h2>
                    </div>

                    {weeklySummary.loading ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border border-white/10 border-t-white/20" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {/* Problems Solved */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Problems Solved</p>
                                <p className="text-3xl font-bold text-white tracking-tight">{weeklySummary.problemsSolved}</p>
                                <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-white/20 to-white/40"
                                        style={{ width: `${Math.min((Number(weeklySummary.problemsSolved) / 50) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* MCQs Attempted */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">MCQs Attempted</p>
                                <p className="text-3xl font-bold text-white tracking-tight">{weeklySummary.mcqsAttempted}</p>
                                <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-white/20 to-white/40"
                                        style={{ width: `${Math.min((Number(weeklySummary.mcqsAttempted) / 30) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Accuracy */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Accuracy</p>
                                <p className="text-3xl font-bold text-emerald-400 tracking-tight">{weeklySummary.accuracy}%</p>
                                <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400/30 to-emerald-400/50"
                                        style={{ width: `${Math.min(Number(weeklySummary.accuracy), 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Active Days */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Active Days</p>
                                <p className="text-3xl font-bold text-white tracking-tight">{weeklySummary.activeDays}<span className="text-sm text-white/30">/7</span></p>
                                <div className="flex gap-1">
                                    {[...Array(7)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full ${i < Number(weeklySummary.activeDays) ? 'bg-white/40' : 'bg-white/[0.05]'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Best Day */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Best Day</p>
                                <p className="text-lg font-bold text-white tracking-tight truncate">
                                    {weeklySummary.bestDay === "N/A" ? "—" : weeklySummary.bestDay}
                                </p>
                                <div className="flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3 text-white/30" />
                                    <span className="text-[10px] text-white/30">this week</span>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Recent Activity with Scroll */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5"
                >
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-white/40" />
                            <h2 className="text-sm font-medium text-white/80 tracking-tight">Recent Activity</h2>
                        </div>
                        <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
                            {recentActivity.length} Total
                        </span>
                    </div>

                    {/* Initial 7 activities - no scroll */}
                    <div className="space-y-1 mb-2">
                        {initialActivities.length > 0 ? (
                            initialActivities.map((item, i) => {
                                const IconComponent = getIcon(item.icon);
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.03] transition-colors group cursor-default"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] group-hover:bg-white/[0.08] transition-colors">
                                            <IconComponent className="h-3.5 w-3.5 text-white/50 group-hover:text-white/70 transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white/80 truncate">
                                                {item.action}
                                            </p>
                                            <p className="text-[11px] text-white/30 truncate">
                                                {item.subject}
                                            </p>
                                        </div>
                                        <div className="text-[10px] text-white/30 font-medium shrink-0">
                                            {item.time}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Activity className="h-8 w-8 text-white/10 mb-3" />
                                <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest">No recent activity</p>
                            </div>
                        )}
                    </div>

                    {/* Remaining activities with vertical scroll */}
                    {remainingActivities.length > 0 && (
                        <div className="overflow-y-auto max-h-[280px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pt-2 border-t border-white/[0.04]">
                            <div className="space-y-1">
                                {remainingActivities.map((item, i) => {
                                    const IconComponent = getIcon(item.icon);
                                    return (
                                        <div
                                            key={i + 7}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.03] transition-colors group cursor-default"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] group-hover:bg-white/[0.08] transition-colors">
                                                <IconComponent className="h-3.5 w-3.5 text-white/50 group-hover:text-white/70 transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white/80 truncate">
                                                    {item.action}
                                                </p>
                                                <p className="text-[11px] text-white/30 truncate">
                                                    {item.subject}
                                                </p>
                                            </div>
                                            <div className="text-[10px] text-white/30 font-medium shrink-0">
                                                {item.time}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Platform Quick Access - Minimal */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-4 w-4 text-white/30" />
                        <h2 className="text-sm font-medium text-white/50 tracking-tight">
                            Quick Access
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {[
                            { title: "Knowledge Vault", path: "/vault", icon: BookOpen },
                            { title: "AI Roadmap", path: "/roadmap", icon: Map },
                            { title: "MCQ Generator", path: "/mcq", icon: Brain },
                            { title: "Testpad", path: "/testpad", icon: Code2 },
                            { title: "Code Duel", path: "/duel", icon: Swords },
                            { title: "Leave Manager", path: "/leave", icon: CalendarDays },
                        ].map((item) => (
                            <Link key={item.path} to={item.path} className="block group">
                                <div className="flex items-center gap-2 rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200">
                                    <item.icon className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors" />
                                    <span className="text-xs font-medium text-white/50 group-hover:text-white/70 transition-colors truncate">
                                        {item.title.split(' ')[0]}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;