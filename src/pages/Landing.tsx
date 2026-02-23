import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Map,
  Code2,
  Users,
  Calculator,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Knowledge Vault",
    description: "Save links, code snippets, and PDFs. AI-powered summarization keeps your notes organized and actionable.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Map,
    title: "AI Roadmap Architect",
    description: "Describe your goal and get an interactive, step-by-step learning path with resources and milestones.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Code2,
    title: "Testpad Pro",
    description: "Split-pane coding environment with AI-generated problems, boilerplate code, and simulated test execution.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Community Forum",
    description: "Raise issues, upvote concerns, and track resolution status across your campus community.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Calculator,
    title: "Leave Manager",
    description: "Calculate exactly how many lectures you can skip while maintaining your target attendance percentage.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const stats = [
  { value: "5+", label: "Productivity Tools" },
  { value: "AI", label: "Powered Features" },
  { value: "100%", label: "Free to Use" },
  { value: "∞", label: "Learning Paths" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Saarthi</span>
          </div>
          <Link
            to="/vault"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Subtle gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Your Academic Companion — Powered by AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Everything you need to
            <br />
            <span className="text-gradient">ace college</span>, in one place.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-base text-muted-foreground leading-relaxed"
          >
            Saarthi combines AI-powered learning paths, a smart knowledge vault,
            coding practice, and campus tools — so you can focus on what matters.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Link
              to="/vault"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              See Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50 py-12 px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center"
            >
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built for students who mean business
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
              Five integrated tools designed to supercharge your academic workflow from day one.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="group h-full rounded-xl border border-border bg-card p-6 transition-colors hover:border-border hover:bg-secondary/40">
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg}`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Selling points */}
      <section className="border-t border-border py-20 px-6 bg-card/30">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Instant Setup",
                desc: "No accounts, no friction. Jump straight into your academic toolkit.",
              },
              {
                icon: Sparkles,
                title: "AI-First Design",
                desc: "Every feature is enhanced with AI — from summaries to roadmaps to code problems.",
              },
              {
                icon: Shield,
                title: "Privacy-Focused",
                desc: "Your data stays yours. No tracking, no ads, no third-party sharing.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-10 text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to level up your college game?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Stop juggling tools. Start using Saarthi.
          </p>
          <Link
            to="/vault"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            Launch Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Saarthi</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
