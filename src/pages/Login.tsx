import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, GraduationCap, Github } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const endpoint = isSignUp
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

      const body = isSignUp
        ? JSON.stringify({ name: name.trim(), email, password })
        : JSON.stringify({ email, password });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isSignUp ? "Registration failed" : "Login failed"));
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(isSignUp ? "Account created successfully!" : "Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      setErrorShake(true);
      setErrorMessage(error.message || "An error occurred");
      setTimeout(() => setErrorShake(false), 500); // reset shake
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoRes.json();

      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: tokenResponse.access_token, userInfo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Google auth failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Authentication successful!");
      navigate("/dashboard");
    } catch (error: any) {
      setErrorShake(true);
      setErrorMessage(error.message || "Authentication failed");
      setTimeout(() => setErrorShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setErrorShake(true);
      setErrorMessage("Google login failed");
      setTimeout(() => setErrorShake(false), 500);
    },
  });

  return (
    <div className="flex min-h-screen w-full bg-[#0A0A0C] text-neutral-200 font-sans selection:bg-[#00F5FF]/20 selection:text-white relative">
      
      {/* --- LEFT PANEL (BRANDING) --- */}
      <div className="hidden lg:flex w-[45%] xl:w-[42%] relative flex-col justify-between p-12 overflow-hidden bg-[#0A0C10] border-r border-white/5">
        
        {/* Soft Animated Background Gradients & Mesh */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-soft-light pointer-events-none" />
        
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-[#00F5FF]/10 blur-[130px] rounded-full pointer-events-none mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] -right-[10%] w-[80%] h-[80%] bg-[#7B61FF]/10 blur-[140px] rounded-full pointer-events-none mix-blend-screen" 
        />
        
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <GraduationCap className="w-7 h-7 text-[#00F5FF]" />
          <span className="font-semibold text-xl tracking-tight text-white">Saarthi</span>
        </div>

        {/* Center Tagline & Illustration */}
        <div className="relative z-10 my-auto w-full max-w-[440px]">
          {/* Faint depth glow behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00F5FF]/5 blur-[80px] rounded-full pointer-events-none" />

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl lg:text-[44px] xl:text-[50px] font-semibold tracking-[-0.03em] leading-[1.15] text-white mb-10 relative z-10"
          >
            Your preparation,<br />
            <span className="text-neutral-500">structured intelligently.</span>
          </motion.h1>

          {/* Abstract Faint UI Preview (Floating Animation) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: [0, -12, 0] }}
            transition={{ 
              opacity: { duration: 1, delay: 0.2, ease: "easeOut" },
              y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
            }}
            className="w-full h-[240px] rounded-3xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-3xl p-6 flex flex-col gap-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
             <div className="w-1/3 h-3 rounded-full bg-white/[0.08]" />
             
             <div className="w-full flex-1 bg-white/[0.03] rounded-2xl border border-white/[0.04] flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F5FF]/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                 <div className="w-12 h-1 bg-white/10 rounded-full" />
             </div>
             <div className="w-3/4 flex-1 bg-white/[0.03] rounded-2xl border border-white/[0.04] flex items-center px-5">
                 <div className="w-24 h-1 bg-white/10 rounded-full" />
             </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-6">
          <p className="text-[13px] font-medium text-neutral-600 tracking-tight">© {new Date().getFullYear()} Saarthi Platform</p>
        </div>
      </div>

      {/* --- RIGHT PANEL (FORM) --- */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-[#00F5FF]" />
          <span className="font-semibold text-lg tracking-tight text-white">Saarthi</span>
        </div>
        
        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] rounded-3xl bg-[#0F1115]/60 backdrop-blur-3xl border border-white/[0.06] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] p-8 sm:p-10 relative mt-16 lg:mt-0"
        >
          {/* Back button integrated into form card */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-white transition-colors duration-200 mb-6 group uppercase tracking-widest">
             <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Home
          </Link>

          {/* Header */}
          <div className="mb-8">
             <AnimatePresence mode="wait">
               <motion.h2 
                 key={isSignUp ? "create" : "login"}
                 initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                 className="text-[28px] font-semibold text-white tracking-tight mb-2"
               >
                 {isSignUp ? "Create Account" : "Log In"}
               </motion.h2>
             </AnimatePresence>
             <p className="text-[14.5px] text-neutral-400 font-medium tracking-tight">
               {isSignUp ? "Let's get started." : "Welcome back to your workspace."}
             </p>
          </div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="flex flex-col gap-4"
            animate={errorShake ? { x: [-4, 4, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
             <AnimatePresence>
               {isSignUp && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }} 
                   animate={{ opacity: 1, height: 'auto' }} 
                   exit={{ opacity: 0, height: 0 }}
                   className="overflow-hidden px-[4px] -mx-[4px]"
                 >
                   <div className="pt-1 pb-1">
                     <div className="relative group">
                       <input
                         type="text"
                         id="name"
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="peer w-full h-[52px] bg-white/[0.02] border border-white/[0.06] rounded-[16px] px-4 pt-4 pb-1 text-[14.5px] text-white placeholder-transparent outline-none focus:bg-white/[0.04] focus:border-transparent focus:ring-[3px] focus:ring-[#00F5FF]/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                         placeholder="Your Name"
                         required={isSignUp}
                       />
                       <label 
                         htmlFor="name"
                         className={`absolute left-4 text-neutral-500 transition-all duration-300 pointer-events-none ${name ? 'top-[8px] text-[10px] font-medium text-neutral-400' : 'top-[16px] text-[14.5px]'} peer-focus:top-[8px] peer-focus:text-[10px] peer-focus:text-[#00F5FF]/90 peer-focus:font-medium`}
                       >
                         Full Name
                       </label>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="relative group">
               <input
                 type="email"
                 id="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="peer w-full h-[52px] bg-white/[0.02] border border-white/[0.06] rounded-[16px] px-4 pt-4 pb-1 text-[14.5px] text-white placeholder-transparent outline-none focus:bg-white/[0.04] focus:border-transparent focus:ring-[3px] focus:ring-[#00F5FF]/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                 placeholder="Email Address"
                 required
               />
               <label 
                 htmlFor="email"
                 className={`absolute left-4 text-neutral-500 transition-all duration-300 pointer-events-none ${email ? 'top-[8px] text-[10px] font-medium text-neutral-400' : 'top-[16px] text-[14.5px]'} peer-focus:top-[8px] peer-focus:text-[10px] peer-focus:text-[#00F5FF]/90 peer-focus:font-medium`}
               >
                 Email Address
               </label>
             </div>

             <div className="relative group mb-2 mt-1">
               <div className="relative">
                 <input
                   type={showPassword ? "text" : "password"}
                   id="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="peer w-full h-[52px] bg-white/[0.02] border border-white/[0.06] rounded-[16px] px-4 pr-11 pt-4 pb-1 text-[14.5px] text-white placeholder-transparent outline-none focus:bg-white/[0.04] focus:border-transparent focus:ring-[3px] focus:ring-[#00F5FF]/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                   placeholder="Password"
                   required
                 />
                 <label 
                   htmlFor="password"
                   className={`absolute left-4 text-neutral-500 transition-all duration-300 pointer-events-none ${password ? 'top-[8px] text-[10px] font-medium text-neutral-400' : 'top-[16px] text-[14.5px]'} peer-focus:top-[8px] peer-focus:text-[10px] peer-focus:text-[#00F5FF]/90 peer-focus:font-medium`}
                 >
                   Password
                 </label>
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                 >
                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
             </div>

             {/* Error Message */}
             <AnimatePresence>
               {errorMessage && (
                 <motion.p 
                   initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                   className="text-[13px] text-red-400 font-medium bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl"
                 >
                   {errorMessage}
                 </motion.p>
               )}
             </AnimatePresence>

             {/* Submit */}
             <button
               type="submit"
               disabled={loading}
               className="group relative w-full h-[48px] mt-2 rounded-[14px] text-[14.5px] font-semibold tracking-tight text-black bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] hover:brightness-110 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:brightness-100 flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(0,245,255,0.2)]"
             >
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
               <span className="relative flex items-center justify-center gap-2">
                 {loading ? (
                   <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                 ) : (
                   isSignUp ? "Create account" : "Sign in"
                 )}
               </span>
             </button>
          </motion.form>

          <p className="mt-8 text-center text-[14px] text-neutral-400 font-medium tracking-tight">
             {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
             <button onClick={() => { setIsSignUp(!isSignUp); setErrorMessage(""); }} className="text-white hover:text-[#00F5FF] transition-colors ml-1 font-semibold">
               {isSignUp ? "Log in" : "Sign up"}
             </button>
          </p>

          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-[1px] bg-white/[0.04]" />
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em]">or continue with</span>
            <div className="flex-1 h-[1px] bg-white/[0.04]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
               type="button"
               onClick={() => googleLogin()}
               disabled={loading}
               className="h-[44px] flex items-center justify-center gap-2 rounded-[12px] border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.1] text-[13.5px] font-medium text-white transition-all duration-200 active:scale-[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
             >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
             </button>
             <button 
               type="button"
               disabled={loading}
               onClick={() => toast.info("Github login coming soon!")}
               className="h-[44px] flex items-center justify-center gap-2 rounded-[12px] border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.1] text-[13.5px] font-medium text-white transition-all duration-200 active:scale-[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
             >
                <Github className="w-[17px] h-[17px]" />
                GitHub
             </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;