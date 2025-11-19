// app/register/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authAPI, getToken } from "@/lib/api";
import {
  DollarSign, Mail, Lock, User, Eye, EyeOff, ArrowRight,
  CheckCircle, AlertCircle, Chrome, Github, Apple
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // ✅ Safely derive initial mode (avoid "'sp' is possibly 'null'")
  const initialMode: "signin" | "signup" = useMemo(() => {
    const value =
      sp?.get("mode") ??
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("mode")
        : null);
    return value === "signup" ? "signup" : "signin";
  }, [sp]);

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const isLogin = mode === "signin";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // If already authed, go to app
  useEffect(() => {
    if (getToken()) router.replace("/dashboard");
  }, [router]);

  // Keep URL in sync when toggling tabs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    search.set("mode", isLogin ? "signin" : "signup");
    const url = `${window.location.pathname}?${search.toString()}`;
    window.history.replaceState({}, "", url);
  }, [isLogin]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isLogin && !form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!emailRe.test(form.email)) next.email = "Please enter a valid email";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters";
    if (!isLogin && form.password !== form.confirmPassword)
      next.confirmPassword = "Passwords do not match";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      if (isLogin) {
        await authAPI.login({ email: form.email, password: form.password });
      } else {
        await authAPI.register({ name: form.name.trim(), email: form.email, password: form.password });
      }
      router.replace("/dashboard");
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, _api: err?.message || "Something went wrong" }));
    } finally {
      setIsLoading(false);
    }
  };

  const strengthInfo = useMemo(() => {
    const p = form.password || "";
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    if (!p) return { strength: 0, label: "", color: "" };
    if (s <= 2) return { strength: s, label: "Weak", color: "bg-red-500" };
    if (s <= 3) return { strength: s, label: "Fair", color: "bg-yellow-500" };
    if (s <= 4) return { strength: s, label: "Good", color: "bg-blue-500" };
    return { strength: s, label: "Strong", color: "bg-green-500" };
  }, [form.password]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left / Brand */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 text-gray-900">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FinTrack</span>
          </Link>

          <div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">Take Control of Your Financial Future</h1>
            <p className="text-lg text-gray-600 leading-relaxed">Join thousands of users who are already making smarter money decisions.</p>
          </div>

          <div className="space-y-3">
            {[
              "Track expenses automatically",
              "Set and achieve financial goals",
              "Get AI-powered insights",
              "Bank-level security guaranteed",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right / Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FinTrack</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${!isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Sign Up
            </button>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">{isLogin ? "Welcome back!" : "Create your account"}</h2>
          <p className="text-gray-600 mb-6">{isLogin ? "Sign in to continue to your dashboard" : "Start your 14-day free trial, no credit card required"}</p>

          {errors._api && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{errors._api}</span>
            </div>
          )}

          {/* Social placeholders */}
          <div className="space-y-3 mb-8">
            <button type="button" className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                <Github className="w-5 h-5" /> GitHub
              </button>
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                <Apple className="w-5 h-5" /> Apple
              </button>
            </div>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="John Doe"
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.name ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors.name && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-colors ${
                    errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                  }`}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none transition-colors ${
                    errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.password}</p>}

              {!isLogin && form.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span
                      className={`text-xs font-semibold ${
                        strengthInfo.label === "Strong"
                          ? "text-green-600"
                          : strengthInfo.label === "Good"
                          ? "text-blue-600"
                          : strengthInfo.label === "Fair"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className={`h-1.5 flex-1 rounded-full transition-colors ${level <= strengthInfo.strength ? strengthInfo.color : "bg-gray-200"}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={onChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.confirmPassword ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.confirmPassword}</p>}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-2">
                <input type="checkbox" required className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">
                  I agree to the <a href="#" className="text-blue-600 hover:underline font-medium">Terms of Service</a> and{" "}
                  <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don’t have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setMode(isLogin ? "signup" : "signin");
                  setErrors({});
                  setForm({ name: "", email: "", password: "", confirmPassword: "" });
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {isLogin ? "Sign up for free" : "Sign in"}
              </button>
            </p>
          </div>

          {!isLogin && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">14-day free trial • No credit card required • Cancel anytime</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
