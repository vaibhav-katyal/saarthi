import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Play, Map, BookOpen, Code2, Swords, Brain, Calculator, Github, Twitter, Linkedin, Instagram, MessageSquare, Check, Upload } from 'lucide-react';
import ShaderLines from '../components/ShaderLines';
import { CustomCursor } from '../components/CustomCursor';

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

  // 6. ShaderLines Intro Background fades when user starts scrolling
  const shaderLinesOpacity = useTransform(smoothProgress, [0, 0.05], [1, 0]);
  
  return (
    <main className="bg-black text-white min-h-screen font-sans selection:bg-white/20 selection:text-white">
      <CustomCursor />
      <style>
        {`
          @media (min-width: 768px) {
            * {
              cursor: none !important;
            }
          }
        `}
      </style>

      {/* Minimal Apple-style Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference pointer-events-none">
        <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-16 py-4 flex items-center justify-between">
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
        </div>
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

          {/* ShaderLines Intro Background */}
          <motion.div
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            style={{ opacity: shaderLinesOpacity }}
          >
            <ShaderLines speed={0.4} bandWidth={0.05} colorMode="single" color="#ffffff" backgroundColor="transparent" blendMode="additive" flow="in-out" preview={true} />
          </motion.div>

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
                    to="/vault"
                    className="group relative inline-flex h-16 md:h-20 items-center justify-center gap-3 rounded-full border border-white/20 bg-black hover:bg-white/10 px-10 text-lg md:text-xl font-bold text-white transition-all hover:scale-105"
                  >
                    Start Your Journey
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex h-16 md:h-20 items-center justify-center gap-3 rounded-full border border-white/20 bg-black hover:bg-white/10 px-10 text-lg md:text-xl font-semibold text-white transition-colors"
                  >
                    <Play className="h-5 w-5 fill-white text-white" /> Explore Now
                  </Link>
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

      {/* --- Feature Sections (Premium Stacked Glass) --- */}
      <section id="features" className="bg-[#020202] text-white py-32 px-4 md:px-8 relative z-20 overflow-hidden">
        
        {/* Subtle background grain or grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto relative z-10 flex flex-col gap-32">
          
          <div className="text-center mb-10">
             <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white mix-blend-difference drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">Everything you need.</h2>
             <p className="text-neutral-400 text-xl md:text-2xl max-w-2xl mx-auto font-medium tracking-tight">A unified platform to conquer your academics, crafted with absolute precision.</p>
          </div>

          {/* Feature 1: Saarthi Chat (Text Left, Image Right) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative rounded-[2rem] md:rounded-[3rem] p-[1px] overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
             
             <div className="relative bg-[#050505]/90 backdrop-blur-3xl rounded-[calc(2rem-1px)] md:rounded-[calc(3rem-1px)] overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                
                {/* Ambient Backlight */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-emerald-500 text-xs font-bold mb-8 shadow-sm uppercase tracking-widest w-max">
                       <MessageSquare className="w-3.5 h-3.5" /> Intelligence
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white leading-[1.1] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Saarthi AI</h3>
                    <p className="text-neutral-400 text-lg md:text-xl font-medium leading-relaxed max-w-md mb-8">Your always-on AI companion. Debug your code, brainstorm ideas, or break down complex concepts with an intelligent assistant built specifically for academics.</p>
                    
                    <ul className="flex flex-col gap-4 mb-4">
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-emerald-500" />
                           </div>
                           Real-time Code Debugging
                        </li>
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-emerald-500" />
                           </div>
                           Concept Breakdown & Simplification
                        </li>
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-emerald-500" />
                           </div>
                           24/7 Academic Support
                        </li>
                    </ul>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-10 md:p-16 border-t md:border-t-0 md:border-l border-white/[0.05] bg-gradient-to-br from-[#0a0a0a] to-black">
                    {/* Clean Abstract Visual */}
                    <div className="w-64 h-80 bg-[#0a0a0a] border border-white/[0.08] rounded-2xl flex flex-col p-5 shadow-2xl relative overflow-hidden gap-4">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px]" />
                        <div className="w-3/4 h-12 bg-white/[0.02] border border-white/[0.05] rounded-xl self-start rounded-tl-sm p-3 flex flex-col gap-2 relative z-10">
                             <div className="w-full h-1.5 bg-white/10 rounded" />
                             <div className="w-2/3 h-1.5 bg-white/10 rounded" />
                        </div>
                        <div className="w-3/4 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-xl self-end rounded-tr-sm p-3 flex flex-col gap-2 relative z-10">
                             <div className="w-full h-1.5 bg-emerald-500/40 rounded" />
                             <div className="w-5/6 h-1.5 bg-emerald-500/40 rounded" />
                             <div className="w-1/2 h-1.5 bg-emerald-500/40 rounded" />
                             <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                 <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                             </div>
                        </div>
                        <div className="w-2/3 h-12 bg-white/[0.02] border border-white/[0.05] rounded-xl self-start rounded-tl-sm p-3 flex flex-col gap-2 relative z-10">
                             <div className="w-full h-1.5 bg-white/10 rounded" />
                             <div className="w-1/3 h-1.5 bg-white/10 rounded" />
                        </div>
                    </div>
                </div>
             </div>
          </motion.div>

          {/* Feature 2: AI Roadmap (Image Left, Text Right) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative rounded-[2rem] md:rounded-[3rem] p-[1px] overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-bl from-white/10 via-transparent to-white/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
             
             <div className="relative bg-[#050505]/90 backdrop-blur-3xl rounded-[calc(2rem-1px)] md:rounded-[calc(3rem-1px)] overflow-hidden flex flex-col md:flex-row-reverse min-h-[500px]">
                
                {/* Ambient Backlight */}
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00F5FF]/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#00F5FF] text-xs font-bold mb-8 shadow-sm uppercase tracking-widest w-max">
                       <Map className="w-3.5 h-3.5" /> Intelligence
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white leading-[1.1] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">AI Roadmap Architect</h3>
                    <p className="text-neutral-400 text-lg md:text-xl font-medium leading-relaxed max-w-md mb-8">Describe your end goal to dynamically build a personalized, step-by-step mastery path. Track your progress with precision.</p>

                    <ul className="flex flex-col gap-4 mb-4">
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-[#00F5FF]" />
                           </div>
                           Dynamic Path Generation
                        </li>
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-[#00F5FF]" />
                           </div>
                           Step-by-Step Mastery Modules
                        </li>
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-[#00F5FF]" />
                           </div>
                           Real-time Progress Tracking
                        </li>
                    </ul>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-10 md:p-16 border-t md:border-t-0 md:border-r border-white/[0.05] bg-gradient-to-bl from-[#0a0a0a] to-black">
                    {/* Mastery Path Visual */}
                    <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                            <Map className="w-5 h-5 text-[#00F5FF]" />
                            <span className="text-white font-bold tracking-widest text-sm">MASTERY PATH</span>
                         </div>
                         <div className="px-3 py-1 rounded-full border border-[#00F5FF]/30 bg-[#00F5FF]/10 text-[#00F5FF] text-xs font-medium">
                            Active
                         </div>
                      </div>

                      {/* Timeline Item 1 */}
                      <div className="relative pl-8">
                         {/* Timeline Line */}
                         <div className="absolute left-3 top-6 bottom-[-24px] w-px border-l border-dashed border-white/20" />
                         {/* Timeline Dot */}
                         <div className="absolute left-[3px] top-1.5 w-6 h-6 rounded-full border-2 border-[#00F5FF] flex items-center justify-center bg-[#0a0a0a] shadow-[0_0_10px_rgba(0,245,255,0.3)]">
                            <div className="w-2 h-2 bg-[#00F5FF] rounded-full" />
                         </div>
                         
                         <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                               <span className="text-white font-bold text-sm">Fundamentals</span>
                               <span className="text-[#00F5FF] text-xs font-bold">100%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-[#00F5FF] w-full shadow-[0_0_10px_#00F5FF]" />
                            </div>
                         </div>
                      </div>

                      {/* Timeline Item 2 */}
                      <div className="relative pl-8">
                         {/* Timeline Dot */}
                         <div className="absolute left-[3px] top-1.5 w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center bg-[#0a0a0a]">
                            <div className="w-2 h-2 bg-white/20 rounded-full" />
                         </div>
                         
                         <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                               <span className="text-white font-bold text-sm">Advanced Concepts</span>
                               <span className="text-neutral-500 text-xs font-mono">In Progress</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-[#00F5FF] to-transparent w-1/3" />
                            </div>
                         </div>
                      </div>
                    </div>
                </div>
             </div>
          </motion.div>

          {/* Feature 3: The Vault (Text Left, Image Right) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative rounded-[2rem] md:rounded-[3rem] p-[1px] overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
             
             <div className="relative bg-[#050505]/90 backdrop-blur-3xl rounded-[calc(2rem-1px)] md:rounded-[calc(3rem-1px)] overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                
                {/* Ambient Backlight */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7B61FF]/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#7B61FF] text-xs font-bold mb-8 shadow-sm uppercase tracking-widest w-max">
                       <BookOpen className="w-3.5 h-3.5" /> Knowledge
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white leading-[1.1] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">The Vault</h3>
                    <p className="text-neutral-400 text-lg md:text-xl font-medium leading-relaxed max-w-md mb-8">Upload your materials and let our specialized AI engine identify key concepts, generate dynamic syllabi, and organize your knowledge instantly.</p>
                    
                    <ul className="flex flex-col gap-4 mb-4">
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-[#7B61FF]" />
                           </div>
                           Intelligent Document Processing
                        </li>
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-[#7B61FF]" />
                           </div>
                           Dynamic Syllabus Generation
                        </li>
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-[#7B61FF]" />
                           </div>
                           Automated Concept Extraction
                        </li>
                    </ul>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-10 md:p-16 border-t md:border-t-0 md:border-l border-white/[0.05] bg-gradient-to-br from-[#0a0a0a] to-black">
                    {/* Clean Abstract Visual */}
                    <div className="w-full max-w-md aspect-[4/3] bg-[#0a0a0a] border border-white/[0.08] rounded-2xl flex flex-col items-center justify-center hover:border-white/20 transition-all duration-300 cursor-pointer shadow-2xl relative overflow-hidden group/upload">
                         <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px]" />
                         <Upload className="w-8 h-8 text-neutral-400 mb-4 group-hover/upload:-translate-y-2 group-hover/upload:text-white transition-all duration-300 relative z-10" />
                         <span className="text-white font-semibold mb-1 relative z-10">Upload Academic Material</span>
                         <span className="text-neutral-500 text-sm relative z-10">PDF, PPTX, DOC up to 50MB</span>
                    </div>
                </div>
             </div>
          </motion.div>

          {/* Feature 4: Code Duels & Testpad (Image Left, Text Right) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative rounded-[2rem] md:rounded-[3rem] p-[1px] overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-bl from-white/10 via-transparent to-white/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
             
             <div className="relative bg-[#050505]/90 backdrop-blur-3xl rounded-[calc(2rem-1px)] md:rounded-[calc(3rem-1px)] overflow-hidden flex flex-col md:flex-row-reverse min-h-[500px]">
                
                {/* Ambient Backlight */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-red-500 text-xs font-bold mb-8 shadow-sm uppercase tracking-widest w-max">
                       <Swords className="w-3.5 h-3.5" /> Practice Arena
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white leading-[1.1] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Code Duels & Testpad</h3>
                    <p className="text-neutral-400 text-lg md:text-xl font-medium leading-relaxed max-w-md mb-8">Hone your skills in the interactive AI-powered Testpad lab, or battle friends in real-time competitive Code Duels.</p>

                    <ul className="flex flex-col gap-4 mb-4">
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-red-500" />
                           </div>
                           Interactive AI-Powered Lab
                        </li>
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-red-500" />
                           </div>
                           Real-time Competitive Duels
                        </li>
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-red-500" />
                           </div>
                           Live Performance Analytics
                        </li>
                    </ul>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-10 md:p-16 border-t md:border-t-0 md:border-r border-white/[0.05] bg-gradient-to-bl from-[#0a0a0a] to-black">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px]" />
                    {/* Code Duels Visual */}
                    <div className="w-full max-w-md relative flex items-center justify-center h-80 z-10">
                      {/* P1 Window (Cyan) */}
                      <div className="absolute left-0 top-8 w-64 bg-[#0a0a0a] border border-[#00F5FF]/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,245,255,0.05)] transform -rotate-3 z-10 backdrop-blur-xl">
                          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#00F5FF]/10 border border-[#00F5FF]/30 flex items-center justify-center text-[#00F5FF] text-[10px] font-bold shadow-[0_0_10px_rgba(0,245,255,0.2)]">P1</div>
                                <span className="text-white font-bold text-sm">You</span>
                             </div>
                             <span className="px-2 py-0.5 rounded-full bg-[#00F5FF]/10 text-[#00F5FF] text-[10px] font-bold">Running</span>
                          </div>
                          <div className="font-mono text-[10px] leading-relaxed">
                             <span className="text-pink-500">function</span> <span className="text-[#00F5FF]">solve</span><span className="text-white">(arr) {'{'}</span><br/>
                             <span className="text-pink-500 ml-4">return</span> <span className="text-white">arr.</span><span className="text-[#00F5FF]">filter</span><span className="text-white">(</span><br/>
                             <span className="text-white ml-8">x {'=>'} x {'>'} <span className="text-orange-400">0</span></span><br/>
                             <span className="text-white ml-4">);</span><br/>
                             <span className="text-white">{'}'}</span>
                          </div>
                      </div>

                      {/* P2 Window (Red) */}
                      <div className="absolute right-0 bottom-8 w-64 bg-[#0a0a0a] border border-red-500/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.05)] transform rotate-3 z-20 backdrop-blur-xl">
                          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-[10px] font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]">P2</div>
                                <span className="text-white font-bold text-sm">Rival</span>
                             </div>
                             <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">Error</span>
                          </div>
                          <div className="font-mono text-[10px] leading-relaxed">
                             <span className="text-neutral-500">...</span><br/>
                             <span className="text-white ml-4">data.</span><span className="text-blue-400">push</span><span className="text-white">(n);</span><br/>
                             <br/>
                             <span className="text-red-400 font-bold">TypeError: data</span><br/>
                             <span className="text-red-400 font-bold">is undefined</span><br/>
                             <span className="text-white">{'}'}</span>
                          </div>
                      </div>

                      {/* Center VS Icon */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 flex items-center justify-center z-30 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                          <div className="absolute inset-0 rounded-full border border-white/5" />
                          <Swords className="w-7 h-7 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                          
                          {/* Glow rings */}
                          <div className="absolute inset-[-10px] rounded-full border border-dashed border-white/10 animate-[spin_10s_linear_infinite]" />
                          <div className="absolute inset-[-20px] rounded-full border border-dotted border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
                      </div>
                    </div>
                </div>
             </div>
          </motion.div>

          {/* Feature 5: Optimizer (Text Left, Image Right) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative rounded-[2rem] md:rounded-[3rem] p-[1px] overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
             
             <div className="relative bg-[#050505]/90 backdrop-blur-3xl rounded-[calc(2rem-1px)] md:rounded-[calc(3rem-1px)] overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                
                {/* Ambient Backlight */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="flex-1 p-10 md:p-16 flex flex-col justify-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-amber-500 text-xs font-bold mb-8 shadow-sm uppercase tracking-widest w-max">
                       <Code2 className="w-3.5 h-3.5" /> Optimizer
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white leading-[1.1] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Leave Manager</h3>
                    <p className="text-neutral-400 text-lg md:text-xl font-medium leading-relaxed max-w-md mb-8">Effortlessly balance your academics. Our smart Leave Manager keeps your attendance optimally placed, telling you exactly when it's safe to skip.</p>

                    <ul className="flex flex-col gap-4 mb-4">
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-amber-500" />
                           </div>
                           Automated Attendance Tracking
                        </li>
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-amber-500" />
                           </div>
                           Safe-to-Skip Predictions
                        </li>
                        <li className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base">
                           <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-amber-500" />
                           </div>
                           Optimal Academic Balancing
                        </li>
                    </ul>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-10 md:p-16 border-t md:border-t-0 md:border-l border-white/[0.05] bg-gradient-to-br from-[#0a0a0a] to-black">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px]" />
                    {/* Clean Abstract Visual */}
                    <div className="w-64 h-64 rounded-full border border-white/[0.05] flex items-center justify-center relative z-10">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                           <motion.circle 
                              cx="50" cy="50" r="48" fill="none" stroke="#F59E0B" strokeWidth="2" 
                              strokeDasharray="301" strokeDashoffset="75" strokeLinecap="round"
                              initial={{ strokeDashoffset: 301 }}
                              whileInView={{ strokeDashoffset: 75 }}
                              viewport={{ once: true }}
                              transition={{ duration: 2, ease: "easeOut" }}
                           />
                        </svg>
                        <div className="text-center flex flex-col items-center">
                            <span className="text-5xl font-bold text-white tracking-tighter">75<span className="text-3xl text-neutral-500">%</span></span>
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-2">Optimal</span>
                        </div>
                    </div>
                </div>
             </div>
          </motion.div>

        </div>
      </section>

      {/* --- Massive Footer --- */}
      {/* --- Compact Aesthetic Footer --- */}
      <footer className="bg-black text-white pt-20 pb-12 border-t border-white/5 relative z-20">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-16">
            
            {/* Brand Section */}
            <div className="md:col-span-5 flex flex-col gap-6">
              <div className="w-14 h-14 bg-white flex items-center justify-center rounded-sm">
                 <span className="text-black font-black text-2xl tracking-tighter">S.</span>
              </div>
              <div className="max-w-xs">
                 <h3 className="text-2xl font-bold tracking-tight leading-tight text-white/90">
                   The ultimate companion for your academic journey.
                 </h3>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-4 grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                 <span className="text-[10px] text-neutral-500 font-bold tracking-[0.4em] uppercase mb-2">Platform</span>
                 <Link to="/dashboard" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium tracking-tight">Dashboard</Link>
                 <Link to="/vault" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium tracking-tight">Knowledge Vault</Link>
                 <Link to="/roadmap" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium tracking-tight">AI Roadmap</Link>
              </div>
              <div className="flex flex-col gap-4">
                 <span className="text-[10px] text-neutral-500 font-bold tracking-[0.4em] uppercase mb-2">Practice</span>
                 <Link to="/testpad" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium tracking-tight">Testpad</Link>
                 <Link to="/duel" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium tracking-tight">Code Duel</Link>
                 <Link to="/leave" className="text-neutral-400 hover:text-white transition-colors text-sm font-medium tracking-tight">Leave Manager</Link>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col md:items-end gap-6">
              <span className="text-[10px] text-white font-bold tracking-[0.4em] uppercase">Connect</span>
              <div className="flex items-center gap-6 md:gap-8 -mr-2">
                 <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-400 hover:text-white transition-all hover:scale-110"><Twitter className="w-5 h-5"/></a>
                 <a href="https://github.com/vaibhav-katyal/saarthi" target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-400 hover:text-white transition-all hover:scale-110"><Github className="w-5 h-5"/></a>
                 <a href="https://www.linkedin.com/in/visheshjha11/" target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-400 hover:text-white transition-all hover:scale-110"><Linkedin className="w-5 h-5"/></a>
                 <a href="https://github.com/vaibhav-katyal/saarthi" target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-400 hover:text-white transition-all hover:scale-110"><Instagram className="w-5 h-5"/></a>
              </div>
            </div>
          </div>

          {/* Giant Branding - Left Aligned */}
          <div className="relative w-full overflow-hidden select-none mb-10">
              <h1 className="text-[18vw] font-bold tracking-normal leading-none text-white text-left opacity-100 relative z-10 -ml-[0.05em]">
                 Saarthi.
              </h1>
              {/* Background Glow */}
              <div className="absolute left-0 bottom-0 w-[40vw] h-[20vw] bg-[#00F5FF]/5 blur-[120px] -z-10 rounded-full" />
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
             <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-neutral-600" />
                <span className="text-[11px] font-bold text-neutral-600 tracking-[0.1em] uppercase">© 2026 Saarthi.</span>
             </div>
             <div className="flex gap-10 text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em]">
                <Link to="/privacy" className="hover:text-white cursor-pointer transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white cursor-pointer transition-colors">Terms of Service</Link>
             </div>
          </div>
        </div>
      </footer>

    </main>
  );
};

export default Landing;
