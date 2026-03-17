import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Play } from 'lucide-react';

const FRAME_COUNT = 34;

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

  // Canvas drawing mapping: 0.0 -> 0.4 = Frames 0 -> 33
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (!loaded || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Map the 0-0.4 progress range to the 0-33 frames
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
  const initialElementsOpacity = useTransform(smoothProgress, [0, 0.05], [1, 0]);
  const initialElementsY = useTransform(smoothProgress, [0, 0.05], [0, 20]);

  // 2. Main Title "Your Personal AI For College."
  // Stays from 0 to 0.35, then fades out before SAARTHI
  const mainTitleOpacity = useTransform(smoothProgress, [0, 0.35, 0.4], [1, 1, 0]);
  const mainTitleScale = useTransform(smoothProgress, [0.35, 0.4], [1, 1.1]);

  // 3. Sub-Phrases (Study Better -> Plan Smarter -> Achieve More)
  const phrase1Opacity = useTransform(smoothProgress, [0.05, 0.1, 0.15, 0.2], [0, 1, 1, 0]);
  const phrase1Y = useTransform(smoothProgress, [0.05, 0.1, 0.15, 0.2], [20, 0, 0, -20]);

  const phrase2Opacity = useTransform(smoothProgress, [0.15, 0.2, 0.25, 0.3], [0, 1, 1, 0]);
  const phrase2Y = useTransform(smoothProgress, [0.15, 0.2, 0.25, 0.3], [20, 0, 0, -20]);

  const phrase3Opacity = useTransform(smoothProgress, [0.25, 0.3, 0.35, 0.4], [0, 1, 1, 0]);
  const phrase3Y = useTransform(smoothProgress, [0.25, 0.3, 0.35, 0.4], [20, 0, 0, -20]);

  // 4. Big "SAARTHI" Text
  const saarthiOpacity = useTransform(smoothProgress, [0.38, 0.4, 0.45, 0.5], [0, 1, 1, 0]);
  const saarthiScale = useTransform(smoothProgress, [0.38, 0.4, 0.45, 0.5], [0.8, 1, 1, 1.2]);

  // 5. Canvas Fade Out (after SAARTHI)
  const canvasOpacity = useTransform(smoothProgress, [0.45, 0.5], [1, 0]);

  // --- Story Sections (0.5 to 1.0) ---
  const section1Opacity = useTransform(smoothProgress, [0.5, 0.55, 0.65, 0.7], [0, 1, 1, 0]);
  const section1Y = useTransform(smoothProgress, [0.5, 0.55, 0.65, 0.7], [50, 0, 0, -50]);

  const section2Opacity = useTransform(smoothProgress, [0.65, 0.7, 0.8, 0.85], [0, 1, 1, 0]);
  const section2Y = useTransform(smoothProgress, [0.65, 0.7, 0.8, 0.85], [50, 0, 0, -50]);

  const section3Opacity = useTransform(smoothProgress, [0.8, 0.85, 0.95, 1], [0, 1, 1, 0]);
  const section3Y = useTransform(smoothProgress, [0.8, 0.85, 0.95, 1], [50, 0, 0, -50]);

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
              <div className="relative h-[80px] md:h-[100px] w-full mt-2 flex items-start justify-center overflow-hidden">

                {/* Phrase 1 (Initial Phrase if needed, or animated ones) */}
                <motion.h2
                  className="absolute text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-[#86868b]"
                  style={{ opacity: phrase1Opacity, y: phrase1Y }}
                >
                  Study Better.
                </motion.h2>

                {/* Phrase 2 */}
                <motion.h2
                  className="absolute text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-[#86868b]"
                  style={{ opacity: phrase2Opacity, y: phrase2Y }}
                >
                  Plan Smarter.
                </motion.h2>

                {/* Phrase 3 */}
                <motion.h2
                  className="absolute text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-[#86868b]"
                  style={{ opacity: phrase3Opacity, y: phrase3Y }}
                >
                  Achieve More.
                </motion.h2>

              </div>
            </motion.div>

            {/* Buttons (Only visible at scroll 0, fades out before phrases activate) */}
            <motion.div
              className="absolute top-[110%] flex flex-col items-center w-full max-w-3xl text-center pointer-events-auto"
              style={{ opacity: initialElementsOpacity, y: initialElementsY }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link
                  to="/dashboard"
                  className="group relative inline-flex h-12 lg:h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-black hover:bg-white/10 px-8 text-[15px] font-bold text-white transition-all hover:scale-105"
                >
                  Start Your Journey
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button onClick={() => {
                  const el = document.getElementById('details');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                  className="inline-flex h-12 lg:h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-black hover:bg-white/10 px-8 text-[15px] font-semibold text-white transition-colors"
                >
                  <Play className="h-4 w-4 text-white" /> Explore Features
                </button>
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

          {/* --- Project Details Story Sections --- */}
          <div id="details" className="absolute inset-0 pointer-events-none flex items-center justify-center px-6">
            <div className="w-full max-w-5xl relative h-full">

              {/* Section 1 */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 left-0 max-w-xl"
                style={{ opacity: section1Opacity, y: section1Y }}
              >
                <p className="text-[#00F5FF] font-semibold tracking-widest uppercase text-sm mb-3">Intelligence Layer</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4 text-white">
                  Your AI Roadmap <br />Architect.
                </h2>
                <p className="text-lg md:text-xl text-[#a1a1a6] font-normal leading-relaxed">
                  Describe your end goal. Saarthi dynamically builds a personalized, step-by-step mastery path with milestones, resources, and adaptive difficulty. Never feel lost again.
                </p>
              </motion.div>

              {/* Section 2 */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 right-0 max-w-xl text-left md:text-right"
                style={{ opacity: section2Opacity, y: section2Y }}
              >
                <p className="text-[#7B61FF] font-semibold tracking-widest uppercase text-sm mb-3">Knowledge Engine</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4 text-white">
                  A Vault That<br />Thinks.
                </h2>
                <p className="text-lg md:text-xl text-[#a1a1a6] font-normal leading-relaxed">
                  Save links, notes, and PDFs. Our AI automatically digests, summarizes, tags, and connects ideas—turning raw data into a structured personal syllabus.
                </p>
              </motion.div>

              {/* Section 3 */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 left-0 max-w-xl"
                style={{ opacity: section3Opacity, y: section3Y }}
              >
                <p className="text-emerald-400 font-semibold tracking-widest uppercase text-sm mb-3">Practice Core</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4 text-white">
                  Practice. Compile. <br />Improve.
                </h2>
                <p className="text-lg md:text-xl text-[#a1a1a6] font-normal leading-relaxed">
                  A fully integrated lab environment. Get AI-generated problems tailored to your skill gaps, with instant execution and line-by-line evaluation.
                </p>
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
