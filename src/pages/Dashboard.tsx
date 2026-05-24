import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
    BookOpen,
    Map,
    Brain,
    Code2,
    Swords,
    Clock,
    Activity,
    Sparkles,
    CalendarDays,
    FileText,
    BarChart3,
    CheckCircle2,
    Trophy,
    ArrowUpRight,
    ChevronRight,
    Target,
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
            change: skipClasses.toString(),
            icon: Code2,
        },
        {
            label: "Attendance",
            value: attendancePercent.toString(),
            change: "overall",
            icon: Activity,
        },
        {
            label: "Code Duel Wins",
            value: duelWins.toString(),
            change: "victories",
            icon: Trophy,
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-black min-h-screen text-white font-sans relative">
            <div className="max-w-[1400px] mx-auto px-6 py-8 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                        {greeting},{" "}
                        <span className="text-white/90">
                            {firstName}
                        </span>
                    </h1>
                    <p className="text-sm text-white/40">
                        Track your academic journey and stay productive.
                    </p>
                </motion.div>

                {/* Stats Cards Row */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                >
                    {statsCards.map((stat, i) => (
                        <div
                            key={stat.label}
                            className="bg-black border border-white/10 rounded-2xl p-5 hover:border-white/15 transition-colors duration-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <stat.icon className="h-5 w-5 text-white/60" />
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-white/30" />
                            </div>
                            <p className="text-3xl font-bold text-white tracking-tight mb-1">
                                {stat.value}
                            </p>
                            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-0.5">{stat.label}</p>
                            <p className="text-xs text-white/30">{stat.change}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Main Content Section - Split Layout */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                >
                    {/* Recent Activity - Left (2/3 width) */}
                    <div className="lg:col-span-2 bg-black border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-white/40" />
                                <h2 className="text-sm font-semibold text-white/80 tracking-tight">Recent Activity</h2>
                            </div>
                            <span className="text-[11px] font-medium text-white/30 uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                                {recentActivity.length} Total
                            </span>
                        </div>

                        <div className="overflow-y-auto max-h-[448px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            <div className="space-y-1">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((item, i) => {
                                        const IconComponent = getIcon(item.icon);
                                        return (
                                            <div
                                                key={i}
                                                className="flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-white/[0.03] transition-colors group cursor-default border border-transparent hover:border-white/5"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/8 group-hover:border-white/15 transition-colors">
                                                    <IconComponent className="h-4 w-4 text-white/50 group-hover:text-white/70 transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white/80 truncate">
                                                        {item.action}
                                                    </p>
                                                    <p className="text-xs text-white/40 truncate mt-0.5">
                                                        {item.subject}
                                                    </p>
                                                </div>
                                                <div className="text-xs text-white/30 font-medium shrink-0">
                                                    {item.time}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Activity className="h-10 w-10 text-white/10 mb-3" />
                                        <p className="text-xs font-medium text-white/30 uppercase tracking-widest">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Weekly Summary - Right (1/3 width) */}
                    <div className="lg:col-span-1 bg-black border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart3 className="h-4 w-4 text-white/40" />
                            <h2 className="text-sm font-semibold text-white/80 tracking-tight">Weekly Summary</h2>
                        </div>

                        {weeklySummary.loading ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border border-white/10 border-t-white/20" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {/* Problems Solved */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Code2 className="h-3 w-3 text-white/40" />
                                        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Problems Solved</p>
                                    </div>
                                    <p className="text-xl font-bold text-white tracking-tight">{weeklySummary.problemsSolved}</p>
                                </div>

                                {/* MCQs Attempted */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Brain className="h-3 w-3 text-white/40" />
                                        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">MCQs Attempted</p>
                                    </div>
                                    <p className="text-xl font-bold text-white tracking-tight">{weeklySummary.mcqsAttempted}</p>
                                </div>

                                {/* Accuracy */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="h-3 w-3 text-white/40" />
                                        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Accuracy</p>
                                    </div>
                                    <p className="text-xl font-bold text-white tracking-tight">{weeklySummary.accuracy}%</p>
                                </div>

                                {/* Active Days */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CalendarDays className="h-3 w-3 text-white/40" />
                                        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Active Days</p>
                                    </div>
                                    <p className="text-xl font-bold text-white tracking-tight">{weeklySummary.activeDays}<span className="text-sm text-white/30">/7</span></p>
                                </div>

                                {/* Best Day */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-3 w-3 text-white/40" />
                                        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Best Day</p>
                                    </div>
                                    <p className="text-lg font-bold text-white tracking-tight truncate">
                                        {weeklySummary.bestDay === "N/A" ? "—" : weeklySummary.bestDay}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Modules Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <div className="flex items-center gap-3 mb-5">
                        <Sparkles className="h-4 w-4 text-white/30" />
                        <h2 className="text-sm font-semibold text-white/50 tracking-tight">
                            Modules
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {[
                            { title: "Knowledge Vault", path: "/vault", icon: BookOpen, desc: "Store & access materials" },
                            { title: "AI Roadmap", path: "/roadmap", icon: Map, desc: "Personalized learning path" },
                            { title: "MCQ Generator", path: "/mcq", icon: Brain, desc: "Generate practice tests" },
                            { title: "Testpad", path: "/testpad", icon: Code2, desc: "Track problem solving" },
                            { title: "Code Duel", path: "/duel", icon: Swords, desc: "Compete & win" },
                            { title: "Leave Manager", path: "/leave", icon: CalendarDays, desc: "Manage attendance" },
                        ].map((item) => (
                            <Link key={item.path} to={item.path} className="block group">
                                <div className="bg-black border border-white/10 rounded-2xl p-5 h-full hover:border-white/15 hover:bg-white/[0.02] transition-all duration-200">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-4 group-hover:bg-white/8 group-hover:border-white/15 transition-colors">
                                        <item.icon className="h-5 w-5 text-white/50 group-hover:text-white/70 transition-colors" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-white/80 mb-1 tracking-tight">{item.title}</h3>
                                    <p className="text-xs text-white/40 mb-4 leading-relaxed">{item.desc}</p>
                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/30 group-hover:text-white/50 transition-colors">
                                        <span>OPEN</span>
                                        <ChevronRight className="h-3 w-3" />
                                    </div>
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