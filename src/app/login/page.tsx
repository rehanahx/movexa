"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const { user, login } = useAuth();

  // If already logged in, redirect accordingly
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setErrorMessage(result.message);
        setIsSubmitting(false);
        return;
      }

      // Check role and redirect
      if (result.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail("admin@gamil.com");
    setPassword("admin123");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#f5f6f8]">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Cinematic Visual */}
        <div className="relative hidden lg:flex lg:col-span-5 bg-neutral-950 text-white flex-col justify-between p-10 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/login-bg.jpg"
              alt="Movexa Cinema"
              fill
              priority
              className="object-cover object-center filter contrast-110 brightness-95"
            />
            {/* Dark vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
          </div>

          {/* Top Brand */}
          <div className="relative z-10">
            <span className="text-sm font-bold tracking-[0.35em] text-white uppercase font-sans">
              MOVEXA
            </span>
          </div>

          {/* Bottom Heading & Description */}
          <div className="relative z-10 space-y-3">
            <div className="w-10 h-0.5 bg-white/80" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight font-sans">
              More Movies. More Moments.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-sm font-light">
              Your favorite movies, just a click away. Book tickets, explore cinemas, and enjoy the ultimate big screen experience.
            </p>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white">
          <div>
            {/* Top Right Tagline */}
            <div className="flex items-center justify-between sm:justify-end mb-6 text-xs text-neutral-400 font-medium">
              <span className="lg:hidden text-xs font-bold tracking-[0.2em] text-black uppercase">
                MOVEXA
              </span>
              <span>Your Cinema, Your Seat</span>
            </div>

            {/* Header Titles */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-sans flex items-center gap-2">
                <span>Welcome Back</span>
                <span className="inline-block">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Login to your Movexa account to reserve tickets
              </p>
            </div>

            {/* Admin Quick Mock Banner */}
            <div className="mb-6 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-medium">
                <ShieldCheck size={18} className="text-amber-600 shrink-0" />
                <span>
                  Admin Demo: <strong className="font-mono">admin@gamil.com</strong> / <strong className="font-mono">admin123</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleFillAdmin}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md text-[11px] transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                Auto Fill
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-neutral-700 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-neutral-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me option */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-700 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 accent-neutral-900 cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-[#111827] hover:bg-black text-white text-sm font-semibold rounded-lg shadow-xs hover:shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Switch to Register */}
          <div className="pt-6 mt-6 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-neutral-900 hover:underline underline-offset-4"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
