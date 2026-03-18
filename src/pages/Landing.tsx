import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Play } from 'lucide-react';

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

  // Canvas drawing mapping: 0.0 -> 0.4 = Frames 0 -> 110
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (!loaded || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Map the 0-0.4 progress range to the 0-110 frames
    let frameProgress = latest / 0.4;
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

  // 1. Initial Hero Buttons fade out instantly (0 - 0.05)
  const initialElementsOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);
  const initialElementsY = useTransform(smoothProgress, [0, 0.08], [0, -20]);

  // 2. Main Title "Your Personal AI For College."
  // Stays from 0 to 0.35, then fades out before SAARTHI
  const mainTitleOpacity = useTransform(smoothProgress, [0, 0.35, 0.4], [1, 1, 0]);
  const mainTitleScale = useTransform(smoothProgress, [0.35, 0.4], [1, 1.1]);

  // 3. Sub-Phrases (Study Better -> Plan Smarter -> Achieve More)
  const phrase1Opacity = useTransform(smoothProgress, [0.08, 0.13, 0.18, 0.23], [0, 1, 1, 0]);
  const phrase1Y = useTransform(smoothProgress, [0.08, 0.13, 0.18, 0.23], [20, 0, 0, -20]);

  const phrase2Opacity = useTransform(smoothProgress, [0.18, 0.23, 0.28, 0.33], [0, 1, 1, 0]);
  const phrase2Y = useTransform(smoothProgress, [0.18, 0.23, 0.28, 0.33], [20, 0, 0, -20]);

  const phrase3Opacity = useTransform(smoothProgress, [0.28, 0.33, 0.38, 0.43], [0, 1, 1, 0]);
  const phrase3Y = useTransform(smoothProgress, [0.28, 0.33, 0.38, 0.43], [20, 0, 0, -20]);

  // 4. Big "SAARTHI" Text
  const saarthiOpacity = useTransform(smoothProgress, [0.38, 0.4, 0.45, 0.5], [0, 1, 1, 0]);
  const saarthiScale = useTransform(smoothProgress, [0.38, 0.4, 0.45, 0.5], [0.8, 1, 1, 1.2]);

  // 5. Canvas Fade Out (after SAARTHI)
  const canvasOpacity = useTransform(smoothProgress, [0.45, 0.5], [1, 0]);

  // --- Cinematic Story Sections (0.5 to 1.0) ---
  // A soft atmospheric glow that follows the journey
  const storyGlowOpacity = useTransform(smoothProgress, [0.45, 0.5, 0.95, 1], [0, 0.15, 0.15, 0]);
  const storyGlowColor = useTransform(
    smoothProgress, 
    [0.5, 0.7, 0.9], 
    ["rgba(0,245,255,1)", "rgba(123,97,255,1)", "rgba(52,211,153,1)"]
  );

  // Section 1: Alternate Left Layout
  const section1Opacity = useTransform(smoothProgress, [0.5, 0.55, 0.65, 0.7], [0, 1, 1, 0]);
  const section1X = useTransform(smoothProgress, [0.5, 0.55, 0.65, 0.7], [-100, 0, 0, -100]);
  const s1ImageX = useTransform(smoothProgress, [0.5, 0.55, 0.65, 0.7], [100, 0, 0, 100]);

  // Section 2: Alternate Right Layout
  const section2Opacity = useTransform(smoothProgress, [0.65, 0.7, 0.8, 0.85], [0, 1, 1, 0]);
  const section2X = useTransform(smoothProgress, [0.65, 0.7, 0.8, 0.85], [100, 0, 0, 100]);
  const s2ImageX = useTransform(smoothProgress, [0.65, 0.7, 0.8, 0.85], [-100, 0, 0, -100]);

  // Section 3: Alternate Left Layout
  const section3Opacity = useTransform(smoothProgress, [0.8, 0.85, 0.95, 1], [0, 1, 1, 0]);
  const section3X = useTransform(smoothProgress, [0.8, 0.85, 0.95, 1], [-100, 0, 0, -100]);
  const s3ImageX = useTransform(smoothProgress, [0.8, 0.85, 0.95, 1], [100, 0, 0, 100]);

  // Connecting Thread
  const threadOpacity = useTransform(smoothProgress, [0.45, 0.5, 0.95, 1], [0, 1, 1, 0]);
  const threadGlowY = useTransform(smoothProgress, [0.5, 1], ["0%", "100%"]);

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
      <div ref={containerRef} className="relative h-[800vh] w-full bg-black">

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

          {/* --- Cinematic Story Journey Sections --- */}
          <div id="details" className="absolute inset-0 pointer-events-none flex items-center justify-center px-6">
            
            {/* Connecting Cinematic Thread Line */}
            <motion.div 
              style={{ opacity: threadOpacity }}
              className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5 z-0" 
            >
              <motion.div 
                style={{ top: threadGlowY }}
                className="absolute w-[2px] h-[20vh] bg-gradient-to-b from-transparent via-white/40 to-transparent blur-[1px]" 
              />
              <motion.div 
                style={{ top: threadGlowY }}
                className="absolute left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-white/5 rounded-full blur-[80px]" 
              />
            </motion.div>

            {/* Soft Ambient Cinematic Glow */}
            <motion.div
              className="absolute w-[800px] h-[800px] rounded-full blur-[160px] z-0"
              style={{ 
                opacity: storyGlowOpacity,
                backgroundColor: storyGlowColor,
                left: '50%',
                top: '50%',
                x: '-50%',
                y: '-50%'
              }}
            />

            <div className="w-full max-w-7xl relative h-[70vh] flex items-center justify-center">

              {/* Section 1: AI Roadmap Architect (Image Right, Text Left) */}
              <motion.div
                className="absolute inset-0 flex flex-col md:flex-row items-center justify-between gap-12"
                style={{ opacity: section1Opacity }}
              >
                {/* Text Content */}
                <motion.div 
                  className="flex-1 max-w-xl text-left"
                  style={{ x: section1X }}
                >
                  <span className="text-[#00F5FF] text-xs font-bold tracking-[0.4em] uppercase mb-8 opacity-60">Intelligence — Chapter 01</span>
                  <h2 className="text-5xl md:text-7xl lg:text-[5rem] font-bold tracking-tighter text-white leading-[1] mb-10">
                    Your AI Roadmap <br />Architect.
                  </h2>
                  <p className="text-xl md:text-2xl text-neutral-400 font-medium leading-relaxed">
                    Describe your end goal. Saarthi dynamically builds a personalized, step-by-step mastery path with milestones and resources tailored to your skill level.
                  </p>
                </motion.div>
                
                {/* Image Narrative */}
                <motion.div 
                  className="flex-1 w-full max-w-[500px] aspect-square relative"
                  style={{ x: s1ImageX }}
                >
                  <img src="/roadmap_visual.png" alt="Roadmap Visual" className="object-cover rounded-3xl opacity-90 transition-opacity hover:opacity-100" />
                  <div className="absolute inset-0 bg-neutral-900/10 rounded-3xl border border-white/10" />
                </motion.div>
              </motion.div>

              {/* Section 2: Vault That Thinks (Image Left, Text Right) */}
              <motion.div
                className="absolute inset-0 flex flex-col md:flex-row-reverse items-center justify-between gap-12"
                style={{ opacity: section2Opacity }}
              >
                {/* Text Content */}
                <motion.div 
                  className="flex-1 max-w-xl text-right md:text-left"
                  style={{ x: section2X }}
                >
                  <span className="text-[#7B61FF] text-xs font-bold tracking-[0.4em] uppercase mb-8 opacity-60">Synthesis — Chapter 02</span>
                  <h2 className="text-5xl md:text-7xl lg:text-[5rem] font-bold tracking-tighter text-white leading-[1] mb-10">
                    A Vault That<br />Thinks.
                  </h2>
                  <p className="text-xl md:text-2xl text-neutral-400 font-medium leading-relaxed">
                    Save any link, PDF, or note. Our AI automatically digests and connections ideas, turning raw data into a structured personal syllabus.
                  </p>
                </motion.div>

                {/* Image Narrative */}
                <motion.div 
                  className="flex-1 w-full max-w-[500px] aspect-square relative"
                  style={{ x: s2ImageX }}
                >
                  <img src="/vault_visual.png" alt="Vault Visual" className="object-cover rounded-3xl opacity-90 transition-opacity hover:opacity-100" />
                  <div className="absolute inset-0 bg-neutral-900/10 rounded-3xl border border-white/10" />
                </motion.div>
              </motion.div>

              {/* Section 3: Practice Core (Image Right, Text Left) */}
              <motion.div
                className="absolute inset-0 flex flex-col md:flex-row items-center justify-between gap-12"
                style={{ opacity: section3Opacity }}
              >
                {/* Text Content */}
                <motion.div 
                  className="flex-1 max-w-xl text-left"
                  style={{ x: section3X }}
                >
                  <span className="text-emerald-400 text-xs font-bold tracking-[0.4em] uppercase mb-8 opacity-60">Mastery — Chapter 03</span>
                  <h2 className="text-5xl md:text-7xl lg:text-[5rem] font-bold tracking-tighter text-white leading-[1] mb-10">
                    Practice. Compile.<br />Improve.
                  </h2>
                  <p className="text-xl md:text-2xl text-neutral-400 font-medium leading-relaxed">
                    A fully integrated lab environment. Get AI-generated problems with instant line-by-line evaluation to master anything from code to concepts.
                  </p>
                </motion.div>

                {/* Image Narrative */}
                <motion.div 
                  className="flex-1 w-full max-w-[500px] aspect-square relative"
                  style={{ x: s3ImageX }}
                >
                  <img src="/practice_visual.png" alt="Practice Visual" className="object-cover rounded-3xl opacity-90 transition-opacity hover:opacity-100" />
                  <div className="absolute inset-0 bg-neutral-900/10 rounded-3xl border border-white/10" />
                </motion.div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>

      {/* Final CTA Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-black px-6 text-center border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white mb-8">
            Start your journey.
          </h2>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-medium text-black transition-all hover:scale-105 hover:bg-neutral-200 duration-300"
          >
            Enter Saarthi
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

    </main>
  );
};

export default Landing;
