import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BookOpen,
    Map,
    Brain,
    Code2,
    Users,
    Calculator,
    Swords,
    TrendingUp,
    CheckCircle2,
    Clock,
    Activity,
    Sparkles,
    ArrowRight,
    CalendarDays,
    FileText,
    BarChart3,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    }),
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
        color: "#7B61FF",
        bg: "from-[#7B61FF]/20 to-[#7B61FF]/5",
    },
    {
        title: "AI Roadmap",
        desc: "Personalized learning paths",
        path: "/roadmap",
        icon: Map,
        color: "#00F5FF",
        bg: "from-[#00F5FF]/20 to-[#00F5FF]/5",
    },
    {
        title: "MCQ Generator",
        desc: "AI-generated practice tests",
        path: "/mcq",
        icon: Brain,
        color: "#F472B6",
        bg: "from-[#F472B6]/20 to-[#F472B6]/5",
    },
    {
        title: "Testpad",
        desc: "Code & compile in-browser",
        path: "/testpad",
        icon: Code2,
        color: "#22C55E",
        bg: "from-[#22C55E]/20 to-[#22C55E]/5",
    },
    {
        title: "Code Duel",
        desc: "1v1 coding challenges",
        path: "/duel",
        icon: Swords,
        color: "#F97316",
        bg: "from-[#F97316]/20 to-[#F97316]/5",
    },
    {
        title: "Community",
        desc: "Discuss & collaborate",
        path: "/community",
        icon: Users,
        color: "#0EA5E9",
        bg: "from-[#0EA5E9]/20 to-[#0EA5E9]/5",
    },
    {
        title: "Leave Manager",
        desc: "Attendance & leave tracker",
        path: "/leave",
        icon: Calculator,
        color: "#EAB308",
        bg: "from-[#EAB308]/20 to-[#EAB308]/5",
    },
];

const statsCards = [
    {
        label: "MCQs Attempted",
        value: "48",
        change: "+12 this week",
        icon: CheckCircle2,
        color: "#7B61FF",
        trend: "up",
    },
    {
        label: "Code Submissions",
        value: "23",
        change: "+5 this week",
        icon: Code2,
        color: "#22C55E",
        trend: "up",
    },
    {
        label: "Attendance",
        value: "87%",
        change: "Can skip 3 classes",
        icon: Activity,
        color: "#0EA5E9",
        trend: "up",
    },
    {
        label: "Leave Balance",
        value: "6 days",
        change: "2 planned",
        icon: CalendarDays,
        color: "#F97316",
        trend: "neutral",
    },
];

const recentActivity = [
    {
        action: "Completed MCQ set",
        subject: "Data Structures — Trees & Graphs",
        time: "2 hours ago",
        icon: Brain,
        color: "#F472B6",
    },
    {
        action: "Submitted solution",
        subject: "Two Sum — Testpad",
        time: "5 hours ago",
        icon: Code2,
        color: "#22C55E",
    },
    {
        action: "Saved note",
        subject: "DBMS Normalization Summary",
        time: "Yesterday",
        icon: FileText,
        color: "#7B61FF",
    },
    {
        action: "Generated roadmap",
        subject: "Full-Stack Development Path",
        time: "2 days ago",
        icon: Map,
        color: "#00F5FF",
    },
    {
        action: "Won Code Duel",
        subject: "vs @rahul — Array Problem",
        time: "3 days ago",
        icon: Swords,
        color: "#F97316",
    },
];

const Dashboard = () => {
    const { user } = useAuth();
    const greeting = getGreeting();
    const firstName = user?.name?.split(" ")[0] || "Student";

    return (
        <div className="flex-1 overflow-y-auto bg-background">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00F5FF]/20 to-[#7B61FF]/20 border border-white/10">
                            <Sparkles className="h-5 w-5 text-[#00F5FF]" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-[#00F5FF]">
                            Dashboard
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                        {greeting},{" "}
                        <span className="bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] bg-clip-text text-transparent">
                            {firstName}
                        </span>
                        ! 👋
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Here's what's happening across your Saarthi workspace.
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={1}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
                >
                    {statsCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            custom={i + 1}
                            className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{ backgroundColor: `${stat.color}15` }}
                                >
                                    <stat.icon
                                        className="h-5 w-5"
                                        style={{ color: stat.color }}
                                    />
                                </div>
                                <TrendingUp
                                    className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                            <p className="text-2xl font-bold text-foreground tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                            <p className="text-xs mt-2" style={{ color: stat.color }}>
                                {stat.change}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* Recent Activity */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={3}
                        className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2.5">
                                <Clock className="h-4 w-4 text-[#00F5FF]" />
                                <h2 className="text-sm font-semibold text-foreground">
                                    Recent Activity
                                </h2>
                            </div>
                            <span className="text-xs text-muted-foreground">Last 7 days</span>
                        </div>
                        <div className="space-y-1">
                            {recentActivity.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeUp}
                                    custom={i + 3}
                                    className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-white/[0.03] transition-colors group cursor-default"
                                >
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                        style={{ backgroundColor: `${item.color}15` }}
                                    >
                                        <item.icon
                                            className="h-4 w-4"
                                            style={{ color: item.color }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {item.action}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {item.subject}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {item.time}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Performance Overview */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={4}
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-2.5 mb-6">
                            <BarChart3 className="h-4 w-4 text-[#7B61FF]" />
                            <h2 className="text-sm font-semibold text-foreground">
                                Performance
                            </h2>
                        </div>

                        <div className="space-y-5">
                            {[
                                { label: "DSA Progress", value: 72, color: "#7B61FF" },
                                { label: "MCQ Accuracy", value: 85, color: "#00F5FF" },
                                { label: "Code Quality", value: 68, color: "#22C55E" },
                                { label: "Consistency", value: 91, color: "#F97316" },
                            ].map((bar, i) => (
                                <div key={bar.label}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {bar.label}
                                        </span>
                                        <span
                                            className="text-xs font-bold"
                                            style={{ color: bar.color }}
                                        >
                                            {bar.value}%
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${bar.value}%` }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.3 + i * 0.15,
                                                ease: "easeOut",
                                            }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: bar.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-5 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs text-emerald-400">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span className="font-medium">12% improvement this month</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Access Grid */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={5}
                >
                    <div className="flex items-center gap-2.5 mb-5">
                        <Sparkles className="h-4 w-4 text-[#F472B6]" />
                        <h2 className="text-sm font-semibold text-foreground">
                            Quick Access
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {quickAccess.map((item, i) => (
                            <motion.div
                                key={item.path}
                                initial="hidden"
                                animate="visible"
                                variants={fadeUp}
                                custom={i + 6}
                            >
                                <Link
                                    to={item.path}
                                    className="group flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 h-full"
                                >
                                    <div>
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.bg} mb-4`}
                                        >
                                            <item.icon
                                                className="h-5 w-5"
                                                style={{ color: item.color }}
                                            />
                                        </div>
                                        <h3 className="text-sm font-semibold text-foreground mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-4 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: item.color }}>
                                        Open
                                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
