import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, GraduationCap, ArrowLeft, Sparkles } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
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
      ? JSON.stringify({ name, email, password })
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
    <div className="min-h-screen w-full bg-[#070B14] text-white font-sans relative overflow-hidden">
      {/* Background — matching project's design system */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
        <div className="absolute top-[10%] left-[5%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[180px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] rounded-full bg-accent/8 blur-[200px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">Saarthi</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-8 pb-16">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-[0_0_20px_rgba(0,245,255,0.15)] mb-4">
            <Sparkles className="h-3 w-3" />
            {isSignUp ? "Join Saarthi" : "Welcome Back"}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-heading mb-3">
            {isSignUp ? "Create your " : "Sign in to "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              {isSignUp ? "Account" : "Saarthi"}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            {isSignUp
              ? "Start your personalized learning journey today"
              : "Continue your learning journey right where you left off"}
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="glass-panel p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Name Input (Sign Up only) */}
              {isSignUp && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="John Doe"
                    required={isSignUp}
                  />
                </div>
              )}

              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all pr-12"
                    placeholder="••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-white/20 bg-black/40 accent-primary"
                  />
                  <span className="text-xs text-muted-foreground">Remember me</span>
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                disabled={loading}
                type="submit"
                className="relative overflow-hidden w-full group/btn rounded-xl bg-gradient-to-r from-primary to-accent p-0.5 transition-all hover:scale-[1.02] active:scale-[0.98] mt-1 h-[48px] disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-10" />
                <div className="w-full h-full bg-gradient-to-r from-primary to-accent flex items-center justify-center rounded-[10px] z-20 relative px-4 text-sm font-bold text-primary-foreground shadow-[0_0_20px_rgba(0,245,255,0.3)] group-hover/btn:shadow-[0_0_40px_rgba(123,97,255,0.5)]">
                  {loading
                    ? (isSignUp ? "Creating Account..." : "Signing In...")
                    : (isSignUp ? "Create Account" : "Sign In")}
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-muted-foreground font-medium">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3.5 text-sm font-medium text-foreground transition-all hover:border-white/20 active:scale-[0.98] disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {isSignUp ? "Sign up with Google" : "Continue with Google"}
              </button>
            </form>

            {/* Toggle Sign Up / Login */}
            <p className="mt-7 text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary font-semibold hover:text-primary/80 transition-colors bg-transparent border-none p-0"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-muted-foreground/50 mt-6">
            By continuing, you agree to Saarthi's Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
