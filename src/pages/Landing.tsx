import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  GraduationCap,
  Sparkles,
  Map,
  BookOpen,
  Code2,
  Calculator,
  Github,
  Linkedin,
  Twitter,
  ChevronRight,
  Terminal,
  Activity,
  Users
} from "lucide-react";

const HERO_WORDS = [
  "ace college",
  "master coding",
  "build real skills",
  "dominate exams",
  "stay ahead"
];

const TypewriterText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_WORDS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-grid grid-cols-1 grid-rows-1 items-center justify-items-center">
      <span className="invisible col-start-1 row-start-1 font-heading font-bold" aria-hidden="true">
        build real skills
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="col-start-1 row-start-1 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] font-heading font-bold"
        >
          {HERO_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const StorySection = ({
  title,
  description,
  highlights,
  visual,
  reverse = false,
  tag
}: {
  title: string;
  description: string;
  highlights: string[];
  visual: React.ReactNode;
  reverse?: boolean;
  tag: string;
}) => {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className={`flex flex-col gap-16 lg:flex-row ${reverse ? "lg:flex-row-reverse" : ""} items-center`}>
          {/* Text Content */}
          <div className="flex-1 space-y-8 z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-[#00F5FF] mb-4 block">
                {tag}
              </span>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl text-foreground mb-6">
                {title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {description}
              </p>
            </motion.div>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={1}
              className="space-y-4"
            >
              {highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 rounded-full bg-[#00F5FF]/10 p-1">
                    <ChevronRight className="h-3 w-3 text-[#00F5FF]" />
                  </div>
                  <span className="text-sm text-foreground/80">{highlight}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={2}
            >
              <Link
                to="/vault"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#7B61FF] transition-colors hover:text-[#00F5FF]"
              >
                Explore feature
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Visual Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 relative w-full aspect-square md:aspect-[4/3] rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent overflow-hidden backdrop-blur-xl shadow-2xl flex items-center justify-center p-8"
          >
            {/* Soft backdrop glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F5FF]/10 via-transparent to-[#7B61FF]/10 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10 w-full h-full">
              {visual}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const visualMockups = {
  roadmap: (
    <div className="h-full w-full flex flex-col justify-center space-y-6">
      {[1, 2, 3].map((step) => (
        <motion.div
          key={step}
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: step * 0.2, duration: 0.5 }}
          className="relative pl-8"
        >
          {step !== 3 && (
            <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-gradient-to-b from-[#00F5FF] to-transparent/20" />
          )}
          <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 border-[#00F5FF] bg-background shadow-[0_0_15px_rgba(0,245,255,0.4)]" />
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
            <h4 className="text-sm font-semibold text-white">Milestone {step}</h4>
            <div className="mt-2 h-2 w-3/4 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: step === 1 ? "100%" : step === 2 ? "60%" : "20%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-[#00F5FF] to-[#7B61FF]"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  ),
  vault: (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-2xl shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-5 w-5 text-[#7B61FF]" />
          <span className="text-sm font-semibold text-white">AI Summary Generated</span>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-full rounded-md bg-white/5" />
          <div className="h-4 w-5/6 rounded-md bg-white/5" />
          <div className="flex gap-2 pt-2">
            <span className="rounded-md bg-[#7B61FF]/20 px-2 py-1 text-xs text-[#7B61FF]">#machine-learning</span>
            <span className="rounded-md bg-[#00F5FF]/20 px-2 py-1 text-xs text-[#00F5FF]">#algorithms</span>
          </div>
        </div>
      </motion.div>
    </div>
  ),
  practice: (
    <div className="w-full h-full rounded-xl border border-white/10 bg-[#070B14] flex flex-col overflow-hidden shadow-2xl">
      <div className="flex h-10 items-center gap-2 border-b border-white/10 px-4 bg-white/5">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/50" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
          <div className="h-3 w-3 rounded-full bg-green-500/50" />
        </div>
        <div className="ml-4 text-xs font-mono text-muted-foreground">main.py</div>
      </div>
      <div className="p-4 flex-1 font-mono text-sm text-white/80 flex flex-col justify-between">
        <div>
          <p><span className="text-[#7B61FF]">def</span> <span className="text-[#00F5FF]">solve_problem</span>(arr):</p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pl-4 mt-2"
          >
            <p className="text-muted-foreground"># AI suggested optimization</p>
            <p className="text-green-400">return sum(arr) / len(arr)</p>
          </motion.div>
        </div>
        <div className="border-t border-white/10 pt-4 mt-4 flex items-center gap-2 text-xs">
          <Terminal className="h-4 w-4 text-[#00F5FF]" />
          <span className="text-green-400">Tests passed: 4/4</span>
        </div>
      </div>
    </div>
  ),
  campus: (
    <div className="w-full h-full flex flex-col gap-4 justify-center">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0EA5E9]/20">
          <Activity className="h-6 w-6 text-[#0EA5E9]" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Attendance Predictor</p>
          <p className="font-semibold text-white">Can skip 3 classes</p>
        </div>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7B61FF]/20">
          <Users className="h-6 w-6 text-[#7B61FF]" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Community Pulse</p>
          <p className="font-semibold text-white">Top issue resolved</p>
        </div>
      </motion.div>
    </div>
  ),
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#070B14] text-foreground overflow-x-hidden selection:bg-[#00F5FF]/30 font-sans">
      {/* Dynamic Background Noise & Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#4F46E5] blur-[150px] opacity-20" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#7B61FF] blur-[180px] opacity-10" />
      </div>

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#070B14]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00F5FF]/20 to-[#7B61FF]/20 border border-white/10">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading text-lg font-bold tracking-wide text-white">Saarthi</span>
          </div>
          <Link
            to="/vault"
            className="group relative inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-2 text-sm font-medium text-white ring-1 ring-white/10 transition-all hover:bg-white/10 hover:ring-[#00F5FF]/50"
          >
            Open App
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      {/* Cinematic Hero */}
      <section className="relative z-10 pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0EA5E9] shadow-[0_0_20px_rgba(14,165,233,0.15)]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          The future of AI learning
        </motion.div>

        <h1 className="font-heading text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-[5.5rem] leading-[1.1] max-w-5xl mx-auto text-white flex flex-col items-center justify-center gap-2 sm:gap-4">
          <span>Everything you need to</span>
          <TypewriterText />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-[#A1A8B8] leading-relaxed"
        >
          Saarthi is your AI academic co-pilot — roadmap, practice, notes, and campus tools in one intelligent system.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            to="/vault"
            className="group relative inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-[#070B14] transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,245,255,0.3)] hover:shadow-[0_0_60px_rgba(0,245,255,0.5)]"
          >
            Start Your Journey
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#story"
            className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-8 text-sm font-bold text-white transition-all hover:bg-white/5"
          >
            Explore Features
          </a>
        </motion.div>
      </section>

      {/* Storytelling Sections */}
      <div id="story" className="relative z-10 flex flex-col pb-32">
        <StorySection
          tag="Intelligence Layer"
          title="Your AI Roadmap Architect"
          description="Describe your goal. Saarthi builds a personalized, step-by-step mastery path with milestones, resources, and adaptive difficulty. Never feel lost again."
          highlights={[
            "Dynamic milestones that adapt to your pace",
            "Auto-curated resources for every step",
            "Visual progress tracking"
          ]}
          visual={visualMockups.roadmap}
        />

        <StorySection
          tag="Knowledge Engine"
          title="A Knowledge Vault That Thinks"
          description="Save links, notes, and PDFs. AI automatically summarizes, tags, and connects ideas, turning raw data into a structured knowledge base."
          highlights={[
            "Instant AI summaries for long content",
            "Auto-tagging based on context",
            "Semantic search across all notes"
          ]}
          visual={visualMockups.vault}
          reverse
        />

        <StorySection
          tag="Practice Core"
          title="Practice. Compile. Improve."
          description="A fully integrated split-screen coding lab. Get AI-generated problems tailored to your skill level with instant execution and evaluation."
          highlights={[
            "Built-in code execution engine",
            "AI generated problem sets",
            "Real-time evaluation and feedback"
          ]}
          visual={visualMockups.practice}
        />

        <StorySection
          tag="Campus Analytics"
          title="Smarter Campus Tools"
          description="Take the guesswork out of college logistics. Predict attendance limits, collaborate in community discussions, and plan leaves effortlessly."
          highlights={[
            "Predictive attendance calculator",
            "Anonymous community forums",
            "Smart leave planner"
          ]}
          visual={visualMockups.campus}
          reverse
        />
      </div>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#00F5FF]/10 to-[#7B61FF]/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light" />
        </div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative mx-auto max-w-3xl text-center"
        >
          <h2 className="font-heading text-4xl font-bold sm:text-6xl text-white mb-8">
            Stop Managing College.<br />
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#7B61FF]">Start Mastering It.</span>
          </h2>
          <Link
            to="/vault"
            className="group relative inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#4F46E5] px-10 text-sm font-bold text-white transition-all hover:scale-105 shadow-[0_0_40px_rgba(123,97,255,0.4)] hover:shadow-[0_0_60px_rgba(123,97,255,0.6)]"
          >
            Get Started Free
          </Link>
        </motion.div>
      </section>

      {/* Modern Footer */}
      <footer className="relative z-10 pt-16 md:pt-20 pb-8 border-t border-white/5 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 flex flex-col">
          {/* Top Section */}
          <div className="grid gap-16 lg:grid-cols-4 lg:gap-8 pb-8">
            
            {/* Brand Statement */}
            <div className="lg:col-span-1">
              <h3 className="font-heading text-xl font-bold text-white max-w-[200px] leading-tight mt-2">
                Where <span className="text-[#F472B6]">intelligence</span> & <span className="text-[#00F5FF]">ambition</span> meet
              </h3>
            </div>
            
            {/* Links and Actions Grid */}
            <div className="grid gap-12 sm:grid-cols-3 lg:col-span-3">
              {/* Explore */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-[#F97316]">Explore</h4>
                <ul className="space-y-4 text-sm text-white font-medium">
                  <li><Link to="/" className="hover:text-[#00F5FF] transition-colors">Home</Link></li>
                  <li><a href="#story" className="hover:text-[#00F5FF] transition-colors">Features</a></li>
                  <li><Link to="/roadmap" className="hover:text-[#00F5FF] transition-colors">Roadmap</Link></li>
                  <li><Link to="/community" className="hover:text-[#00F5FF] transition-colors">Community</Link></li>
                </ul>
              </div>

              {/* Follow Us */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-[#0EA5E9]">Follow Us</h4>
                <div className="grid grid-cols-2 gap-y-5 gap-x-2">
                  <a href="#" className="flex items-center gap-2 text-sm text-white font-medium hover:text-[#00F5FF] transition-colors">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A66C2]">
                      <Linkedin className="h-3.5 w-3.5 text-white" />
                    </div>
                    LinkedIn
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-white font-medium hover:text-[#00F5FF] transition-colors">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF0076] to-[#590FB7]">
                      <Map className="h-3.5 w-3.5 text-white" />
                    </div>
                    Design
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-white font-medium hover:text-[#00F5FF] transition-colors">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
                      <Github className="h-4 w-4 text-[#070B14]" fill="currentColor" />
                    </div>
                    GitHub
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-white font-medium hover:text-[#00F5FF] transition-colors">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5865F2]">
                      <Users className="h-3.5 w-3.5 text-white" />
                    </div>
                    Discord
                  </a>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-0 flex flex-col justify-start">
                <a href="#" className="group flex items-center justify-between pb-6 border-b border-white/5 transition-colors">
                  <div>
                    <h4 className="text-[15px] font-semibold text-white mb-1 group-hover:text-[#22C55E] transition-colors">Contact Us</h4>
                    <p className="text-xs text-muted-foreground">Say Hello !</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 group-hover:border-[#22C55E]/50 transition-colors">
                    <ArrowRight className="h-4 w-4 text-white group-hover:text-[#22C55E] transition-colors" />
                  </div>
                </a>
                
                <Link to="/vault" className="group flex items-center justify-between pt-6 transition-colors">
                  <div>
                    <h4 className="text-[15px] font-semibold text-white mb-1 group-hover:text-[#22C55E] transition-colors">Open Dashboard</h4>
                    <p className="text-xs text-muted-foreground">Explore Platform</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 group-hover:border-[#22C55E]/50 transition-colors">
                    <ArrowRight className="h-4 w-4 text-white group-hover:text-[#22C55E] transition-colors" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Huge Brand Text */}
          <div className="w-full relative flex items-end justify-start mix-blend-plus-lighter pointer-events-none pb-4 sm:pb-8 pt-4 md:pt-4">
             <h1 className="font-heading font-black text-[#F4EFE6] select-none tracking-tighter" style={{ fontSize: 'clamp(5rem, 20vw, 25rem)', lineHeight: '0.75' }}>
               saarthi<span className="text-[#7B61FF]">.</span>
             </h1>
          </div>
          
          {/* Bottom attribution */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 border-t border-white/5 pt-6 gap-4 text-xs font-medium text-white/70">
            <p>saarthi ©2026 - Privacy Policy</p>
            <p>India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
