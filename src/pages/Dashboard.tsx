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
    ArrowRight,
    CalendarDays,
    FileText,
    BarChart3,
    LayoutDashboard,
    CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

// Icon mapping for activities
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

const quickAccess = [
    {
        title: "Knowledge Vault",
        desc: "AI-powered notes & summaries",
        path: "/vault",
        icon: BookOpen,
        iconColor: "text-slate-100",
        iconBg: "bg-white/10",
    },
    {
        title: "AI Roadmap",
        desc: "Personalized learning paths",
        path: "/roadmap",
        icon: Map,
        iconColor: "text-slate-100",
        iconBg: "bg-white/10",
    },
    {
        title: "MCQ Generator",
        desc: "AI-generated practice tests",
        path: "/mcq",
        icon: Brain,
        iconColor: "text-slate-100",
        iconBg: "bg-white/10",
    },
    {
        title: "Testpad",
        desc: "Code & compile in-browser",
        path: "/testpad",
        icon: Code2,
        iconColor: "text-slate-100",
        iconBg: "bg-white/10",
    },
    {
        title: "Code Duel",
        desc: "1v1 coding challenges",
        path: "/duel",
        icon: Swords,
        iconColor: "text-slate-100",
        iconBg: "bg-white/10",
    },
    {
        title: "Leave Manager",
        desc: "Attendance & leave tracker",
        path: "/leave",
        icon: CalendarDays,
        iconColor: "text-slate-100",
        iconBg: "bg-white/10",
    },
];

