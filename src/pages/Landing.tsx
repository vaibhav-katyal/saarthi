import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Play, Map, BookOpen, Code2, Swords, Brain, Calculator } from 'lucide-react';

const FRAME_COUNT = 111;

// Vite glob import for robust production bundling
const framesGlob = import.meta.glob('../frames/*.jpg', { eager: true, import: 'default' });

function getFrameUrl(index: number) {
  const padded = index.toString().padStart(3, '0');
  const path = `../frames/ezgif-frame-${padded}.jpg`;
  return (framesGlob[path] as string) || path;
}

const Landing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Main scroll tracker
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100, // slightly more responsive
    damping: 30,
    restDelta: 0.001
  });

  // Preload frames
  useEffect(() => {
    let loadedCount = 0;
    const imgArray: HTMLImageElement[] = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          setLoaded(true);
        }
      };
      imgArray.push(img);
    }
    setImages(imgArray);
  }, []);

  // Canvas drawing mapping: 0.0 -> 0.8 = Frames 0 -> 110
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (!loaded || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Map the 0-0.8 progress range to the 0-110 frames
    let frameProgress = latest / 0.8;
    frameProgress = Math.max(0, Math.min(1, frameProgress));

    const frameIndex = Math.min(
      FRAME_COUNT - 1,
      Math.floor(frameProgress * FRAME_COUNT)
    );

    const img = images[frameIndex];
    if (!img) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const hRatio = rect.width / img.width;
    const vRatio = rect.height / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const centerShift_x = (rect.width - img.width * ratio) / 2;
    const centerShift_y = (rect.height - img.height * ratio) / 2;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, rect.width, rect.height);
    // Draw centered and cover
    ctx.drawImage(img, 0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
  });

  // Initial render when loaded
  useEffect(() => {
    if (loaded && smoothProgress.get() === 0) {
      // trigger a manual update to draw the first frame
      smoothProgress.set(0.0001);
      setTimeout(() => smoothProgress.set(0), 50);
    }
  }, [loaded]);

  // --- Animation Timelines based on scroll (0 to 1) --- //

  // 1. Initial Hero Buttons fade out instantly
  const initialElementsOpacity = useTransform(smoothProgress, [0, 0.16], [1, 0]);
  const initialElementsY = useTransform(smoothProgress, [0, 0.16], [0, -20]);

  // 2. Main Title "Your Personal AI For College."
  // Stays from 0 to 0.7, then fades out before SAARTHI
  const mainTitleOpacity = useTransform(smoothProgress, [0, 0.7, 0.8], [1, 1, 0]);
  const mainTitleScale = useTransform(smoothProgress, [0.7, 0.8], [1, 1.1]);

  // 3. Sub-Phrases (Study Better -> Plan Smarter -> Achieve More)
  const phrase1Opacity = useTransform(smoothProgress, [0.16, 0.26, 0.36, 0.46], [0, 1, 1, 0]);
  const phrase1Y = useTransform(smoothProgress, [0.16, 0.26, 0.36, 0.46], [20, 0, 0, -20]);

  const phrase2Opacity = useTransform(smoothProgress, [0.36, 0.46, 0.56, 0.66], [0, 1, 1, 0]);
  const phrase2Y = useTransform(smoothProgress, [0.36, 0.46, 0.56, 0.66], [20, 0, 0, -20]);

  const phrase3Opacity = useTransform(smoothProgress, [0.56, 0.66, 0.76, 0.86], [0, 1, 1, 0]);
  const phrase3Y = useTransform(smoothProgress, [0.56, 0.66, 0.76, 0.86], [20, 0, 0, -20]);

  // 4. Big "SAARTHI" Text
  const saarthiOpacity = useTransform(smoothProgress, [0.76, 0.8, 0.9, 1.0], [0, 1, 1, 0]);
  const saarthiScale = useTransform(smoothProgress, [0.76, 0.8, 0.9, 1.0], [0.8, 1, 1, 1.2]);

  // 5. Canvas Fade Out (after SAARTHI)
  const canvasOpacity = useTransform(smoothProgress, [0.9, 1.0], [1, 0]);

  return (
    <main className="bg-black text-white min-h-screen font-sans selection:bg-white/20 selection:text-white">

      {/* Minimal Apple-style Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between mix-blend-difference pointer-events-none">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-white" />
          <span className="font-semibold text-xl tracking-tight text-white">Saarthi</span>
        </div>
        <Link
          to="/login"
          className="text-sm font-medium text-white transition-opacity hover:opacity-70 flex items-center gap-1.5 pointer-events-auto"
        >
          Login <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Global Loading Spinner */}
      {!loaded && (
        <div className="fixed inset-0 flex items-center justify-center bg-black z-[100]">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-4" />
        </div>
      )}

      {/* Massive Scroll Container */}
      <div ref={containerRef} className="relative h-[400vh] w-full bg-black">

        {/* Sticky Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center">

          {/* 1. Canvas Background */}
          <motion.canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ width: '100%', height: '100%', opacity: canvasOpacity }}
          />

          {/* Dark overlay for readability */}
          <motion.div
            className="absolute inset-0 bg-black/60 z-0 pointer-events-none"
            style={{ opacity: canvasOpacity }}
          />

          {/* 2. Central Hero Content (z-10) */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 pointer-events-none mt-[-10vh]">

            {/* Main Title Container */}
            <motion.div
              className="flex flex-col items-center text-center w-full"
              style={{ opacity: mainTitleOpacity, scale: mainTitleScale }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[1.1] text-white">
                Your Personal AI<br />For College.
              </h1>

              {/* Phrases Wrapper - Positioned relatively below the title */}
              <div className="relative h-[100px] md:h-[120px] w-full mt-10 flex items-center justify-center overflow-hidden">
                
                {/* Initial Buttons (Visible at scroll 0, fades out upwards) */}
                <motion.div
                  className="absolute flex flex-col sm:flex-row items-center gap-8 pointer-events-auto"
                  style={{ opacity: initialElementsOpacity, y: initialElementsY }}
                >
                  <Link
                    to="/dashboard"
                    className="group relative inline-flex h-16 md:h-20 items-center justify-center gap-3 rounded-full border border-white/20 bg-black hover:bg-white/10 px-10 text-lg md:text-xl font-bold text-white transition-all hover:scale-105"
                  >
                    Start Your Journey
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <button onClick={() => {
                    const el = document.getElementById('details');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                    className="inline-flex h-16 md:h-20 items-center justify-center gap-3 rounded-full border border-white/20 bg-black hover:bg-white/10 px-10 text-lg md:text-xl font-semibold text-white transition-colors"
                  >
                    <Play className="h-5 w-5 fill-white text-white" /> Explore Now
                  </button>
                </motion.div>

                {/* Phrase 1 (Study Better.) */}
                <motion.h2
                  className="absolute text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-[#86868b] whitespace-nowrap"
                  style={{ opacity: phrase1Opacity, y: phrase1Y }}
                >
                  Study Better.
                </motion.h2>

                {/* Phrase 2 */}
                <motion.h2
                  className="absolute text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-[#86868b] whitespace-nowrap"
                  style={{ opacity: phrase2Opacity, y: phrase2Y }}
                >
                  Plan Smarter.
                </motion.h2>

                {/* Phrase 3 */}
                <motion.h2
                  className="absolute text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-[#86868b] whitespace-nowrap"
                  style={{ opacity: phrase3Opacity, y: phrase3Y }}
                >
                  Achieve More.
                </motion.h2>

              </div>
            </motion.div>



            {/* Big SAARTHI Text appearing after phrases */}
            <motion.div
              className="absolute inset-0 flex justify-center items-center"
              style={{ opacity: saarthiOpacity, scale: saarthiScale }}
            >
              <h1 className="text-[12vw] font-bold tracking-tighter text-white uppercase leading-none mix-blend-overlay">
                SAARTHI
              </h1>
            </motion.div>

          </div>

        </div>
      </div>

      {/* --- Feature Sections --- */}
      <section id="features" className="bg-black text-white py-32 px-6 border-t border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-32">
          
          {/* Feature 1: AI Roadmap */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center gap-12"
          >
             <div className="flex-1">
                <span className="text-[#00F5FF] text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Intelligence</span>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">AI Roadmap Architect.</h3>
                <p className="text-lg md:text-xl text-neutral-400 font-medium">Describe your end goal to dynamically build a personalized, step-by-step mastery path.</p>
             </div>
             <div className="flex-1 w-full bg-gradient-to-br from-[#00F5FF]/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 min-h-[400px] flex items-center justify-center relative group perspective-[1000px]">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F5FF]/10 rounded-full blur-[80px] group-hover:bg-[#00F5FF]/20 transition-all duration-700" />
                 <motion.div 
                    whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-full max-w-[400px] bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10"
                 >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                        <div className="ml-2 text-[10px] text-neutral-500 font-medium font-mono">roadmap.saarthi.app</div>
                    </div>
                    <div className="p-5 flex flex-col gap-4 bg-black/50">
                        <div className="flex flex-col gap-3 relative pl-3 border-l border-white/10 ml-2">
                           <div className="relative">
                               <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.5)]" />
                               <div className="h-2 w-24 bg-white/20 rounded-full mb-1.5" />
                               <div className="h-1.5 w-16 bg-white/10 rounded-full" />
                           </div>
                           <div className="relative">
                               <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full border border-neutral-500 bg-neutral-900" />
                               <div className="h-2 w-32 bg-white/10 rounded-full mb-1.5" />
                               <div className="h-1.5 w-20 bg-white/5 rounded-full" />
                           </div>
                        </div>
                    </div>
                 </motion.div>
             </div>
          </motion.div>

          {/* Feature 2: Knowledge Vault */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row-reverse items-center gap-12"
          >
             <div className="flex-1">
                <span className="text-[#7B61FF] text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Knowledge</span>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">The Vault.</h3>
                <p className="text-lg md:text-xl text-neutral-400 font-medium">Upload your materials into the Vault to generate an actionable syllabus tailored to your exact needs.</p>
             </div>
             <div className="flex-1 w-full bg-gradient-to-bl from-[#7B61FF]/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 min-h-[400px] flex items-center justify-center relative group perspective-[1000px]">
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7B61FF]/10 rounded-full blur-[80px] group-hover:bg-[#7B61FF]/20 transition-all duration-700" />
                 <motion.div 
                    whileHover={{ rotateY: 5, rotateX: 5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-full max-w-[350px] h-48 rounded-xl border-2 border-dashed border-[#7B61FF]/30 bg-[#7B61FF]/5 flex flex-col items-center justify-center gap-3 relative z-10 shadow-2xl backdrop-blur-xl"
                 >
                    <BookOpen className="w-8 h-8 text-[#7B61FF]" />
                    <span className="text-sm text-neutral-300 font-medium">Drag & Drop Syllabus PDF</span>
                    <span className="text-[10px] text-neutral-500">Supercharge your AI context</span>
                 </motion.div>
             </div>
          </motion.div>

          {/* Feature 3: Challenge */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center gap-12"
          >
             <div className="flex-1">
                <span className="text-red-500 text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Challenge</span>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">The Ultimate<br />Practice Arena.</h3>
                <p className="text-lg md:text-xl text-neutral-400 font-medium">Hone your skills in the interactive AI-powered Testpad lab or battle friends in real-time competitive Code Duels.</p>
             </div>
             <div className="flex-1 w-full bg-gradient-to-br from-red-500/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 min-h-[400px] flex items-center justify-center relative group perspective-[1000px]">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] group-hover:bg-red-500/20 transition-all duration-700" />
                 
                 {/* 1v1 Mockup Container */}
                 <div className="w-full flex items-center justify-center relative z-10 h-full">
                    
                    {/* Player 1 */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        className="w-[45%] max-w-[200px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-xl flex flex-col overflow-hidden z-10"
                    >
                        <div className="p-2 md:p-3 border-b border-white/10 flex items-center gap-2 bg-black/40">
                           <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"><span className="text-[10px] text-blue-400 font-bold">P1</span></div>
                           <span className="text-xs text-white">You</span>
                        </div>
                        <div className="p-3 md:p-4 font-mono text-[8px] sm:text-[10px] leading-relaxed text-neutral-400 bg-[#0d0d0d]">
                           <span className="text-red-400">return</span> data<span className="text-white">.</span>map(x ={`>`} <span className="text-green-400">true</span>)
                           <div className="h-2 w-1/2 bg-white/10 rounded mt-2"></div>
                           <div className="h-2 w-3/4 bg-white/5 rounded mt-1"></div>
                        </div>
                    </motion.div>

                    {/* VS Badge */}
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-500 to-[#7B61FF] p-[2px] shadow-[0_0_30px_rgba(245,113,135,0.6)] z-30"
                    >
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <span className="text-white font-black italic text-base md:text-lg pr-0.5">VS</span>
                        </div>
                    </motion.div>

                    {/* Player 2 */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        className="w-[45%] max-w-[200px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-xl flex flex-col overflow-hidden z-10 ml-2 md:ml-4"
                    >
                        <div className="p-2 md:p-3 border-b border-white/10 flex items-center gap-2 bg-black/40">
                           <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center"><span className="text-[10px] text-red-400 font-bold">P2</span></div>
                           <span className="text-xs text-white">Rival</span>
                        </div>
                        <div className="p-3 md:p-4 font-mono text-[8px] sm:text-[10px] leading-relaxed text-neutral-400 bg-[#0d0d0d]">
                           <span className="text-red-400">while</span>(n <span className="text-white">{`>`}</span> <span className="text-blue-300">0</span>) <span className="text-white">{`{`}</span>
                           <div className="h-2 w-1/2 bg-white/10 rounded mt-2"></div>
                           <div className="h-2 w-1/4 bg-white/5 rounded mt-1"></div>
                        </div>
                    </motion.div>

                 </div>
             </div>
          </motion.div>

          {/* Feature 4: MCQ Generator */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row-reverse items-center gap-12"
          >
             <div className="flex-1">
                <span className="text-emerald-400 text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Assess</span>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">MCQ Generator.</h3>
                <p className="text-lg md:text-xl text-neutral-400 font-medium">Generate infinite MCQ quizzes directly from your Vault knowledge on the fly.</p>
             </div>
             <div className="flex-1 w-full bg-gradient-to-bl from-emerald-500/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 min-h-[400px] flex items-center justify-center relative group perspective-[1000px]">
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700" />
                 
                    <motion.div 
                       whileHover={{ y: -5, scale: 1.02 }}
                       className="w-full max-w-[350px] bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl relative z-10"
                    >
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1.5"><Brain className="w-3 h-3"/> Quiz Gen</span>
                          <span className="text-[10px] text-neutral-500">2/10</span>
                       </div>
                       <p className="text-sm text-neutral-200 mb-4 font-medium">What is the time complexity of binary search?</p>
                       <div className="flex flex-col gap-2">
                           <div className="h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center px-3 relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                              <span className="text-xs text-emerald-300 font-mono">O(log n)</span>
                              <div className="ml-auto w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                 <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                              </div>
                           </div>
                           <div className="h-8 rounded-lg bg-white/5 border border-white/5 flex items-center px-3">
                              <span className="text-xs text-neutral-400 font-mono">O(n)</span>
                           </div>
                       </div>
                    </motion.div>
             </div>
          </motion.div>

          {/* Feature 5: Leave Manager */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center gap-12"
          >
             <div className="flex-1">
                <span className="text-amber-500 text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Optimize</span>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">Leave Manager.</h3>
                <p className="text-lg md:text-xl text-neutral-400 font-medium">Effortlessly balance your academics with our smart Leave Manager, keeping your attendance optimally placed.</p>
             </div>
             <div className="flex-1 w-full bg-gradient-to-br from-amber-500/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 min-h-[400px] flex items-center justify-center relative group perspective-[1000px]">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all duration-700" />
                 
                    <motion.div 
                       whileHover={{ y: -5, scale: 1.02 }}
                       className="w-full max-w-[300px] bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-6 relative z-10"
                    >
                       <div className="w-24 h-24 relative flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-white/10" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-amber-500" strokeWidth="4" strokeDasharray="75, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute text-2xl font-black text-white mix-blend-difference">75%</span>
                       </div>
                       <div className="flex flex-col text-center">
                           <span className="text-sm font-bold text-white mb-1">Data Structures</span>
                           <span className="text-xs text-amber-500 font-medium uppercase tracking-wider">Safe to skip</span>
                       </div>
                    </motion.div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* --- Massive Footer --- */}
      <footer className="bg-black text-white pt-32 pb-8 border-t border-white/10 relative overflow-hidden flex flex-col justify-between z-20">
        <div className="w-full">
            {/* Top row */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-16 md:gap-0 max-w-[1600px] mx-auto w-full px-8 lg:px-16">
               <div>
                  <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">Supercharge your<br/>college journey.</h3>
               </div>
               
               <div className="flex gap-20 sm:gap-32">
                  <div className="flex flex-col gap-4">
                     <Link to="/dashboard" className="text-neutral-400 hover:text-white transition-colors font-medium">Dashboard</Link>
                     <Link to="/vault" className="text-neutral-400 hover:text-white transition-colors font-medium">Knowledge Vault</Link>
                     <Link to="/roadmap" className="text-neutral-400 hover:text-white transition-colors font-medium">AI Roadmap</Link>
                  </div>
                  <div className="flex flex-col gap-4">
                     <Link to="/testpad" className="text-neutral-400 hover:text-white transition-colors font-medium">Testpad</Link>
                     <Link to="/duel" className="text-neutral-400 hover:text-white transition-colors font-medium">Code Duel</Link>
                     <Link to="/leave" className="text-neutral-400 hover:text-white transition-colors font-medium">Leave Manager</Link>
                  </div>
               </div>
            </div>

            {/* Giant text */}
            <div className="mt-24 md:mt-32 w-full flex justify-center items-center overflow-hidden px-4 select-none">
                <h1 className="text-[20vw] font-bold tracking-tighter leading-none text-white text-center pb-2">
                   Saarthi.
                </h1>
            </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 md:mt-24 max-w-[1600px] mx-auto w-full px-8 lg:px-16 gap-6">
            <div className="flex items-center gap-2">
               <GraduationCap className="h-6 w-6 text-neutral-400" />
               <span className="font-semibold text-xl text-neutral-400">Saarthi</span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-8 gap-y-4 text-sm text-neutral-500 font-medium">
               <span className="hover:text-white cursor-pointer transition-colors">About Saarthi</span>
               <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
               <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
               <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            </div>
        </div>
      </footer>

    </main>
  );
};

export default Landing;
