"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated as apiIsAuthed, authAPI } from "@/lib/api";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Target,
  Zap,
  Lock,
  Smartphone,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
  Menu,
  X,
  Award,
} from "lucide-react";

type StoredUser = { name?: string; email?: string };

export default function ModernLandingPage() {
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userCount, setUserCount] = useState(0);

  // Auth state (reads the same keys used in lib/api.ts)
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  // Anchor helper: keep in-page links working even when not on "/"
  const homeAnchor = (hash: string) => (pathname === "/" ? hash : `/${hash}`);

  // Read auth from localStorage (same keys as lib/api.ts)
  useEffect(() => {
    const readAuth = () => {
      const token = localStorage.getItem("authToken"); // <- matches lib/api.ts
      setIsAuthed(!!token);

      const u = localStorage.getItem("user");
      try {
        setUser(u ? (JSON.parse(u) as StoredUser) : null);
      } catch {
        setUser(null);
      }
    };

    readAuth();

    // react to token/user changes from other tabs/windows
    const onStorage = (e: StorageEvent) => {
      if (e.key === "authToken" || e.key === "user") readAuth();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsAuthed(false);
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/"); // back to landing
  };

  // Scroll state for navbar styles
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animated counter
  useEffect(() => {
    let start = 0;
    const end = 12847;
    const duration = 2000;
    const step = end / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= end) {
        setUserCount(end);
        clearInterval(t);
      } else {
        setUserCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(t);
  }, []);

  const features = [
    { icon: BarChart3, title: "Real-Time Analytics", description: "Track your spending patterns with live updates and interactive charts", color: "from-blue-500 to-blue-600" },
    { icon: Target, title: "Smart Goals", description: "Set and achieve financial goals with AI-powered recommendations", color: "from-purple-500 to-purple-600" },
    { icon: PieChart, title: "Budget Management", description: "Create custom budgets and get alerts before overspending", color: "from-pink-500 to-pink-600" },
    { icon: Zap, title: "Instant Sync", description: "Connect your bank accounts for automatic transaction imports", color: "from-orange-500 to-orange-600" },
    { icon: Lock, title: "Bank-Level Security", description: "256-bit encryption keeps your financial data safe and private", color: "from-green-500 to-green-600" },
    { icon: Smartphone, title: "Mobile Ready", description: "Manage your finances anywhere with our responsive design", color: "from-indigo-500 to-indigo-600" },
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Small Business Owner", avatar: "👩‍💼", rating: 5, text: "FinTrack helped me save $3,000 in just 3 months! The insights are incredible." },
    { name: "Michael Chen", role: "Software Engineer", avatar: "👨‍💻", rating: 5, text: "Best financial app I've used. The dashboard is clean and the reports are detailed." },
    { name: "Emily Rodriguez", role: "Freelancer", avatar: "👩‍🎨", rating: 5, text: "Finally, a budgeting app that actually works! Love the goal tracking feature." },
  ];

  const stats = [
    { value: "$2.4M+", label: "Money Managed" },
    { value: userCount.toLocaleString() + "+", label: "Active Users" },
    { value: "4.9/5", label: "User Rating" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/90 backdrop-blur shadow-lg" : "bg-white/60 backdrop-blur"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="FinTrack Home">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinTrack
              </span>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-6">
              {/* Marketing anchors */}
              <Link href={homeAnchor("#features")} className="text-gray-700 hover:text-blue-600 font-medium">
                Features
              </Link>
              <Link href={homeAnchor("#pricing")} className="text-gray-700 hover:text-blue-600 font-medium">
                Pricing
              </Link>
              <Link href={homeAnchor("#testimonials")} className="text-gray-700 hover:text-blue-600 font-medium">
                Reviews
              </Link>

              {isAuthed ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                    Dashboard
                  </Link>
                  <Link href="/budgets" className="text-gray-700 hover:text-blue-600 font-medium">
                    Budgets
                  </Link>
                  <Link href="/reports" className="text-gray-700 hover:text-blue-600 font-medium">
                    Reports
                  </Link>
                  <Link href="/transactions" className="text-gray-700 hover:text-blue-600 font-medium">
                    Transactions
                  </Link>

                  <span className="mx-2 h-6 w-px bg-gray-200" aria-hidden />

                  <span className="text-sm text-gray-600">
                    {user?.name ? `Hi, ${user.name.split(" ")[0]}` : user?.email || ""}
                  </span>

                  <button
                    onClick={signOut}
                    className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium"
                    title="Sign out"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register?mode=signin"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register?mode=signup"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* MOBILE TOGGLER */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* MOBILE MENU */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200">
              <div className="flex flex-col gap-3">
                <Link href={homeAnchor("#features")} onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium">
                  Features
                </Link>
                <Link href={homeAnchor("#pricing")} onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium">
                  Pricing
                </Link>
                <Link href={homeAnchor("#testimonials")} onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium">
                  Reviews
                </Link>

                {isAuthed ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium">
                      Dashboard
                    </Link>
                    <Link href="/budgets" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium">
                      Budgets
                    </Link>
                    <Link href="/reports" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium">
                      Reports
                    </Link>
                    <Link href="/transactions" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium">
                      Transactions
                    </Link>
                    <button
                      onClick={signOut}
                      className="mt-2 px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 text-center hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register?mode=signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-center"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      href="/register?mode=signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 text-center hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-28 md:pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  Trusted by {userCount.toLocaleString()}+ users worldwide
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Take Control of Your
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Financial Future
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Track expenses, analyze spending patterns, and achieve your financial goals with our intelligent platform. Join thousands making smarter money decisions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register?mode=signup"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href={homeAnchor("#pricing")}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all"
                >
                  View Pricing
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Free 14-day trial</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 transform hover:scale-105 transition-transform duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">November Overview</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      On Track
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Balance", value: "$4,567", color: "from-blue-500 to-blue-600" },
                      { label: "Income", value: "$5,200", color: "from-green-500 to-green-600" },
                      { label: "Expenses", value: "$1,420", color: "from-red-500 to-red-600" },
                      { label: "Savings", value: "$3,780", color: "from-purple-500 to-purple-600" },
                    ].map((stat, idx) => (
                      <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white`}>
                        <div className="text-xs opacity-90 mb-1">{stat.label}</div>
                        <div className="text-xl font-bold">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="h-40 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-16 h-16 text-blue-600 opacity-50" />
                  </div>
                </div>
              </div>

              <div className="pointer-events-none">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Powerful features designed to make financial management effortless</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="scroll-mt-24 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h2>
            <p className="text-gray-600">Start free. Upgrade anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "$0", desc: "Track basics & explore features", cta: "Get Started", href: "/register?mode=signup" },
              { name: "Pro", price: "$9/mo", desc: "Budgets, goals & reports", cta: "Start Pro Trial", href: "/register?mode=signup" },
              { name: "Teams", price: "$19/mo", desc: "Collaboration & export", cta: "Contact Sales", href: "/register?mode=signup" },
            ].map((p) => (
              <div key={p.name} className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all">
                <div className="text-sm font-semibold text-blue-600 mb-1">{p.name}</div>
                <div className="text-4xl font-extrabold text-gray-900">{p.price}</div>
                <p className="text-gray-600 mt-2 mb-6">{p.desc}</p>
                <Link href={p.href} className="inline-flex px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg">
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="scroll-mt-24 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Loved by Thousands</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-600">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Finances?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of users who are already making smarter money decisions</p>
          <Link
            href="/register?mode=signup"
            className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-block"
          >
            Start Your Free Trial Today
          </Link>
          <p className="text-blue-100 mt-4 text-sm">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href={homeAnchor("#features")} className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href={homeAnchor("#pricing")} className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 FinTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