const Dashboard = () => {
    const { user } = useAuth();
    const greeting = getGreeting();
    const firstName = user?.name?.split(" ")[0] || "Student";
    const [submissionsCount, setSubmissionsCount] = useState<number | string>("...");
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    // Weekly Summary State
    const [weeklySummary, setWeeklySummary] = useState({
        problemsSolved: "...",
        mcqsAttempted: "...",
        accuracy: "...",
        activeDays: "...",
        bestDay: "...",
        loading: true
    });

    // Course Stats State
    const [attendancePercent, setAttendancePercent] = useState<number | string>("...");
    const [leaveBalance, setLeaveBalance] = useState<number | string>("...");
    const [skipClasses, setSkipClasses] = useState<number | string>("...");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                // Fetch Weekly Summary
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

                // Fetch Recent Activities
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

                // Fetch Submissions
                const subRes = await fetch(`${API_BASE_URL}/testpad`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (subRes.ok) {
                    const subData = await subRes.json();
                    if (subData.success && Array.isArray(subData.data)) {
                        setSubmissionsCount(subData.data.length);
                    }
                }

                // Fetch Courses for Attendance & Leave
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

                            setLeaveBalance(totalSafeSkips.toString() + (totalSafeSkips === 1 ? " class" : " classes"));
                            setSkipClasses("Can skip " + totalSafeSkips);
                        } else {
                            setAttendancePercent("N/A");
                            setLeaveBalance("0 classes");
                            setSkipClasses("Add some courses");
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchData();
    }, []);

    const statsCards = [
        {
            label: "Code Submissions",
            value: submissionsCount.toString(),
            change: "Total Solved",
            icon: Code2,
            iconBg: "bg-white/10",
            colorClass: "text-slate-100",
        },
        {
            label: "Attendance",
            value: attendancePercent.toString(),
            change: skipClasses.toString(),
            icon: Activity,
            iconBg: "bg-white/10",
            colorClass: "text-slate-100",
        },
        {
            label: "Leave Balance",
            value: leaveBalance.toString(),
            change: "Available Skips",
            icon: CalendarDays,
            iconBg: "bg-white/10",
            colorClass: "text-slate-100",
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-black min-h-screen text-white font-sans relative pb-10 selection:bg-white/20">
            {/* Subtle Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px'
                }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/50" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 relative z-10 space-y-6 md:space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-8 space-y-3"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white/60 mb-1">
                        <LayoutDashboard className="h-3 w-3" />
                        Overview
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-heading">
                        {greeting},{" "}
                        <span className="text-white">
                            {firstName}
                        </span>
                        .
                    </h1>
                    <p className="text-sm text-white/40 max-w-xl leading-relaxed">
                        Your academic progress mapped in real-time.
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statsCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * i }}
                            className="relative group rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 overflow-hidden hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center border border-white/10`}>
                                    <stat.icon className={`h-5 w-5 ${stat.colorClass}`} />
                                </div>
                                <TrendingUp className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
                            </div>

                            <p className="text-3xl font-bold text-white tracking-tight mb-1">
                                {stat.value}
                            </p>
                            <p className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em] mb-2">{stat.label}</p>
                            <p className="text-sm font-medium text-white/50">{stat.change}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-5 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-white/40" />
                                <h2 className="text-sm font-medium text-white tracking-tight">Recent Activity</h2>
                            </div>
                            <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">7 Days</span>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2 space-y-1 min-h-0 max-h-[400px]">
                            {recentActivity && recentActivity.length > 0 ? (
                                recentActivity.map((item, i) => {
                                    const IconComponent = getIcon(item.icon);
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/[0.03] transition-colors group cursor-default border border-transparent hover:border-white/[0.05]"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] group-hover:bg-white/[0.08] transition-colors">
                                                <IconComponent className="h-4 w-4 text-white/50 group-hover:text-white/80 transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate mb-0.5">
                                                    {item.action}
                                                </p>
                                                <p className="text-[11px] text-white/30 font-medium truncate">
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
                                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                    <Activity className="h-8 w-8 text-white/10 mb-3" />
                                    <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Weekly Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-white/40" />
                                <h2 className="text-sm font-medium text-white tracking-tight">Weekly Summary</h2>
                            </div>
                        </div>

                        {weeklySummary.loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border border-white/10 border-t-white/20 mb-3" />
                                <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest">Loading...</p>
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1">
                                {/* Problems Solved */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 transition-colors">
                                    <div>
                                        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Problems Solved</p>
                                        <p className="text-xl font-bold text-white mt-0.5">{weeklySummary.problemsSolved}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center border border-white/[0.08]">
                                        <Code2 className="h-4 w-4 text-white/60" />
                                    </div>
                                </div>

                                {/* MCQs Attempted */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 transition-colors">
                                    <div>
                                        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">MCQs Attempted</p>
                                        <p className="text-xl font-bold text-white mt-0.5">{weeklySummary.mcqsAttempted}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center border border-white/[0.08]">
                                        <Brain className="h-4 w-4 text-white/60" />
                                    </div>
                                </div>

                                {/* Accuracy */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 transition-colors">
                                    <div>
                                        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Accuracy</p>
                                        <p className="text-xl font-bold text-white mt-0.5">{weeklySummary.accuracy}%</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center border border-white/[0.08]">
                                        <CheckCircle2 className="h-4 w-4 text-white/60" />
                                    </div>
                                </div>

                                {/* Active Days */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10 transition-colors">
                                    <div>
                                        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Active Days</p>
                                        <p className="text-xl font-bold text-white mt-0.5">{weeklySummary.activeDays}<span className="text-[10px] text-white/30"> / 7</span></p>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center border border-white/[0.08]">
                                        <Activity className="h-4 w-4 text-white/60" />
                                    </div>
                                </div>

                                {/* Best Day */}
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CalendarDays className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                                        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                                            Best Day
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-white/60 truncate">
                                        {weeklySummary.bestDay === "N/A" ? "No activity yet" : weeklySummary.bestDay}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-white/[0.06]">
                            <div className="flex items-center gap-2 text-xs font-medium text-white/30">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Current Week Summary
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Modules Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Sparkles className="h-4 w-4 text-white/30" />
                        <h2 className="text-sm font-medium text-white/60 tracking-tight">
                            Platform Modules
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {quickAccess.map((item) => (
                            <Link key={item.path} to={item.path} className="block group">
                                <div
                                    className="h-full rounded-xl bg-white/[0.03] border border-white/[0.08] p-5 overflow-hidden flex flex-col transition-all hover:bg-white/[0.05] hover:border-white/12 hover:-translate-y-0.5 duration-200"
                                >
                                    <div className={`w-10 h-10 mb-4 rounded-lg ${item.iconBg} flex items-center justify-center border border-white/[0.08]`}>
                                        <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                                    </div>
                                    <h3 className="text-sm font-medium text-white mb-1.5 leading-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs font-medium text-white/30 leading-relaxed mb-4">
                                        {item.desc}
                                    </p>
                                    <div className="mt-auto flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/30 group-hover:text-white/60 transition-colors">
                                        Open
                                        <ArrowRight className="h-3 w-3" />
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
