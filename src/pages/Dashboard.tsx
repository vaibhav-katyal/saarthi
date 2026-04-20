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
        glowColor: "group-hover:shadow-[0_0_20px_rgba(123,97,255,0.3)]",
        iconColor: "text-[#7B61FF]",
        iconBg: "bg-[#7B61FF]/10",
    },
    {
        title: "AI Roadmap",
        desc: "Personalized learning paths",
        path: "/roadmap",
        icon: Map,
        glowColor: "group-hover:shadow-[0_0_20px_rgba(0,245,255,0.3)]",
        iconColor: "text-[#00F5FF]",
        iconBg: "bg-[#00F5FF]/10",
    },
    {
        title: "MCQ Generator",
        desc: "AI-generated practice tests",
        path: "/mcq",
        icon: Brain,
        glowColor: "group-hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]",
        iconColor: "text-pink-400",
        iconBg: "bg-pink-400/10",
    },
    {
        title: "Testpad",
        desc: "Code & compile in-browser",
        path: "/testpad",
        icon: Code2,
        glowColor: "group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]",
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-400/10",
    },
    {
        title: "Code Duel",
        desc: "1v1 coding challenges",
        path: "/duel",
        icon: Swords,
        glowColor: "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
        iconColor: "text-red-400",
        iconBg: "bg-red-400/10",
    },
    {
        title: "Leave Manager",
        desc: "Attendance & leave tracker",
        path: "/leave",
        icon: CalendarDays,
        glowColor: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]",
        iconColor: "text-amber-400",
        iconBg: "bg-amber-400/10",
    },
];

const performanceBars = [
    { label: "DSA Progress", value: 72, gradient: "bg-gradient-to-r from-[#00F5FF]/40 to-[#00F5FF]" },
    { label: "MCQ Accuracy", value: 85, gradient: "bg-gradient-to-r from-[#7B61FF]/40 to-[#7B61FF]" },
    { label: "Code Quality", value: 68, gradient: "bg-gradient-to-r from-emerald-500/40 to-emerald-500" },
    { label: "Consistency", value: 91, gradient: "bg-gradient-to-r from-amber-500/40 to-amber-500" },
];

