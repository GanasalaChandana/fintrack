﻿"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Shield,
  Zap,
  TrendingUp,
  Upload,
  Bell,
  Target,
  RefreshCw,
  ChevronDown,
  ArrowRight,
  Check,
  X,
  Menu,
  Lock,
  FileText,
  Brain,
  DollarSign,
  PieChart,
  CreditCard,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  const faqs = [
    {
      q: "Is my financial data secure?",
      a: "All data is encrypted in transit with TLS and at rest with AES-256. We never store your bank credentials. Your CSV data is processed and stored only on our servers.",
    },
    {
      q: "Which banks and file formats do you support?",
      a: "We support CSV exports from all major banks including Chase, Bank of America, Wells Fargo, Citi, and 100+ others. As long as your export has Date, Amount, and Description columns, we can import it.",
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes. Cancel anytime from your account settings. You keep access until the end of your billing period. No cancellation fees.",
    },
    {
      q: "Can I import historical transactions?",
      a: "Yes — import as many historical transactions as your bank provides. Most banks let you export 12-24 months of history.",
    },
    {
      q: "Is there a mobile app?",
      a: "The web app is fully responsive and works great on mobile. Native iOS and Android apps are on our roadmap.",
    },
  ];

  const features = [
    {
      icon: BarChart3,
      title: "Real-Time Dashboard",
      desc: "Monitor income, expenses, and savings with live charts. See your financial health at a glance the moment you log in.",
      color: "#6366f1",
    },
    {
      icon: Upload,
      title: "Smart CSV Import",
      desc: "Import transactions from any bank in seconds. Automatic categorization handles the tedious work for you.",
      color: "#10b981",
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      desc: "Generate tax-ready reports with custom date ranges. Export to PDF or Excel in one click.",
      color: "#f59e0b",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      desc: "256-bit SSL encryption for all data. We never store your bank credentials or access your accounts.",
      color: "#3b82f6",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      desc: "Get notified when you're approaching budget limits, have unusual spending, or bills are due.",
      color: "#ec4899",
    },
    {
      icon: Target,
      title: "Budget & Goals",
      desc: "Set monthly budgets by category and savings goals. Visual progress bars keep you on track.",
      color: "#8b5cf6",
    },
    {
      icon: RefreshCw,
      title: "Recurring Tracking",
      desc: "Automatically detect subscriptions and recurring payments. Find forgotten charges fast.",
      color: "#06b6d4",
    },
    {
      icon: Brain,
      title: "AI Insights",
      desc: "Get personalized recommendations based on your spending patterns and financial goals.",
      color: "#f97316",
    },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#0a0f1e", color: "#e2e8f0", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,wght@0,300;0,700;0,900;1,300&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hero-glow { background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.25) 0%, transparent 60%); }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none;
          padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center;
          gap: 8px; font-family: inherit; text-decoration: none;
        }
        .btn-primary:hover { background: linear-gradient(135deg, #818cf8, #6366f1); transform: translateY(-1px); box-shadow: 0 8px 25px rgba(99,102,241,0.4); }
        .btn-ghost {
          background: transparent; color: #94a3b8; border: 1px solid rgba(148,163,184,0.2);
          padding: 13px 24px; border-radius: 10px; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease; font-family: inherit;
        }
        .btn-ghost:hover { color: #e2e8f0; border-color: rgba(148,163,184,0.4); background: rgba(255,255,255,0.05); }
        .nav-link { color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.15s; cursor: pointer; }
        .nav-link:hover { color: #e2e8f0; }
        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
          color: #a5b4fc; padding: 5px 12px; border-radius: 100px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
        }
        .grid-lines {
          background-image: linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 28px; }
        .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 28px; }
        .pricing-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 36px; }
        .pricing-card.featured { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.3); }
        .step-number {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3);
          color: #a5b4fc; font-weight: 700; font-size: 16px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .faq-item { border-bottom: 1px solid rgba(255,255,255,0.06); overflow: hidden; }
        .faq-btn {
          width: 100%; background: none; border: none; color: #e2e8f0; font-size: 16px;
          font-weight: 500; padding: 22px 0; text-align: left; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: inherit;
        }
        .faq-answer { color: #94a3b8; font-size: 15px; line-height: 1.7; padding-bottom: 20px; max-width: 680px; }
        @media (max-width: 768px) {
          .hero-title { font-size: 42px !important; }
          .hide-mobile { display: none !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: 1fr 1fr !important; }
        }
        .mobile-menu-btn { display: none; }
        @media (max-width: 768px) { .mobile-menu-btn { display: flex; } }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(10,15,30,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.3s ease",
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366f1, #4f46e5)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={18} color="white" />
            </div>
            <span style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>FinTrack</span>
          </div>

          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a className="nav-link" href="#features">Features</a>
            <a className="nav-link" href="#how-it-works">How it works</a>
            <a className="nav-link" href="#pricing">Pricing</a>
            <a className="nav-link" href="#faq">FAQ</a>
          </div>

          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn-ghost" style={{ padding: "9px 18px", fontSize: 14 }} onClick={() => router.push("/login?mode=signin")}>
              Log in
            </button>
            <button className="btn-primary" style={{ padding: "9px 18px", fontSize: 14 }} onClick={() => router.push("/login?mode=signup")}>
              Get started free
            </button>
          </div>

          <button
            className="mobile-menu-btn"
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {menuOpen && (
          <div style={{ background: "rgba(10,15,30,0.98)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px 24px" }}>
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a key={item.label} href={item.href} className="nav-link"
                style={{ display: "block", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 16 }}
                onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <button className="btn-ghost" style={{ width: "100%" }} onClick={() => router.push("/login?mode=signin")}>Log in</button>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => router.push("/login?mode=signup")}>Get started free</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="hero-glow grid-lines" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", textAlign: "center" }}>
          <div className="badge" style={{ marginBottom: 28, display: "inline-flex" }}>
            <Zap size={12} />
            Smart Financial Management
          </div>

          <h1 className="hero-title" style={{
            fontFamily: "Fraunces, serif", fontSize: 72, fontWeight: 900,
            lineHeight: 1.05, letterSpacing: "-0.02em", color: "#f1f5f9",
            maxWidth: 820, margin: "0 auto 24px",
          }}>
            Finally understand{" "}
            <em style={{ color: "#818cf8", fontStyle: "italic" }}>where your money goes</em>
          </h1>

          <p style={{ fontSize: 19, color: "#94a3b8", lineHeight: 1.65, maxWidth: 560, margin: "0 auto 40px", fontWeight: 400 }}>
            Import your bank transactions, track spending by category, set budgets, and get AI-powered insights — all in one place.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <button className="btn-primary" style={{ fontSize: 16, padding: "15px 32px" }} onClick={() => router.push("/login?mode=signup")}>
              Start for free <ArrowRight size={16} />
            </button>
            <button className="btn-ghost" style={{ fontSize: 16, padding: "15px 32px" }} onClick={() => router.push("/login?mode=signin")}>
              Sign in
            </button>
          </div>

          <p style={{ fontSize: 13, color: "#64748b" }}>No credit card required · Import from any bank · Cancel anytime</p>

          {/* Mock dashboard preview */}
          <div style={{
            marginTop: 64, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 2,
            maxWidth: 900, margin: "64px auto 0",
            boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
          }}>
            <div style={{ background: "rgba(15,23,42,0.8)", borderRadius: 18, padding: "24px" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {["#ef4444", "#f59e0b", "#10b981"].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { label: "Total Income", value: "$4,850", change: "+8.3%", up: true },
                  { label: "Total Expenses", value: "$2,390", change: "-3.2%", up: false },
                  { label: "Net Savings", value: "$2,460", change: "+18%", up: true },
                  { label: "Budget Used", value: "68%", change: "on track", up: true },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "16px 14px" }}>
                    <p style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 500 }}>{s.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", fontFamily: "Fraunces, serif" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: s.up ? "#10b981" : "#f59e0b", marginTop: 4, fontWeight: 500 }}>{s.change}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16, height: 100, display: "flex", alignItems: "center", gap: 12 }}>
                  <PieChart size={28} color="#6366f1" />
                  <div>
                    <p style={{ fontSize: 12, color: "#64748b" }}>Top category</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>Food & Dining · $680</p>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16, height: 100, display: "flex", alignItems: "center", gap: 12 }}>
                  <TrendingUp size={28} color="#10b981" />
                  <div>
                    <p style={{ fontSize: 12, color: "#64748b" }}>vs last month</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#10b981" }}>Spending down 12%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="badge" style={{ marginBottom: 16, display: "inline-flex" }}>Get started in minutes</div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 44, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              Up and running in 3 steps
            </h2>
          </div>
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { n: "1", icon: Lock, title: "Create your account", desc: "Sign up in 30 seconds. No credit card required. Just your email and a password.", color: "#6366f1" },
              { n: "2", icon: Upload, title: "Import your transactions", desc: "Export a CSV from your bank and upload it. We parse, categorize, and organize everything automatically.", color: "#10b981" },
              { n: "3", icon: Brain, title: "Get insights", desc: "View your spending by category, set budgets, and let AI surface patterns you'd never notice manually.", color: "#f59e0b" },
            ].map((step) => (
              <div key={step.n} className="feature-card card-hover" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className="step-number">{step.n}</div>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${step.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <step.icon size={20} color={step.color} />
                  </div>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 600, color: "#f1f5f9" }}>{step.title}</h3>
                <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 24px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="badge" style={{ marginBottom: 16, display: "inline-flex" }}>Everything you need</div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 44, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 16 }}>
              Built for real financial clarity
            </h2>
            <p style={{ fontSize: 17, color: "#64748b", maxWidth: 480, margin: "0 auto" }}>
              Every feature designed to save you time and help you make better money decisions.
            </p>
          </div>
          <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} className="feature-card card-hover">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div className="badge" style={{ marginBottom: 20, display: "inline-flex" }}><Shield size={12} /> Security first</div>
              <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 42, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 20, lineHeight: 1.1 }}>
                Your data stays <em style={{ color: "#818cf8", fontStyle: "italic" }}>yours</em>
              </h2>
              <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, marginBottom: 32 }}>
                We use bank-level encryption for all data in transit and at rest. We never store your bank credentials, never access your accounts directly, and never sell your data.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {["256-bit AES encryption at rest", "TLS 1.3 for all data in transit", "We never store bank credentials", "Your data is never sold or shared"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={12} color="#10b981" />
                    </div>
                    <span style={{ fontSize: 15, color: "#94a3b8" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { icon: Shield, label: "256-bit Encryption", sub: "All data encrypted at rest", color: "#6366f1" },
                { icon: Lock, label: "No Credentials", sub: "We never see your passwords", color: "#10b981" },
                { icon: FileText, label: "Data Privacy", sub: "Never sold to third parties", color: "#f59e0b" },
                { icon: RefreshCw, label: "Regular Backups", sub: "Your data is always safe", color: "#3b82f6" },
              ].map((s) => (
                <div key={s.label} className="stat-card card-hover" style={{ textAlign: "left" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <s.icon size={20} color={s.color} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontSize: 13, color: "#64748b" }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ padding: "100px 24px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 44, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 12 }}>
              Better than a spreadsheet
            </h2>
            <p style={{ color: "#64748b", fontSize: 17 }}>See what you get with FinTrack vs managing it manually</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", background: "rgba(255,255,255,0.04)", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>FEATURE</span>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600, textAlign: "center" }}>Spreadsheet</span>
              <span style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 600, textAlign: "center" }}>FinTrack</span>
            </div>
            {[
              ["Automatic categorization", false, true],
              ["Real-time analytics", false, true],
              ["Budget alerts & notifications", false, true],
              ["AI-powered insights", false, true],
              ["Import from any bank CSV", false, true],
              ["Time to set up", "Hours", "2 mins"],
            ].map(([feature, spreadsheet, fintrack], i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "16px 24px", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                <span style={{ fontSize: 15, color: "#94a3b8" }}>{feature}</span>
                <div style={{ textAlign: "center" }}>
                  {typeof spreadsheet === "boolean"
                    ? spreadsheet ? <Check size={18} color="#10b981" style={{ margin: "0 auto" }} /> : <X size={18} color="#475569" style={{ margin: "0 auto" }} />
                    : <span style={{ fontSize: 14, color: "#64748b" }}>{spreadsheet as string}</span>}
                </div>
                <div style={{ textAlign: "center" }}>
                  {typeof fintrack === "boolean"
                    ? fintrack ? <Check size={18} color="#10b981" style={{ margin: "0 auto" }} /> : <X size={18} color="#475569" style={{ margin: "0 auto" }} />
                    : <span style={{ fontSize: 14, color: "#a5b4fc", fontWeight: 600 }}>{fintrack as string}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div className="badge" style={{ marginBottom: 16, display: "inline-flex" }}>Simple pricing</div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 44, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 12 }}>
              Start free, upgrade when ready
            </h2>
            <p style={{ fontSize: 17, color: "#64748b" }}>
              Pro and Business plans are <span style={{ color: "#a5b4fc", fontWeight: 600 }}>coming soon</span>. Everything is free while we're in beta.
            </p>
          </div>

          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 48 }}>
            {/* Free */}
            <div className="pricing-card">
              <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em" }}>FREE</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: "#f1f5f9", fontFamily: "Fraunces, serif" }}>$0</span>
                <span style={{ color: "#64748b" }}>/month</span>
              </div>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.5 }}>Everything you need to get started tracking your finances.</p>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 28 }} onClick={() => router.push("/login?mode=signup")}>
                Get started free
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Up to 500 transactions/month", "Dashboard & analytics", "CSV import from any bank", "Budget tracking", "Email support"].map(item => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Check size={15} color="#10b981" />
                    <span style={{ fontSize: 14, color: "#94a3b8" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro */}
            <div className="pricing-card featured" style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", padding: "4px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                Coming Soon
              </div>
              <p style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em" }}>PRO</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: "#f1f5f9", fontFamily: "Fraunces, serif" }}>$9</span>
                <span style={{ color: "#64748b" }}>/month</span>
              </div>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.5 }}>Advanced features for serious financial planning.</p>
              <button className="btn-ghost" style={{ width: "100%", textAlign: "center", marginBottom: 28, opacity: 0.6, cursor: "not-allowed" }} disabled>
                Notify me when available
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Everything in Free", "Unlimited transactions", "AI insights & recommendations", "Advanced reports & PDF export", "Multiple accounts", "Priority support"].map(item => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Check size={15} color="#6366f1" />
                    <span style={{ fontSize: 14, color: "#94a3b8" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business */}
            <div className="pricing-card">
              <div style={{ display: "inline-block", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                Coming Soon
              </div>
              <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em" }}>BUSINESS</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: "#f1f5f9", fontFamily: "Fraunces, serif" }}>$29</span>
                <span style={{ color: "#64748b" }}>/month</span>
              </div>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.5 }}>Team features for small businesses and advisors.</p>
              <button className="btn-ghost" style={{ width: "100%", textAlign: "center", marginBottom: 28, opacity: 0.6, cursor: "not-allowed" }} disabled>
                Contact us
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Everything in Pro", "Up to 5 team members", "API access", "Custom integrations", "Dedicated support", "White-label reports"].map(item => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Check size={15} color="#10b981" />
                    <span style={{ fontSize: 14, color: "#94a3b8" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: "100px 24px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 44, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              Common questions
            </h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <ChevronDown size={18} color="#64748b" style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                </button>
                {openFaq === i && <div className="faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 52, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 20, lineHeight: 1.05 }}>
            Ready to take control of your{" "}
            <em style={{ color: "#818cf8", fontStyle: "italic" }}>finances?</em>
          </h2>
          <p style={{ fontSize: 18, color: "#64748b", marginBottom: 40 }}>
            Create your free account and import your first transactions in under 2 minutes.
          </p>
          <button className="btn-primary" style={{ fontSize: 17, padding: "16px 36px" }} onClick={() => router.push("/login?mode=signup")}>
            Get started for free <ArrowRight size={18} />
          </button>
          <p style={{ marginTop: 16, fontSize: 13, color: "#475569" }}>No credit card required · Free forever on the basic plan</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "48px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start", marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #6366f1, #4f46e5)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign size={16} color="white" />
                </div>
                <span style={{ fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>FinTrack</span>
              </div>
              <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, maxWidth: 300 }}>
                Smart financial management for individuals. Track spending, set budgets, and understand your money.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", marginBottom: 14, textTransform: "uppercase" }}>Product</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Features", href: "#features" },
                    { label: "How it works", href: "#how-it-works" },
                    { label: "Pricing", href: "#pricing" },
                    { label: "FAQ", href: "#faq" },
                  ].map(l => (
                    <a key={l.label} href={l.href} style={{ fontSize: 14, color: "#475569", textDecoration: "none" }}>{l.label}</a>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", marginBottom: 14, textTransform: "uppercase" }}>Legal</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Contact", href: "mailto:support@fintrack.app" },
                  ].map(l => (
                    <a key={l.label} href={l.href} style={{ fontSize: 14, color: "#475569", textDecoration: "none" }}>{l.label}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#334155" }}>© 2025 FinTrack. All rights reserved.</p>
            <p style={{ fontSize: 13, color: "#334155" }}>Built with ♥ for better financial clarity</p>
          </div>
        </div>
      </footer>
    </div>
  );
}