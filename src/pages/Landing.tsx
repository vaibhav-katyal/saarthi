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
  Users,
  CheckCircle2,
  Brain,
  TrendingUp,
  Target,
  Zap,
  Play,
  LayoutDashboard,
  BarChart3
} from "lucide-react";

//custom cool arrow cursor on logIn button
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-cursor="blob"]')) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      <style>
        {`
          [data-cursor="blob"], [data-cursor="blob"] * {
            cursor: none !important;
          }
        `}
      </style>
      <motion.div
        className="fixed top-0 left-0 w-16 h-16 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center overflow-hidden shadow-sm"
        animate={{
          x: mousePosition.x - 32,
          y: mousePosition.y - 32,
          scale: isVisible ? 1 : 0,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.2 }}
      >
        <motion.div 
          className="w-full h-full flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            scale: isVisible ? 1 : 0.5,
            rotate: isVisible ? 0 : -45
          }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight className="w-6 h-6 text-black" strokeWidth={3} />
        </motion.div>
      </motion.div>
    </>
  );
};

const HERO_WORDS = [
  "Plan Smarter.",
  "Study Better.",
  "Achieve More."
];

const TypewriterText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_WORDS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-grid grid-cols-1 grid-rows-1 items-center justify-items-center">
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        Achieve More.
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="col-start-1 row-start-1 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] via-[#7B61FF] to-[#00F5FF] bg-[length:200%_auto] animate-gradient"
        >
          {HERO_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

// Reusable story section
const FeatureSection = ({
  title,
  description,
  highlights,
  visual,
  reverse = false,
  tag,
  icon: Icon
}: {
  title: string;
  description: string;
  highlights: string[];
  visual: React.ReactNode;
  reverse?: boolean;
  tag: string;
  icon: any;
}) => {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className={`flex flex-col gap-16 lg:flex-row ${reverse ? "lg:flex-row-reverse" : ""} items-center`}>
          {/* Text Content */}
          <div className="flex-1 space-y-8 z-10 w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#00F5FF] mb-6">
                 <Icon className="w-3.5 h-3.5" /> {tag}
              </div>
              <h2 className="font-heading text-3xl font-bold sm:text-5xl text-white mb-6 tracking-tight leading-[1.1]">
                {title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {description}
              </p>
            </motion.div>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={1}
              className="space-y-4 max-w-lg"
            >
              {highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 rounded-full bg-[#00F5FF]/10 p-1">
                    <CheckCircle2 className="h-4 w-4 text-[#00F5FF]" />
                  </div>
                  <span className="text-sm text-foreground/90 font-medium">{highlight}</span>
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
                className="group inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#00F5FF]"
              >
                Learn more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Visual Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)", y: 20 }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 relative w-full aspect-square md:aspect-[4/3] rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden backdrop-blur-lg shadow-2xl flex items-center justify-center p-8 lg:p-12 group"
          >
            {/* Soft backdrop glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F5FF]/10 to-[#7B61FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
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
          <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 border-[#00F5FF] bg-[#070B14] shadow-[0_0_15px_rgba(0,245,255,0.4)] flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-[#00F5FF]" />
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md hover:bg-white/5 transition-colors cursor-default">
            <h4 className="text-sm font-semibold text-white">Milestone {step}</h4>
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
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
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-2xl shadow-2xl relative"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7B61FF]/50 to-transparent" />
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-5 w-5 text-[#7B61FF]" />
          <span className="text-sm font-semibold text-white">AI Summary Generated</span>
        </div>
        <div className="space-y-4">
          <div className="h-2 w-full rounded-md bg-white/10" />
          <div className="h-2 w-5/6 rounded-md bg-white/10" />
          <div className="h-2 w-4/6 rounded-md bg-white/10" />
          <div className="flex gap-2 pt-4">
            <span className="rounded-md bg-[#7B61FF]/20 border border-[#7B61FF]/30 px-2 py-1 text-[10px] font-mono text-[#7B61FF]">#machine-learning</span>
            <span className="rounded-md bg-[#00F5FF]/20 border border-[#00F5FF]/30 px-2 py-1 text-[10px] font-mono text-[#00F5FF]">#algorithms</span>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl shadow-2xl absolute -bottom-4 right-4 md:-right-8 flex items-center gap-3"
      >
         <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
         </div>
         <div className="text-xs">
            <p className="font-semibold text-white">Semantic Match Found</p>
            <p className="text-muted-foreground">in "Lecture_4_Notes.pdf"</p>
         </div>
      </motion.div>
    </div>
  ),
  practice: (
    <div className="w-full h-full rounded-xl border border-white/10 bg-[#0A0E17] flex flex-col overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00F5FF]/50 to-transparent" />
      <div className="flex h-10 items-center justify-between border-b border-white/10 px-4 bg-white/5">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="text-xs font-mono text-muted-foreground">main.py</div>
        <div className="w-10"></div>
      </div>
      <div className="p-5 flex-1 font-mono text-[13px] leading-relaxed text-white/80 flex flex-col justify-between">
        <div>
          <p><span className="text-[#7B61FF]">def</span> <span className="text-[#00F5FF]">solve_problem</span>(arr):</p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pl-4 mt-2 border-l-2 border-[#00F5FF]/30 ml-2"
          >
            <p className="text-muted-foreground/60"># AI suggested optimization</p>
            <p className="text-emerald-400">return sum(arr) / len(arr)</p>
          </motion.div>
        </div>
        <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Terminal className="h-4 w-4 text-[#00F5FF]" />
             <span className="text-emerald-400 text-xs font-semibold">Tests passed: 4/4</span>
          </div>
          <button className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded transition-colors">
            Run Code
          </button>
        </div>
      </div>
    </div>
  ),
  campus: (
    <div className="w-full h-full flex flex-col gap-4 justify-center relative">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
          <Activity className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Attendance Predictor</p>
          <p className="font-bold text-white text-lg">Safe Limit: 3 classes</p>
        </div>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl border border-[#7B61FF]/20 bg-[#7B61FF]/5 p-4 flex items-center gap-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#7B61FF]/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7B61FF]/20 border border-[#7B61FF]/30">
          <Users className="h-5 w-5 text-[#7B61FF]" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Community Pulse</p>
          <p className="font-bold text-white text-lg">Campus Discussions</p>
        </div>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-center gap-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/30">
          <Calculator className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Leave Manager</p>
          <p className="font-bold text-white text-lg">Plan your holidays</p>
        </div>
      </motion.div>
    </div>
  ),
};

const Landing = () => {
  return (
    <main className="relative flex flex-col min-h-screen w-full bg-[#070B14] text-foreground font-sans overflow-x-hidden selection:bg-[#00F5FF]/30">
      <CustomCursor />
      {/* Premium Dark Gradient Background - Optimized for performance */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#070B14]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        {/* Glow behind hero */}
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-[#4F46E5]/10 blur-[100px] opacity-30" />
        <div className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-[#00F5FF]/10 blur-[100px] opacity-20" />
      </div>

      {/* Modern Top Nav (Vercel/Linear Style) */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#070B14]/60 backdrop-blur-2xl px-6">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#00F5FF] to-[#7B61FF] shadow-[0_0_15px_rgba(0,245,255,0.4)]">
              <GraduationCap className="h-4 w-4 text-black" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-white">Saarthi</span>
          </div>

          {/* <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
             <a href="#product" className="hover:text-white transition-colors">Product</a>
             <a href="#how" className="hover:text-white transition-colors">How it works</a>
             <a href="#campus" className="hover:text-white transition-colors">Campus</a>
          </nav> */}

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              data-cursor="blob"
              className="group relative inline-flex items-center gap-2 rounded-full border border-blue/10 bg-white/5 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-[#00F5FF]/50 shadow-lg hover:shadow-[0_0_20px_rgba(0,245,255,0.2)]"
            >
              Login
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-all group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-36 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">

        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white max-w-4xl mx-auto mb-6 leading-[1.1]">
          Your Personal AI <br className="hidden sm:block" /> For College. <br />
          <TypewriterText />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-[#A1A8B8] max-w-3xl mx-auto mb-10 leading-relaxed font-light"
        >
          Saarthi helps you stay ahead in college. Generate study roadmaps, practice with AI-driven tests, and manage everything from learning to productivity in one seamless system.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Link
            to="/login"
            className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] px-8 text-[15px] font-bold text-white transition-all shadow-[0_0_30px_rgba(123,97,255,0.3)] hover:shadow-[0_0_50px_rgba(123,97,255,0.5)] hover:scale-105"
          >
            Start Your Journey
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
             href="#product"
             className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-8 text-[15px] font-semibold text-white transition-colors"
          >
             <Play className="h-4 w-4 text-[#00F5FF]" /> Explore Features
          </a>
        </motion.div>

        {/* Hero Dashboard Preview Window */}
        <motion.div
           initial={{ opacity: 0, y: 40, filter: "blur(5px)" }}
           animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
           transition={{ duration: 1, delay: 0.6 }}
           className="w-full relative mx-auto rounded-[2rem] border border-white/10 bg-black/40 p-2 md:p-4 backdrop-blur-md shadow-2xl"
        >
           <div className="absolute -inset-1 bg-gradient-to-r from-[#00F5FF]/20 to-[#7B61FF]/20 rounded-[2.2rem] blur-xl opacity-50 -z-10" />
           <div className="rounded-[1.5rem] border border-white/10 bg-[#0A0E17] overflow-hidden flex flex-col shadow-inner min-h-[400px] md:min-h-[550px] aspect-auto lg:aspect-[16/10]">
              {/* Window Controls */}
              <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4">
                 <div className="flex gap-1.5 border border-white/5 p-1 rounded-md bg-black/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                 </div>
                 <div className="mx-auto flex items-center gap-2 px-6 py-1 rounded-md bg-black/40 border border-white/5 text-xs text-muted-foreground mr-16">
                    <Sparkles className="w-3 h-3 text-[#00F5FF]" /> saarthi.ai/dashboard
                 </div>
              </div>
              {/* Fake Dashboard Content */}
              <div className="flex-1 flex overflow-hidden">
                 {/* Left Sidebar (Mini) */}
                 <div className="w-12 md:w-16 border-r border-white/5 bg-white/[0.01] flex-col items-center py-4 gap-4 hidden sm:flex">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F5FF] to-[#7B61FF] flex items-center justify-center mb-2 shadow-lg">
                       <GraduationCap className="h-4 w-4 text-black" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#00F5FF]/10 text-[#00F5FF] flex items-center justify-center">
                       <LayoutDashboard className="h-4 w-4" />
                    </div>
                    {[BookOpen, Map, Brain, Code2].map((Icon, i) => (
                       <div key={i} className="w-8 h-8 rounded-lg text-muted-foreground hover:text-white flex items-center justify-center transition-colors">
                          <Icon className="h-4 w-4" />
                       </div>
                    ))}
                 </div>

                 {/* Main Dashboard Area */}
                 <div className="flex-1 flex flex-col p-3 md:p-5 overflow-hidden gap-3 md:gap-4 bg-transparent max-h-full">
                    {/* Greeting Header */}
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#00F5FF]/20 bg-[#00F5FF]/10 text-[9px] font-bold uppercase tracking-wider text-[#00F5FF] mb-1.5">
                           <LayoutDashboard className="h-2.5 w-2.5" /> Dashboard
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                           Good Afternoon, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#7B61FF]">Vishesh</span>! 👋
                        </h2>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       {[
                         { val: "48", lbl: "MCQs Attempted", change: "+12 this week", icon: CheckCircle2, color: "text-[#7B61FF]", bg: "bg-[#7B61FF]/10" },
                         { val: "23", lbl: "Code Submissions", change: "+5 this week", icon: Code2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                         { val: "87%", lbl: "Attendance", change: "Can skip 3 classes", icon: Activity, color: "text-[#00F5FF]", bg: "bg-[#00F5FF]/10" },
                         { val: "6 days", lbl: "Leave Balance", change: "2 planned", icon: Calculator, color: "text-orange-400", bg: "bg-orange-400/10" }
                       ].map((stat, i) => (
                          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col">
                             <div className="flex justify-between items-start mb-2">
                                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                   <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                             </div>
                             <div className="text-lg md:text-xl font-bold text-white leading-tight">{stat.val}</div>
                             <div className="text-[10px] text-muted-foreground mt-0.5 mb-1">{stat.lbl}</div>
                             <div className={`text-[9px] font-medium ${stat.color}`}>{stat.change}</div>
                          </div>
                       ))}
                    </div>

                    {/* Bottom Area: Activity & Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-0">
                       <div className="md:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col overflow-hidden">
                          <div className="flex justify-between items-center mb-3">
                             <div className="flex items-center gap-2 text-xs font-semibold text-white">
                                <Activity className="w-3.5 h-3.5 text-muted-foreground" /> Recent Activity
                             </div>
                             <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Last 7 Days</div>
                          </div>
                          <div className="space-y-2 overflow-y-auto pr-1">
                             {[
                                { title: "Completed MCQ set", sub: "Data Structures — Trees & Graphs", time: "2 hours ago", icon: Brain, color: "text-pink-400", bg: "bg-pink-400/10" },
                                { title: "Submitted solution", sub: "Two Sum — Testpad", time: "5 hours ago", icon: Code2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                                { title: "Saved note", sub: "DBMS Normalization Summary", time: "Yesterday", icon: BookOpen, color: "text-[#7B61FF]", bg: "bg-[#7B61FF]/10" }
                             ].map((act, i) => (
                                <div key={i} className="flex items-center gap-3 hover:bg-white/[0.02] p-1.5 rounded-lg transition-colors">
                                   <div className={`w-7 h-7 rounded-md ${act.bg} flex items-center justify-center shrink-0`}>
                                      <act.icon className={`w-3.5 h-3.5 ${act.color}`} />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium text-white truncate">{act.title}</div>
                                      <div className="text-[10px] text-muted-foreground truncate">{act.sub}</div>
                                   </div>
                                   <div className="text-[9px] text-muted-foreground shrink-0">{act.time}</div>
                                </div>
                             ))}
                          </div>
                       </div>
                       
                       <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col hidden sm:flex">
                          <div className="flex items-center gap-2 text-xs font-semibold text-white mb-4 lg:mb-5">
                             <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" /> Performance
                          </div>
                          <div className="space-y-3 lg:space-y-4">
                             {[
                                { lbl: "DSA Progress", val: "72%", tw: "bg-[#7B61FF]", w: "72%" },
                                { lbl: "MCQ Accuracy", val: "85%", tw: "bg-[#00F5FF]", w: "85%" },
                                { lbl: "Code Quality", val: "68%", tw: "bg-emerald-400", w: "68%" }
                             ].map((p, i) => (
                                <div key={i}>
                                   <div className="flex justify-between text-[10px] mb-1.5">
                                      <span className="text-muted-foreground font-medium">{p.lbl}</span>
                                      <span className="text-white font-bold">{p.val}</span>
                                   </div>
                                   <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                      <div className={`h-full ${p.tw}`} style={{ width: p.w }} />
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
      </section>



      {/* Alternating Feature Sections */}
      <div id="product" className="relative z-10 flex flex-col pb-20">
        <FeatureSection
          tag="Intelligence Layer"
          icon={Map}
          title="Your AI Roadmap Architect."
          description="Describe your end goal. Saarthi dynamically builds a personalized, step-by-step mastery path with milestones, resources, and adaptive difficulty. Never feel lost again."
          highlights={[
            "Dynamic milestones that adapt to your learning pace",
            "Auto-curated best-in-class resources for every step",
            "Visual progress tracking to maintain momentum"
          ]}
          visual={visualMockups.roadmap}
        />

        <FeatureSection
          tag="Knowledge Engine"
          icon={BookOpen}
          title="A Vault That Thinks."
          description="Save links, notes, and PDFs. Our AI automatically digests, summarizes, tags, and connects ideas—turning raw data into a structured personal syllabus."
          highlights={[
            "Instant AI summaries for long lectures and PDFs",
            "Context-aware auto-tagging system",
            "Semantic search across your entire academic graph"
          ]}
          visual={visualMockups.vault}
          reverse
        />

        <FeatureSection
          tag="Practice Core"
          icon={Code2}
          title="Practice. Compile. Improve."
          description="A fully integrated split-screen lab environment. Get AI-generated problems tailored to your current skill level, with instant execution and line-by-line evaluation."
          highlights={[
            "Browser-based code execution engine",
            "Endless AI generated problem sets",
            "Real-time evaluation and syntax feedback"
          ]}
          visual={visualMockups.practice}
        />

        <FeatureSection
          tag="Campus Analytics"
          icon={Calculator}
          title="Smarter Campus Tools."
          description="Take the guesswork out of college logistics. Predict attendance limits, collaborate in community discussions, and plan structured leaves effortlessly."
          highlights={[
            "Predictive attendance gap calculator",
            "Anonymous community forums for real talk",
            "Smart leave planner maximizing holidays"
          ]}
          visual={visualMockups.campus}
          reverse
        />
      </div>

      {/* Built for the Way Students Actually Learn */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-6xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold sm:text-5xl text-white mb-6 tracking-tight">
                 Built for the Way Students<br className="sm:hidden" /> Actually Learn
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                 Traditional platforms focus on content. Saarthi focuses on understanding.<br className="hidden sm:block" />
                 Our AI adapts to how you think, helping you learn concepts deeply instead of just memorizing answers.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {[
                { 
                  title: "Concept-First Learning", 
                  desc: "Understand the “why” behind every topic.", 
                  icon: Brain,
                  col: "text-[#00F5FF]",
                  bg: "bg-[#00F5FF]/10",
                  border: "border-[#00F5FF]/20"
                },
                { 
                  title: "Guided Problem Solving", 
                  desc: "Step-by-step assistance when you're stuck.", 
                  icon: Target,
                  col: "text-[#7B61FF]",
                  bg: "bg-[#7B61FF]/10",
                  border: "border-[#7B61FF]/20"
                },
                { 
                  title: "Continuous Improvement", 
                  desc: "Every interaction helps Saarthi guide you better.", 
                  icon: TrendingUp,
                  col: "text-emerald-400",
                  bg: "bg-emerald-400/10",
                  border: "border-emerald-400/20"
                }
              ].map((card, i) => (
                <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ delay: i * 0.15, duration: 0.6 }}
                   className="group bg-[#0A0E17]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 hover:border-white/10 hover:bg-white/[0.02] transition-colors relative overflow-hidden"
                >
                   <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] ${card.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                   <div className={`w-12 h-12 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center mb-6 shadow-inner`}>
                      <card.icon className={`w-5 h-5 ${card.col}`} />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{card.title}</h3>
                   <p className="text-muted-foreground text-[15px] leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Final Linear/Vercel style CTA */}
      <section className="relative z-10 py-32 px-6 overflow-hidden border-t border-white/5 bg-[#0A0E17]">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#00F5FF]/50 to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[300px] w-[500px] rounded-full bg-gradient-to-br from-[#00F5FF]/10 to-[#7B61FF]/10 blur-[100px] opacity-50" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00F5FF] to-[#7B61FF] shadow-[0_0_30px_rgba(0,245,255,0.4)] mb-8">
             <GraduationCap className="h-8 w-8 text-black" />
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Start mastering your exams today.
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join the thousands of top-tier students already learning smarter with Saarthi's AI engine.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            
            <Link
              to="/dashboard"
              className="group relative inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-10 text-[15px] font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-[#00F5FF]/50 shadow-lg hover:shadow-[0_0_40px_rgba(0,245,255,0.3)] hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                Let's Explore
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-white group-hover:translate-x-1.5" />
              </span>
              {/* Subtle animated background glow effect on hover */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F5FF]/0 via-[#00F5FF]/10 to-[#7B61FF]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Modern Professional Footer */}
      <footer className="relative z-10 pt-20 md:pt-28 pb-8 border-t border-white/5 overflow-hidden bg-[#070B14]">
        <div className="mx-auto max-w-7xl px-6 flex flex-col">
          {/* Top Section */}
          <div className="grid gap-16 lg:grid-cols-4 lg:gap-8 pb-16">
            
            {/* Brand Statement */}
            <div className="lg:col-span-1">
              <h3 className="font-heading text-2xl font-bold text-white max-w-[200px] leading-tight mt-1">
                Where <span className="text-[#00F5FF]">intelligence</span> & <span className="text-[#7B61FF]">ambition</span> meet
              </h3>
            </div>

            {/* Links and Actions Grid */}
            <div className="grid gap-12 sm:grid-cols-3 lg:col-span-3">
              {/* Explore */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-white">Explore</h4>
                <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                  <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><a href="#product" className="hover:text-white transition-colors">Features</a></li>
                  <li><Link to="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
                  <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
                </ul>
              </div>

              {/* Follow Us */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-white">Follow Us</h4>
                <div className="grid grid-cols-2 gap-y-5 gap-x-2">
                  <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground font-medium hover:text-white transition-colors">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5">
                      <Linkedin className="h-3.5 w-3.5" />
                    </div>
                    LinkedIn
                  </a>
                  <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground font-medium hover:text-white transition-colors">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5">
                      <Map className="h-3.5 w-3.5" />
                    </div>
                    Design
                  </a>
                  <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground font-medium hover:text-white transition-colors">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5">
                      <Github className="h-3.5 w-3.5" />
                    </div>
                    GitHub
                  </a>
                  <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground font-medium hover:text-white transition-colors">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    Discord
                  </a>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-0 flex flex-col justify-start">
                <a href="#" className="group flex items-center justify-between pb-6 border-b border-white/5 transition-colors">
                  <div>
                    <h4 className="text-[15px] font-semibold text-white mb-1 group-hover:text-[#00F5FF] transition-colors">Contact Us</h4>
                    <p className="text-xs text-muted-foreground">Say Hello !</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 group-hover:border-[#00F5FF]/50 transition-colors">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#00F5FF] transition-colors" />
                  </div>
                </a>

                <Link to="/login" className="group flex items-center justify-between pt-6 transition-colors">
                  <div>
                    <h4 className="text-[15px] font-semibold text-white mb-1 group-hover:text-[#00F5FF] transition-colors">Open Dashboard</h4>
                    <p className="text-xs text-muted-foreground">Explore Platform</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 group-hover:border-[#00F5FF]/50 transition-colors">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#00F5FF] transition-colors" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Huge Brand Text */}
          <div className="w-full relative flex items-end justify-start mix-blend-plus-lighter pointer-events-none pb-4 sm:pb-8 pt-8 md:pt-16">
            <h1 className="font-heading font-black text-[#F4EFE6] select-none tracking-tighter" style={{ fontSize: 'clamp(5rem, 16vw, 17.5rem)', lineHeight: '0.75' }}>
              saarthi<span className="text-[#7B61FF]">.</span>
            </h1>
          </div>

          {/* Bottom attribution */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-2 border-t border-white/5 pt-6 gap-4 text-xs font-medium text-muted-foreground">
            <p>saarthi © {new Date().getFullYear()} - Privacy Policy</p>
            <p>India</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
