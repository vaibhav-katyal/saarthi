import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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

      // Save token
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1A1A1E] p-4 sm:p-8">
      {/* Main Container */}
      <div className="w-full max-w-5xl h-[700px] flex flex-col md:flex-row bg-[#EBEBEB] rounded-[2rem] overflow-hidden shadow-2xl relative">

        {/* Left Side: Illustration */}
        <div className="hidden md:flex flex-1 items-end justify-center relative overflow-hidden">
          <svg className="w-full h-auto max-w-md pb-12" viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Purple Rectangle */}
            <rect x="70" y="20" width="120" height="330" fill="#6D39FF" />
            <circle cx="100" cy="65" r="7" fill="white" />
            <circle cx="100" cy="65" r="2.5" fill="#1A1A1E" />
            <circle cx="145" cy="65" r="7" fill="white" />
            <circle cx="145" cy="65" r="2.5" fill="#1A1A1E" />
            <rect x="120" y="55" width="5" height="40" fill="#1A1A1E" />

            {/* Black Rectangle */}
            <rect x="160" y="160" width="90" height="190" fill="#202124" />
            <circle cx="215" cy="210" r="9" fill="white" />
            <circle cx="215" cy="210" r="3" fill="#1A1A1E" />
            <circle cx="245" cy="210" r="9" fill="white" />
            <circle cx="245" cy="210" r="3" fill="#1A1A1E" />

            {/* Yellow Bird Shape */}
            <path d="M 230 350 L 230 250 A 55 55 0 0 1 340 250 L 340 350 Z" fill="#EAC118" />
            <circle cx="265" cy="235" r="3.5" fill="#1A1A1E" />
            <rect x="285" y="250" width="60" height="5" fill="#1A1A1E" />

            {/* Orange Half Circle */}
            <path d="M 10 350 A 130 130 0 0 1 270 350 Z" fill="#F78C3D" />
            <circle cx="110" cy="285" r="6" fill="#1A1A1E" />
            <circle cx="165" cy="285" r="6" fill="#1A1A1E" />
            {/* Smile */}
            <path d="M 130 305 Q 137.5 320 145 305 Z" fill="#1A1A1E" stroke="#1A1A1E" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[480px] bg-white h-full p-8 sm:p-12 md:p-16 flex flex-col justify-center rounded-[2rem] md:rounded-l-none">
          <div className="w-full max-w-sm mx-auto flex flex-col items-center">

            {/* Logo */}
            <div className="mb-8">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" fill="#1A1A1E" />
              </svg>
            </div>

            {/* Headers */}
            <h1 className="text-3xl font-bold text-[#1A1A1E] mb-2 font-sans tracking-tight">
              {isSignUp ? "Create Account" : "Welcome back!"}
            </h1>
            <p className="text-sm text-gray-500 mb-10">
              {isSignUp ? "Please fill in your details to join" : "Please enter your details"}
            </p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">

              {/* Name Input (Only on Sign Up) */}
              {isSignUp && (
                <div className="relative flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-600">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pb-2 text-sm text-[#1A1A1E] bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:outline-none focus:border-[#1A1A1E] transition-colors"
                    placeholder="John Doe"
                    required={isSignUp}
                  />
                </div>
              )}

              {/* Email Input */}
              <div className="relative flex flex-col gap-2 mt-2">
                <label className="text-xs font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pb-2 text-sm text-[#1A1A1E] bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:outline-none focus:border-[#1A1A1E] transition-colors"
                  placeholder="anna@example.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative flex flex-col gap-2 mt-2">
                <label className="text-xs font-medium text-gray-600">Password</label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pb-2 text-sm text-[#1A1A1E] bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:outline-none focus:border-[#1A1A1E] transition-colors pr-10"
                    placeholder="••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 bottom-2 text-gray-400 hover:text-gray-600 p-0 flex items-center justify-center bg-transparent border-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" className="rounded-sm w-4 h-4 border-gray-300 data-[state=checked]:bg-[#1A1A1E] data-[state=checked]:border-[#1A1A1E]" />
                  <label htmlFor="remember" className="text-xs text-gray-600 cursor-pointer select-none">
                    Remember for 30 days
                  </label>
                </div>
                {!isSignUp && (
                  <button type="button" className="text-xs text-gray-500 hover:text-[#1A1A1E] transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <Button disabled={loading} type="submit" className="w-full mt-4 bg-[#1A1A1E] hover:bg-black text-white h-12 rounded-xl text-sm font-medium transition-transform active:scale-[0.98]">
                {loading ? (isSignUp ? "Creating Account..." : "Logging In...") : (isSignUp ? "Sign Up" : "Log In")}
              </Button>

              {/* Google Login */}
              <Button type="button" variant="outline" className="w-full mt-1 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#1A1A1E] border-none h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {isSignUp ? "Sign up with Google" : "Log in with Google"}
              </Button>
            </form>

            {/* Toggle Sign Up / Login */}
            <p className="mt-8 text-xs text-gray-500">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#1A1A1E] font-medium hover:underline bg-transparent border-none p-0"
              >
                {isSignUp ? "Log In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
