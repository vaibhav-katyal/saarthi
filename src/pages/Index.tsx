import { Bookmark, Map, Code2, Users, CalendarCheck, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";

const stats = [
  { label: "Resources Saved", value: "—", icon: Bookmark, path: "/resources", color: "bg-primary/10 text-primary" },
  { label: "Roadmaps", value: "—", icon: Map, path: "/roadmaps", color: "bg-primary/10 text-primary" },
  { label: "Problems Solved", value: "—", icon: Code2, path: "/testpad", color: "bg-accent text-accent-foreground" },
  { label: "Community Posts", value: "—", icon: Users, path: "/community", color: "bg-secondary text-secondary-foreground" },
];

const quickActions = [
  { label: "Save a Resource", desc: "Store links, code snippets & documents in one organized vault", icon: Bookmark, path: "/resources" },
  { label: "Generate Roadmap", desc: "Get AI-powered step-by-step learning paths for any goal", icon: Map, path: "/roadmaps" },
  { label: "Practice Coding", desc: "Solve problems in a real testpad-style environment", icon: Code2, path: "/testpad" },
  { label: "Check Leaves", desc: "Know exactly how many lectures you can safely skip", icon: CalendarCheck, path: "/leaves" },
  { label: "Community Hub", desc: "Raise issues, vote on complaints, discuss with peers", icon: Users, path: "/community" },
];

const Index = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-10">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-subtle text-xs font-medium text-muted-foreground mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Your college companion
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {greeting}! 👋
            </h1>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-xl">
              Welcome back to Saarthi. Pick up where you left off or explore something new.
            </p>
          </div>
          <div className="hidden lg:block">
            <GlassCard variant="subtle" className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Stay consistent</p>
                <p className="text-xs text-muted-foreground">Keep your streak going</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Link to={stat.path}>
              <GlassCard className="hover:scale-[1.03] transition-transform duration-200 cursor-pointer p-5 h-full">
                <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <span className="text-xs text-muted-foreground">Jump right in →</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
            >
              <Link to={action.path}>
                <GlassCard
                  variant="subtle"
                  className="flex items-start gap-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer p-5 group h-full"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{action.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tip Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base">Pro Tip</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Use the <strong>Resources</strong> section to save any important links, code snippets, or documents you find. 
              No more losing things in WhatsApp chats!
            </p>
          </div>
          <Link
            to="/resources"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          >
            Try it out
          </Link>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Index;
