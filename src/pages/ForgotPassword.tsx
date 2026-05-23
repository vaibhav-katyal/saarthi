import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSent(true);
      toast.success("Reset link sent successfully");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden">

      {/* LEFT SIDE */}
      <div className="relative flex w-full lg:w-1/2 min-h-screen flex-col bg-[#050505] border-r border-white/5 px-5 sm:px-10 lg:px-20">

        {/* animated background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <motion.div
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-32 -left-32 h-[350px] w-[350px] rounded-full bg-white/[0.03] blur-3xl"
          />

          <motion.div
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 right-0 h-[260px] w-[260px] rounded-full bg-white/[0.02] blur-3xl"
          />
        </div>

        {/* TOP BAR */}
        <div className="relative z-20 flex items-center justify-between py-5 sm:py-6">

          <Link
            to="/login"
            className="group flex items-center gap-2 text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

            <span className="text-sm font-medium">
              Back to Login
            </span>
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl lg:hidden">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* CENTER CONTENT */}
        <div className="relative z-20 flex flex-1 items-center justify-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-[420px]"
          >

            <AnimatePresence mode="wait">

              {!sent ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >

                  {/* HEADER */}
                  <div className="mb-8 sm:mb-10">

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.1,
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                      className="mb-5 inline-flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl"
                    >
                      <Mail className="h-6 w-6 text-white" />
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.15,
                        duration: 0.6,
                      }}
                      className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05] text-white mb-4"
                    >
                      Forgot
                      <br />
                      Password?
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.22,
                        duration: 0.6,
                      }}
                      className="max-w-md text-sm sm:text-[15px] leading-relaxed text-zinc-400"
                    >
                      Enter your registered email address and we'll send
                      you a secure password reset link.
                    </motion.p>
                  </div>

                  {/* FORM */}
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.28,
                      duration: 0.6,
                    }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                  >

                    {/* EMAIL */}
                    <div className="flex flex-col gap-2">

                      <label className="text-sm font-medium text-zinc-300">
                        Email Address
                      </label>

                      <div className="relative">

                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="Enter your email"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[15px] text-white outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/[0.05] focus:scale-[1.01] pr-12"
                        />

                        <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                      </div>
                    </div>

                    {/* BUTTON */}
                    <motion.button
                      whileHover={{
                        scale: 1.015,
                      }}
                      whileTap={{
                        scale: 0.985,
                      }}
                      disabled={loading}
                      type="submit"
                      className="mt-2 w-full rounded-2xl bg-white py-3.5 text-[15px] font-semibold text-black transition-all duration-300 hover:bg-zinc-200 disabled:opacity-50"
                    >
                      {loading
                        ? "Sending Reset Link..."
                        : "Send Reset Link"}
                    </motion.button>

                    {/* LOGIN */}
                    <p className="mt-4 text-center text-sm text-zinc-500">
                      Remember your password?{" "}
                      <Link
                        to="/login"
                        className="font-medium text-white transition-colors hover:text-zinc-300"
                      >
                        Log in
                      </Link>
                    </p>
                  </motion.form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex flex-col items-center text-center"
                >

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.1,
                      duration: 0.5,
                    }}
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
                  >
                    <ShieldCheck className="h-9 w-9 text-white" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.18,
                    }}
                    className="mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-white"
                  >
                    Check Your Inbox
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.24,
                    }}
                    className="mb-7 max-w-sm text-sm sm:text-[15px] leading-relaxed text-zinc-400"
                  >
                    We've sent a secure password reset link to
                    <span className="font-medium text-white">
                      {" "}
                      {email}
                    </span>
                  </motion.p>

                  <motion.button
                    whileHover={{
                      scale: 1.015,
                    }}
                    whileTap={{
                      scale: 0.985,
                    }}
                    onClick={() => navigate("/login")}
                    className="w-full rounded-2xl bg-white py-3.5 text-[15px] font-semibold text-black transition-all duration-300 hover:bg-zinc-200"
                  >
                    Return to Login
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative hidden lg:flex w-1/2 items-center justify-center overflow-hidden bg-[#090909]">

        {/* radial lights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_30%)]" />

        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-20 max-w-lg px-10 text-center"
        >

          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 2, 0, -2, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-8 flex justify-center"
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl">
              <Mail className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <h2 className="mb-5 text-5xl font-bold tracking-tight leading-[1.05] text-white">
            Recover Your
            <br />
            Account
          </h2>

          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-zinc-400">
            Reset your password securely and regain access to your
            Saarthi workspace in just a few steps.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;