import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (isSignUp && password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const endpoint = isSignUp
      ? `${API_BASE_URL}/auth/register`
      : `${API_BASE_URL}/auth/login`;

    const body = isSignUp
      ? JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
        })
      : JSON.stringify({
          email,
          password,
        });

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
        throw new Error(
          data.error ||
            (isSignUp
              ? "Registration failed"
              : "Login failed")
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      toast.success(
        isSignUp
          ? "Registration successful!"
          : "Login successful!"
      );

      navigate("/chat");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    tokenResponse: any
  ) => {
    setLoading(true);

    try {
      const userInfoRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );

      const userInfo = await userInfoRes.json();

      const response = await fetch(
        `${API_BASE_URL}/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: tokenResponse.access_token,
            userInfo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Google login failed"
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      toast.success("Google login successful!");

      navigate("/chat");
    } catch (error: any) {
      toast.error(
        error.message || "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () =>
      toast.error("Google login failed"),
  });

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-black">

      {/* LEFT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-black"
      >

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Glow */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 opacity-30"
        >
          <div className="absolute top-1/4 left-1/4 w-72 xl:w-96 h-72 xl:h-96 bg-white/5 rounded-full blur-3xl" />

          <div className="absolute bottom-1/4 right-1/4 w-72 xl:w-96 h-72 xl:h-96 bg-white/5 rounded-full blur-3xl" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-white w-full">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black shadow-lg"
            >
              <GraduationCap className="h-6 w-6" />
            </motion.div>

            <span className="text-2xl font-bold tracking-tight">
              Saarthi
            </span>
          </Link>

          {/* Hero */}
          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl xl:text-6xl font-bold leading-tight tracking-tight max-w-2xl">
              {isSignUp
                ? "Your AI-powered academic workspace."
                : "Welcome back to Saarthi."}
            </h1>

            <p className="text-base xl:text-lg text-gray-400 leading-relaxed max-w-xl">
              {isSignUp
                ? "Manage learning, streamline workflows, access smart tools, and stay ahead — all in one intelligent platform designed for modern students."
                : "Continue learning smarter with AI-assisted tools, organized resources, and a workspace built to help you focus, grow, and execute faster."}
            </p>
          </div>

          {/* Footer */}
          <div className="text-sm text-gray-500">
            © 2026 Saarthi. All rights reserved.
          </div>
        </div>
      </motion.div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center bg-gradient-to-b from-black via-zinc-950 to-black px-5 py-6 sm:px-8 md:px-10 lg:px-14">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="w-full max-w-md"
        >

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black shadow-lg">
              <GraduationCap className="h-6 w-6" />
            </div>

            <span className="text-2xl font-bold text-white">
              Saarthi
            </span>
          </div>

          <AnimatePresence mode="wait">

            <motion.div
              key={isSignUp ? "signup" : "login"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-3xl lg:text-[38px] font-bold text-white mb-2 tracking-tight leading-none whitespace-nowrap">
                  {isSignUp
                    ? "Let's Get You Onboard!"
                    : "Welcome Back!"}
                </h2>

                <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                  {isSignUp
                    ? "Your smarter workspace starts here."
                    : "Welcome back to your AI workspace."}
                </p>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">

                {/* Google */}
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={loading}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>

                  <span className="text-sm">
                    Google
                  </span>
                </button>

                {/* Github */}
                <button
                  type="button"
                  disabled={loading}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0112 6.84c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.56 1.41.21 2.45.11 2.71.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.82-4.57 5.08.36.32.68.95.68 1.92 0 1.38-.01 2.5-.01 2.84 0 .27.18.6.69.49A10.24 10.24 0 0022 12.22C22 6.58 17.52 2 12 2z"
                    />
                  </svg>

                  <span className="text-sm">GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>

                <div className="relative flex justify-center text-sm">
                  <span className="bg-black px-3 text-gray-500 font-medium">
                    OR
                  </span>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {isSignUp && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>

                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) =>
                          setFirstName(e.target.value)
                        }
                        placeholder="First Name"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300 ease-out hover:border-white/20 focus:scale-[1.01]"
                        required={isSignUp}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>

                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) =>
                          setLastName(e.target.value)
                        }
                        placeholder="Last Name"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300 ease-out hover:border-white/20 focus:scale-[1.01]"
                        // required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="saarthi@gmail.com"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300 ease-out hover:border-white/20 focus:scale-[1.01]"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      className="w-full px-4 py-2.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300 ease-out hover:border-white/20 focus:scale-[1.01]"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1.5"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        placeholder="Confirm password"
                        className="w-full px-4 py-2.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300 ease-out hover:border-white/20 focus:scale-[1.01]"
                        required={isSignUp}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1.5"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember */}
                {!isSignUp && (
                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) =>
                          setRememberMe(
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white focus:ring-offset-black cursor-pointer"
                      />

                      <label
                        htmlFor="remember"
                        className="ml-2.5 text-sm text-gray-400 cursor-pointer"
                      >
                        Remember me
                      </label>
                    </div>

                    <Link
                      to="/forgot-password"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-white hover:bg-gray-100 text-black font-bold text-base rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? isSignUp
                      ? "Creating Account..."
                      : "Signing In..."
                    : isSignUp
                    ? "Sign Up"
                    : "Sign In"}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-5 text-center text-sm">
                <span className="text-gray-500">
                  {isSignUp
                    ? "Already have an account? "
                    : "Don't have an account? "}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);

                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-white hover:text-gray-300 font-semibold transition-colors"
                >
                  {isSignUp
                    ? "Sign In"
                    : "Sign Up"}
                </button>
              </div>

            </motion.div>

          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;