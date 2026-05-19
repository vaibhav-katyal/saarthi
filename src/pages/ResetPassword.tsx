import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, GraduationCap, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      setVerifying(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Invalid or expired token");
        }

        setTokenValid(true);
      } catch (error: any) {
        toast.error(error.message || "Invalid or expired reset token");
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setResetSuccess(true);
      toast.success("Password reset successful!");
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
              Reset Password
            </h1>
            <p className="text-[15px] text-muted-foreground pr-4">
              Create a new password for your account.
            </p>
          </div>

          {verifying ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00F5FF] border-t-transparent" />
              <p className="text-sm text-muted-foreground">Verifying reset token...</p>
            </div>
          ) : !tokenValid ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 text-center py-8"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <Lock className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Invalid or Expired Link</h2>
                <p className="text-sm text-muted-foreground">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
              <button
                onClick={() => navigate("/forgot-password")}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] py-3.5 text-[15px] font-bold text-white shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                Request New Link
              </button>
            </motion.div>
          ) : resetSuccess ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 text-center py-8"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Password Reset Successful</h2>
                <p className="text-sm text-muted-foreground">
                  Your password has been updated. You can now log in with your new password.
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] py-3.5 text-[15px] font-bold text-white shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                Go to Login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-[#00F5FF]/50 focus:bg-[#00F5FF]/5 transition-all pr-12"
                    placeholder="New password"
                    required
                    minLength={6}
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

              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-[#00F5FF]/50 focus:bg-[#00F5FF]/5 transition-all pr-12"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors p-2"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] py-3.5 text-[15px] font-bold text-white shadow-[0_0_20px_rgba(0,245,255,0.2)] hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                {loading ? "Resetting..." : "Reset Password"}
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
          <h2 className="text-2xl font-bold text-white mb-2">Secure Your Account</h2>
          <p className="text-muted-foreground max-w-sm">
            Choose a strong password to keep your account safe and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

