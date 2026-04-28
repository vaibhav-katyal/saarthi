import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Mail, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSent(true);
      toast.success("Reset link sent! Check your email.");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070B14] text-white font-sans flex overflow-hidden selection:bg-[#00F5FF]/30">
      {/* LEFT COLUMN - FORM */}
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
              Forgot Password?
            </h1>
            <p className="text-[15px] text-muted-foreground pr-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {sent ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 text-center py-8"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <Mail className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to <span className="text-[#00F5FF]">{email}</span>
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="mt-4 text-sm text-[#00F5FF] hover:underline"
              >
                Back to Login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

              <button
                disabled={loading}
                type="submit"
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] py-3.5 text-[15px] font-bold text-white shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Remember your password?{" "}
                <Link to="/login" className="text-[#00F5FF] font-medium hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN - VISUALS (Visible on LG and above) */}
      <div className="hidden lg:flex w-1/2 bg-[#0A0E17] relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] mix-blend-soft-light" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E17] via-transparent to-[#0A0E17] opacity-80 z-10" />
        <div className="absolute top-1/4 -right-10 w-96 h-96 bg-[#00F5FF]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -left-10 w-96 h-96 bg-[#7B61FF]/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-20 flex flex-col items-center text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#00F5FF]/20 to-[#7B61FF]/20 backdrop-blur-[40px] shadow-[0_0_80px_rgba(123,97,255,0.4)] mb-8"
          />
          <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
          <p className="text-muted-foreground max-w-sm">
            Don't worry, it happens. We'll help you get back into your account securely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

