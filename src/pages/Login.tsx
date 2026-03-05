import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, GraduationCap, ArrowLeft, BrainCircuit, BookOpen, Code2, Sparkles, ArrowRight } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isSignUp
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

    const body = isSignUp
      ? JSON.stringify({ name: `${firstName} ${lastName}`.trim(), email, password })
      : JSON.stringify({ email, password });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isSignUp ? "Registration failed" : "Login failed"));
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(isSignUp ? "Registration successful!" : "Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setLoading(true);
    try {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoRes.json();

      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: tokenResponse.access_token,
          userInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Google login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Google login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Google login failed"),
  });

  return (
    <div className="min-h-screen w-full bg-[#070B14] text-white font-sans flex overflow-hidden selection:bg-[#00F5FF]/30">
      
      {/* LEFT COLUMN - FORM (Matches image structure) */}
      <div className="w-full lg:w-1/2 min-h-screen overflow-y-auto flex flex-col relative z-20 px-6 sm:px-12 md:px-20 lg:px-24 bg-[#070B14] shadow-[10px_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Top bar with back button */}
        <div className="py-8 flex items-center justify-between w-full">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-muted-foreground hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00F5FF]/10 lg:hidden group">
            <GraduationCap className="h-4 w-4 text-[#00F5FF]" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center w-full max-w-[420px] mx-auto py-10">
          
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white font-heading mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-[15px] text-muted-foreground pr-4">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#00F5FF] font-medium hover:text-[#00F5FF]/80 transition-colors bg-transparent border-none p-0 inline hover:underline"
              >
                {isSignUp ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>

          {/* Google Login (At the top like the screenshot) */}
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-white/90 px-4 py-3 text-sm font-bold text-black transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] mb-6 hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.2)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isSignUp ? "Sign up with Google" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6 relative">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-[#00F5FF]/50 focus:bg-[#00F5FF]/5 transition-all"
                    placeholder="First name"
                    required={isSignUp}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-[#00F5FF]/50 focus:bg-[#00F5FF]/5 transition-all"
                    placeholder="Last name"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-[#00F5FF]/50 focus:bg-[#00F5FF]/5 transition-all"
                placeholder="Email address"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-[#00F5FF]/50 focus:bg-[#00F5FF]/5 transition-all pr-12"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] py-3.5 text-[15px] font-bold text-white shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              {loading
                ? (isSignUp ? "Creating Account..." : "Signing In...")
                : (isSignUp ? "Create Account" : "Log in")}
            </button>
          </form>

          {/* Footer note */}
          {isSignUp && (
            <p className="text-center text-xs text-muted-foreground/70 mt-8 mb-4">
               By creating an account, I agree to Saarthi's{" "}
              <a href="#" className="text-[#00F5FF] hover:underline font-medium">Privacy Policy</a> and <a href="#" className="text-[#00F5FF] hover:underline font-medium">Terms of Service</a>.
            </p>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN - VISUALS (Visible on LG and above) */}
      <div className="hidden lg:flex w-1/2 bg-[#0A0E17] relative items-center justify-center p-12 overflow-hidden">
        
        {/* Abstract Background Elements inside right pan */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] mix-blend-soft-light" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E17] via-transparent to-[#0A0E17] opacity-80 z-10" />
        <div className="absolute top-1/4 -right-10 w-96 h-96 bg-[#00F5FF]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -left-10 w-96 h-96 bg-[#7B61FF]/20 blur-[120px] rounded-full pointer-events-none" />

        {/* Modern AI Core Visualization Elements */}
        <div className="relative z-20 w-full max-w-[500px] aspect-square">
          
          <div className="absolute inset-0 flex items-center justify-center">
            
            {/* Background SVG Connective Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" viewBox="0 0 500 500" fill="none">
               <motion.path 
                 d="M 120 180 Q 250 250 380 200" 
                 stroke="url(#gradient-line)" 
                 strokeWidth="2" 
                 strokeDasharray="4 6" 
                 animate={{ strokeDashoffset: [0, 50] }} 
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               />
               <motion.path 
                 d="M 150 350 Q 250 250 400 320" 
                 stroke="url(#gradient-line)" 
                 strokeWidth="1.5" 
                 strokeDasharray="2 4" 
                 animate={{ strokeDashoffset: [0, -50] }} 
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               />
               <defs>
                 <linearGradient id="gradient-line" x1="0" y1="0" x2="500" y2="500">
                    <stop offset="0%" stopColor="#00F5FF" stopOpacity="0" />
                    <stop offset="50%" stopColor="#7B61FF" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#00F5FF" stopOpacity="0" />
                 </linearGradient>
               </defs>
            </svg>

            {/* Glowing Abstract AI Core */}
            <motion.div 
               animate={{ 
                 scale: [1, 1.05, 1],
                 opacity: [0.6, 1, 0.6],
                 rotate: [0, 90, 180, 270, 360]
               }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute w-[320px] h-[320px] rounded-full border border-[#00F5FF]/10 border-dashed flex items-center justify-center z-0"
            >
               <div className="absolute w-[240px] h-[240px] rounded-full border border-[#7B61FF]/20 border-dotted opacity-50" />
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                 className="w-[140px] h-[140px] rounded-[100%] bg-gradient-to-tr from-[#00F5FF]/20 to-[#7B61FF]/20 backdrop-blur-[40px] shadow-[0_0_80px_rgba(123,97,255,0.4)]"
               />
            </motion.div>

            {/* Floating Glass Card 1: Roadmap Generated */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [-15, 0, -15], opacity: 1 }}
              transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 1 } }}
              className="absolute top-12 left-[-20px] w-64 rounded-[1.25rem] border border-white/10 bg-[#0A0E17]/60 p-4 backdrop-blur-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center gap-4 z-20"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00F5FF]/10 text-[#00F5FF] shadow-[0_0_15px_rgba(0,245,255,0.2)]">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] text-[#00F5FF] font-semibold uppercase tracking-wider mb-0.5">AI Engine</p>
                <p className="text-sm font-bold text-white tracking-tight">Coding Arena</p>
              </div>
              <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                <Sparkles className="h-3 w-3 text-emerald-400" />
              </div>
            </motion.div>

            {/* Floating Glass Card 2: Neural Insights */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [15, 0, 15], opacity: 1 }}
              transition={{ y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }, opacity: { duration: 1, delay: 0.2 } }}
              className="absolute top-36 right-[-30px] w-56 rounded-[1.25rem] border border-white/10 bg-[#0A0E17]/60 p-5 backdrop-blur-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] z-20"
            >
               <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                     <BookOpen className="h-3.5 w-3.5 text-[#7B61FF]" /> Mastery
                  </div>
                  <div className="text-xs text-white font-bold bg-white/10 px-2 py-0.5 rounded-full">92%</div>
               </div>
               <div className="flex gap-2 items-end h-10 w-full">
                  <motion.div initial={{ height: "40%" }} animate={{ height: ["40%", "70%", "40%"] }} transition={{ duration: 4, repeat: Infinity }} className="flex-1 bg-[#7B61FF]/30 rounded-t-sm" />
                  <motion.div initial={{ height: "60%" }} animate={{ height: ["60%", "90%", "60%"] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.2 }} className="flex-1 bg-[#7B61FF]/60 rounded-t-sm" />
                  <motion.div initial={{ height: "30%" }} animate={{ height: ["30%", "60%", "30%"] }} transition={{ duration: 5, repeat: Infinity, delay: 0.4 }} className="flex-1 bg-[#7B61FF]/30 rounded-t-sm" />
                  <motion.div initial={{ height: "90%" }} animate={{ height: ["90%", "100%", "90%"] }} transition={{ duration: 5.5, repeat: Infinity, delay: 0.6 }} className="flex-1 bg-[#00F5FF] shadow-[0_0_15px_rgba(0,245,255,0.4)] rounded-t-sm relative">
                     <span className="absolute -top-3 -right-1 flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5FF] opacity-50"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F5FF]"></span>
                     </span>
                  </motion.div>
               </div>
            </motion.div>

            {/* Floating Glass Card 3: Status Pulse */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [-10, 10, -10], opacity: 1 }}
              transition={{ y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }, opacity: { duration: 1, delay: 0.4 } }}
              className="absolute bottom-16 left-8 w-[280px] rounded-[1.25rem] border border-white/10 bg-[#0A0E17]/60 p-4 backdrop-blur-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-between z-20 group cursor-default hover:border-white/20 transition-colors"
            >
               <div className="flex items-center gap-3 w-full">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00F5FF]/20 to-[#7B61FF]/20 p-[1px]">
                   <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0A0E17]">
                     <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(0,245,255,0.8)] animate-pulse" />
                   </div>
                 </div>
                 <div className="flex-1">
                   <p className="text-sm font-bold text-white tracking-tight">Learning Environment Live</p>
                   <p className="text-xs text-muted-foreground mt-0.5">Optimizing problem sets...</p>
                 </div>
               </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;