const Dashboard = () => {
    const { user } = useAuth();
    const greeting = getGreeting();
    const firstName = user?.name?.split(" ")[0] || "Student";
    const [submissionsCount, setSubmissionsCount] = useState<number | string>("...");
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    // Course Stats State
    const [attendancePercent, setAttendancePercent] = useState<number | string>("...");
    const [leaveBalance, setLeaveBalance] = useState<number | string>("...");
    const [skipClasses, setSkipClasses] = useState<number | string>("...");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                // Fetch Recent Activities
                try {
                    const activityRes = await fetch("http://localhost:5000/api/activity/recent", {
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
                const subRes = await fetch("http://localhost:5000/api/testpad", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (subRes.ok) {
                    const subData = await subRes.json();
                    if (subData.success && Array.isArray(subData.data)) {
                        setSubmissionsCount(subData.data.length);
                    }
                }

                // Fetch Courses for Attendance & Leave
                const courseRes = await fetch("http://localhost:5000/api/courses", {
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
            iconBg: "bg-[#00F5FF]/10",
            colorClass: "text-[#00F5FF]",
        },
        {
            label: "Attendance",
            value: attendancePercent.toString(),
            change: skipClasses.toString(),
            icon: Activity,
            iconBg: "bg-[#7B61FF]/10",
            colorClass: "text-[#7B61FF]",
        },
        {
            label: "Leave Balance",
            value: leaveBalance.toString(),
            change: "Available Skips",
            icon: CalendarDays,
            iconBg: "bg-emerald-500/10",
            colorClass: "text-emerald-400",
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#02040A] min-h-screen text-white font-sans relative pb-10 selection:bg-white/20">
            {/* Cinematic Background Layer */}
            <div className="sticky top-0 left-0 w-full h-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-screen overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-screen" />
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00F5FF]/20 blur-[180px] mix-blend-screen" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#7B61FF]/20 blur-[180px] mix-blend-screen" />
                    <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-pink-500/15 blur-[150px] mix-blend-screen" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 relative z-10 space-y-6 md:space-y-8">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-8 space-y-3"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-neutral-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-1">
                        <LayoutDashboard className="h-3 w-3" />
                        Command Center
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-heading">
                        {greeting},{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                            {firstName}
                        </span>
                        .
                    </h1>
                    <p className="text-sm text-neutral-400 font-medium max-w-xl leading-relaxed">
                        Your academic progress mapped in real-time.
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {statsCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * i }}
                            className="relative group rounded-[1.25rem] bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden flex flex-col hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-[2px] transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                                    <stat.icon className={`h-5 w-5 ${stat.colorClass}`} />
                                </div>
                                <TrendingUp className="h-4 w-4 text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            <p className="text-3xl font-black text-white tracking-tight mb-1 group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] transition-all">
                                {stat.value}
                            </p>
                            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">{stat.label}</p>
                            <p className={`text-[11px] font-bold mt-2 ${stat.colorClass}`}>{stat.change}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Recent Activity */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="lg:col-span-2 rounded-[1.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-5 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#00F5FF]" />
                                <h2 className="text-sm font-semibold text-white tracking-tight">System Logs</h2>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-sm">7 Days</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto max-h-[320px] scrollbar-thin pr-2 space-y-1">
                            {recentActivity && recentActivity.length > 0 ? (
                                    recentActivity.map((item, i) => {
                                        const IconComponent = getIcon(item.icon);
                                        return (
                                            <div
                                                key={i}
                                                className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-white/[0.04] transition-colors group cursor-default"
                                            >
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black border border-white/10 shadow-inner group-hover:border-white/20 transition-colors">
                                                    <IconComponent className="h-4 w-4 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate mb-0.5">
                                                        {item.action}
                                                    </p>
                                                    <p className="text-[11px] text-neutral-500 font-medium truncate">
                                                        {item.subject}
                                                    </p>
                                                </div>
                                                <div className="text-[10px] text-neutral-500 font-medium shrink-0">
                                                    {item.time}
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                    <Activity className="h-8 w-8 text-neutral-700 mb-3" />
                                    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">No recent operations</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Neural Performance */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="rounded-[1.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-5 flex flex-col"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="h-4 w-4 text-[#7B61FF]" />
                            <h2 className="text-sm font-semibold text-white tracking-tight">Performance</h2>
                        </div>

                        <div className="space-y-5 flex-1">
                            {performanceBars.map((bar, i) => (
                                <div key={bar.label}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                                            {bar.label}
                                        </span>
                                        <span className="text-[11px] font-black text-white">
                                            {bar.value}%
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-black/60 overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${bar.value}%` }}
                                            transition={{ duration: 1, delay: 0.4 + (i * 0.1), ease: "easeOut" }}
                                            className={`h-full rounded-full ${bar.gradient}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                                <TrendingUp className="h-3.5 w-3.5" />
                                12% overall improvement
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
                        <Sparkles className="h-4 w-4 text-neutral-400" />
                        <h2 className="text-sm font-semibold text-white tracking-tight">
                            Platform Modules
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {quickAccess.map((item) => (
                            <Link key={item.path} to={item.path} className="block group">
                                <div 
                                    className={`h-full rounded-[1.25rem] bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden flex flex-col transition-all hover:bg-white/[0.08] hover:border-white/30 hover:-translate-y-1 ${item.glowColor}`}
                                >
                                    <div className={`w-10 h-10 mb-4 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs font-medium text-neutral-500 leading-relaxed mb-4">
                                        {item.desc}
                                    </p>
                                    <div className={`mt-auto flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${item.iconColor} opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0`}>
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
