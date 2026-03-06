import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
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
    LayoutDashboard,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

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
        color: "text-accent",
        iconBg: "bg-accent/10",
    },
    {
        title: "AI Roadmap",
        desc: "Personalized learning paths",
        path: "/roadmap",
        icon: Map,
        color: "text-primary",
        iconBg: "bg-primary/10",
    },
    {
        title: "MCQ Generator",
        desc: "AI-generated practice tests",
        path: "/mcq",
        icon: Brain,
        color: "text-pink-400",
        iconBg: "bg-pink-400/10",
    },
    {
        title: "Testpad",
        desc: "Code & compile in-browser",
        path: "/testpad",
        icon: Code2,
        color: "text-emerald-400",
        iconBg: "bg-emerald-400/10",
    },
    {
        title: "Code Duel",
        desc: "1v1 coding challenges",
        path: "/duel",
        icon: Swords,
        color: "text-orange-400",
        iconBg: "bg-orange-400/10",
    },
    {
        title: "Leave Manager",
        desc: "Attendance & leave tracker",
        path: "/leave",
        icon: Calculator,
        color: "text-yellow-400",
        iconBg: "bg-yellow-400/10",
    },
];

const statsCards = [
    {
        label: "MCQs Attempted",
        value: "48",
        change: "+12 this week",
        icon: CheckCircle2,
        color: "text-accent",
        iconBg: "bg-accent/10",
    },
    {
        label: "Code Submissions",
        value: "23",
        change: "+5 this week",
        icon: Code2,
        color: "text-emerald-400",
        iconBg: "bg-emerald-400/10",
    },
    {
        label: "Attendance",
        value: "87%",
        change: "Can skip 3 classes",
        icon: Activity,
        color: "text-primary",
        iconBg: "bg-primary/10",
    },
    {
        label: "Leave Balance",
        value: "6 days",
        change: "2 planned",
        icon: CalendarDays,
        color: "text-orange-400",
        iconBg: "bg-orange-400/10",
    },
];

const recentActivity = [
    {
        action: "Completed MCQ set",
        subject: "Data Structures — Trees & Graphs",
        time: "2 hours ago",
        icon: Brain,
        color: "text-pink-400",
        iconBg: "bg-pink-400/10",
    },
    {
        action: "Submitted solution",
        subject: "Two Sum — Testpad",
        time: "5 hours ago",
        icon: Code2,
        color: "text-emerald-400",
        iconBg: "bg-emerald-400/10",
    },
    {
        action: "Saved note",
        subject: "DBMS Normalization Summary",
        time: "Yesterday",
        icon: FileText,
        color: "text-accent",
        iconBg: "bg-accent/10",
    },
    {
        action: "Generated roadmap",
        subject: "Full-Stack Development Path",
        time: "2 days ago",
        icon: Map,
        color: "text-primary",
        iconBg: "bg-primary/10",
    },
    {
        action: "Won Code Duel",
        subject: "vs @rahul — Array Problem",
        time: "3 days ago",
        icon: Swords,
        color: "text-orange-400",
        iconBg: "bg-orange-400/10",
    },
];

const performanceBars = [
    { label: "DSA Progress", value: 72, color: "bg-accent" },
    { label: "MCQ Accuracy", value: 85, color: "bg-primary" },
    { label: "Code Quality", value: 68, color: "bg-emerald-400" },
    { label: "Consistency", value: 91, color: "bg-orange-400" },
];

const Dashboard = () => {
    const { user } = useAuth();
    const greeting = getGreeting();
    const firstName = user?.name?.split(" ")[0] || "Student";

    return (
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#070B14] min-h-screen text-white font-sans relative pb-10">
            {/* Background Noise & Gradient — same as PageWrapper */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
                <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[150px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[50%] rounded-full bg-accent/10 blur-[180px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-4 md:py-6 relative z-10 space-y-6">
                {/* Header — matches PageWrapper pattern */}
                <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-[0_0_20px_rgba(0,245,255,0.15)] mb-1">
                        <LayoutDashboard className="h-3 w-3" />
                        Dashboard
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-heading">
                        {greeting},{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            {firstName}
                        </span>
                        ! 👋
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                        Here's what's happening across your Saarthi workspace.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
                    {statsCards.map((stat) => (
                        <GlassCard key={stat.label} hover>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <TrendingUp className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-2xl font-extrabold text-foreground tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                            <p className={`text-xs mt-2 ${stat.color}`}>{stat.change}</p>
                        </GlassCard>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in zoom-in-95 duration-500">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <GlassCard>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2.5">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Recent Activity
                                    </h2>
                                </div>
                                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                    Last 7 days
                                </span>
                            </div>
                            <div className="space-y-1">
                                {recentActivity.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-white/5 transition-colors cursor-default"
                                    >
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}>
                                            <item.icon className={`h-4 w-4 ${item.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {item.action}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {item.subject}
                                            </p>
                                        </div>
                                        <span className="text-[11px] text-muted-foreground shrink-0">
                                            {item.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Performance Overview */}
                    <GlassCard>
                        <div className="flex items-center gap-2.5 mb-5">
                            <BarChart3 className="h-4 w-4 text-accent" />
                            <h2 className="text-sm font-semibold text-foreground">
                                Performance
                            </h2>
                        </div>

                        <div className="space-y-5">
                            {performanceBars.map((bar) => (
                                <div key={bar.label}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {bar.label}
                                        </span>
                                        <span className="text-xs font-bold text-foreground">
                                            {bar.value}%
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-black/40 overflow-hidden border border-white/5">
                                        <div
                                            className={`h-full rounded-full ${bar.color} transition-all duration-1000 ease-out`}
                                            style={{ width: `${bar.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs text-emerald-400">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span className="font-medium">12% improvement this month</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Quick Access Grid */}
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-2.5 mb-4 px-1">
                        <Sparkles className="h-4 w-4 text-pink-400" />
                        <h2 className="text-sm font-semibold text-foreground">
                            Quick Access
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {quickAccess.map((item) => (
                            <Link key={item.path} to={item.path} className="block group">
                                <GlassCard hover className="h-full">
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg} mb-4`}>
                                        <item.icon className={`h-5 w-5 ${item.color}`} />
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                        {item.desc}
                                    </p>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                                        Open
                                        <ArrowRight className="h-3 w-3" />
                                    </div>
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
