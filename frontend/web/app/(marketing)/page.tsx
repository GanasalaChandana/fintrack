﻿'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Shield, Zap, FileText, Bell, Target, Users, Download, Check, X, ChevronDown, Menu, X as CloseIcon, Moon, Sun, ArrowRight, Play, Star, Upload, Lock, MessageCircle, Mail, Smartphone, RefreshCw, PieChart, Award, Sparkles } from 'lucide-react';

const FinTrackEnhanced = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [showDemo, setShowDemo] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState('');

  const mockData = [
    { month: 'Jan', income: 4200, expenses: 2800 },
    { month: 'Feb', income: 4500, expenses: 2400 },
    { month: 'Mar', income: 4300, expenses: 2600 },
    { month: 'Apr', income: 4700, expenses: 2390 }
  ];

  const categoryData = [
    { name: 'Food', value: 450, color: '#ec4899' },
    { name: 'Transport', value: 280, color: '#8b5cf6' },
    { name: 'Bills', value: 820, color: '#3b82f6' },
    { name: 'Entertainment', value: 340, color: '#10b981' }
  ];

  const testimonials = [
    { 
      name: "Sarah Johnson", 
      role: "Small Business Owner", 
      initial: "SJ", 
      text: "Discovered $547 in forgotten subscriptions in my first week. The automatic categorization saves me hours during tax season.",
      highlight: "$547 saved"
    },
    { 
      name: "Michael Chen", 
      role: "Freelance Designer", 
      initial: "MC", 
      text: "Cut my monthly expense tracking from 3 hours to 5 minutes. The CSV import is incredibly smart and handles any bank format.",
      highlight: "3 hours saved monthly"
    },
    { 
      name: "Emily Rodriguez", 
      role: "Marketing Manager", 
      initial: "ER", 
      text: "Finally understand where every dollar goes. The visual reports transformed budgeting from a chore into something I actually enjoy.",
      highlight: "30% better savings"
    }
  ];

  const faqs = [
    { 
      q: "Is my financial data secure?", 
      a: "Absolutely. We use bank-level 256-bit SSL encryption and are SOC 2 Type II certified. We never store your bank credentials and conduct regular third-party security audits. Your data is encrypted both in transit and at rest." 
    },
    { 
      q: "Which banks and file formats do you support?", 
      a: "We support CSV exports from all major banks including Chase, Bank of America, Wells Fargo, Citibank, Capital One, and 100+ others. Our intelligent parser automatically detects formats and handles various date and currency formats without manual configuration." 
    },
    { 
      q: "Can I cancel my subscription anytime?", 
      a: "Yes, absolutely. Cancel anytime with no questions asked and no cancellation fees. You'll retain full access until the end of your billing period, and all your data remains exportable." 
    },
    { 
      q: "Do you offer a free trial?", 
      a: "Yes! The Pro plan includes a full 14-day free trial with access to all premium features. No credit card required to start. You can explore every feature risk-free." 
    },
    { 
      q: "Can I import historical transactions?", 
      a: "Yes, import transactions from any time period with no restrictions. Many users import 2-3 years of historical data to get comprehensive insights into their spending patterns and trends." 
    },
    { 
      q: "Is there a mobile app?", 
      a: "Yes! We have native iOS and Android apps with full feature parity. All data syncs seamlessly in real-time across web, iOS, and Android. Track expenses on the go and view your dashboard anywhere." 
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  type AnimatedCounterProps = {
    end: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
  };

  const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }: AnimatedCounterProps) => {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLSpanElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            let start = 0;
            const increment = end / (duration / 16);
            const timer = setInterval(() => {
              start += increment;
              if (start >= end) {
                setCount(end);
                clearInterval(timer);
              } else {
                setCount(Math.floor(start));
              }
            }, 16);
          }
        },
        { threshold: 0.5 }
      );

      if (countRef.current) observer.observe(countRef.current);
      return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return <span ref={countRef}>{prefix}{count.toLocaleString()}{suffix}</span>;
  };

  const bgColor = isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-purple-500/30' : 'border-purple-200';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-20 right-6 z-50 p-3 rounded-full ${cardBg} ${borderColor} border-2 shadow-lg hover:scale-110 transition-transform`}
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-purple-600" />}
      </button>

      {/* Sticky CTA Bar */}
      {visibleSections.has('pricing') && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-600 to-pink-600 py-4 px-6 shadow-2xl animate-slideUp">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-white" />
              <span className="font-bold text-white text-center sm:text-left">Ready to start? Get 14 days free, no credit card needed!</span>
            </div>
            <a
              href="/login?mode=signup"
              className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition whitespace-nowrap"
            >
              Start Now →
            </a>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${cardBg} ${isMenuOpen || visibleSections.size > 0 ? 'shadow-lg backdrop-blur-md bg-opacity-95' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FinTrack
              </span>
            </a>

            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How It Works', 'Pricing', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className={`${isDark ? 'hover:text-purple-400' : 'hover:text-purple-600'} transition font-medium`}
                >
                  {item}
                </a>
              ))}
              <a
                href="/login?mode=signin"
                className={`${isDark ? 'hover:text-purple-400' : 'hover:text-purple-600'} transition font-medium`}
              >
                Login
              </a>
              <a
                href="/login?mode=signup"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 font-semibold"
              >
                Get Started
              </a>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className={`md:hidden mt-4 pb-4 space-y-2 animate-fadeIn ${cardBg} rounded-lg p-4 border ${borderColor}`}>
              {['Features', 'How It Works', 'Pricing', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className={`block px-4 py-3 rounded-lg ${isDark ? 'hover:bg-purple-900' : 'hover:bg-purple-50'} transition`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <a
                href="/login?mode=signup"
                className="block px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-center font-semibold"
              >
                Get Started
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden" id="hero" data-animate>
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <span className={`inline-flex items-center gap-2 ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'} ${isDark ? 'text-purple-200' : 'text-purple-700'} px-6 py-3 rounded-full text-sm font-semibold ${isDark ? 'border border-purple-500/30' : 'border border-purple-300'} animate-bounce`}>
              <Sparkles className="w-4 h-4" />
              Join <AnimatedCounter end={2500} suffix="+ active users" />
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-center mb-6 leading-tight">
            Save $500+ yearly by{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              tracking every dollar
            </span>
          </h1>

          <p className={`text-xl sm:text-2xl text-center ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-10 max-w-3xl mx-auto`}>
            Discover forgotten subscriptions, understand spending patterns, and make smarter financial decisions. Join thousands who've already transformed their finances.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="/login?mode=signup"
              className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <button 
              onClick={() => setShowDemo(true)}
              className={`group ${cardBg} ${borderColor} border-2 px-8 py-4 rounded-full text-lg font-bold ${isDark ? 'hover:bg-gray-700' : 'hover:bg-purple-50'} transition-all flex items-center justify-center`}
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto mb-16">
            <div className="text-center group cursor-pointer transform hover:scale-110 transition">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                <AnimatedCounter end={2500} suffix="+" />
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2 font-medium`}>Active Users</div>
            </div>
            <div className="text-center group cursor-pointer transform hover:scale-110 transition">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-br from-pink-600 to-pink-800 bg-clip-text text-transparent">
                <AnimatedCounter end={450} prefix="$" suffix="K+" />
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2 font-medium`}>Money Saved</div>
            </div>
            <div className="text-center group cursor-pointer transform hover:scale-110 transition">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-br from-cyan-600 to-cyan-800 bg-clip-text text-transparent">4.9★</div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2 font-medium`}>User Rating</div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto group" data-animate>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition" />
            
            <div className={`relative ${cardBg} rounded-3xl p-4 sm:p-6 lg:p-8 ${borderColor} border-2 shadow-2xl transform group-hover:scale-[1.02] transition-all`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Dashboard Overview
                </h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className={`${isDark ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50' : 'bg-gradient-to-br from-purple-50 to-purple-100'} rounded-2xl p-4 sm:p-6 ${isDark ? 'border border-purple-500/30' : 'border border-purple-200'} transform hover:scale-105 transition cursor-pointer`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-purple-200' : 'text-purple-700'} font-medium`}>Balance</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black">$12,450</div>
                  <div className="text-sm text-green-500 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5%
                  </div>
                </div>

                <div className={`${isDark ? 'bg-gradient-to-br from-green-900/50 to-emerald-800/50' : 'bg-gradient-to-br from-green-50 to-emerald-100'} rounded-2xl p-4 sm:p-6 ${isDark ? 'border border-green-500/30' : 'border border-green-200'} transform hover:scale-105 transition cursor-pointer`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-green-200' : 'text-green-700'} font-medium`}>Income</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black">$4,500</div>
                  <div className="text-sm text-green-500 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.3%
                  </div>
                </div>

                <div className={`${isDark ? 'bg-gradient-to-br from-pink-900/50 to-rose-800/50' : 'bg-gradient-to-br from-pink-50 to-rose-100'} rounded-2xl p-4 sm:p-6 ${isDark ? 'border border-pink-500/30' : 'border border-pink-200'} transform hover:scale-105 transition cursor-pointer`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-pink-200' : 'text-pink-700'} font-medium`}>Expenses</span>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black">$2,390</div>
                  <div className="text-sm text-red-500 mt-1 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -3.2%
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#ec4899" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mt-12 opacity-60">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">Bank-level security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">iOS & Android apps</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6" data-animate>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Get started in{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                three simple steps
              </span>
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>From signup to insights in under 2 minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Sign Up Free', desc: 'Create your account in 30 seconds. No credit card required.', icon: Users },
              { num: '2', title: 'Import Transactions', desc: 'Upload your bank CSV or connect automatically. Import 1000+ transactions in seconds.', icon: Upload },
              { num: '3', title: 'Get AI Insights', desc: 'View real-time analytics, discover savings opportunities, and track spending trends automatically.', icon: TrendingUp }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative">
                  <div className={`${cardBg} ${borderColor} border-2 rounded-2xl p-8 hover:shadow-xl transition transform hover:scale-105 text-center h-full`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold mb-4">
                      {step.num}
                    </div>
                    <div className={`inline-block p-4 rounded-full mb-4 ${isDark ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30' : 'bg-gradient-to-r from-purple-100 to-pink-100'}`}>
                      <Icon className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{step.desc}</p>
                  </div>
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-purple-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={`py-20 px-6 ${isDark ? 'bg-gray-800/30' : 'bg-purple-50/50'}`} data-animate>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Powerful features for{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                smart finance management
              </span>
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Everything you need to take control of your finances in one intuitive platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 mb-12">
            {[
              { icon: TrendingUp, title: 'Real-Time Dashboard', desc: 'Monitor your financial health with interactive charts. Get instant insights with visual analytics that update automatically as you add transactions.' },
              { icon: Upload, title: 'Smart CSV Import', desc: 'Import 1000+ transactions in under 30 seconds from Chase, BofA, Wells Fargo & 100+ banks. Automatic categorization saves you hours of manual work.' },
              { icon: FileText, title: 'Detailed Reports', desc: 'Generate comprehensive reports for tax preparation. Export to PDF or Excel with custom date ranges and filtering options.' },
              { icon: Shield, title: 'Bank-Level Security', desc: 'Your data is protected with 256-bit SSL encryption. SOC 2 Type II certified with regular third-party security audits. We never store credentials.' }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className={`group ${cardBg} ${borderColor} border rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105`}>
                  <div className="inline-block p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl mb-4 group-hover:scale-110 transition">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{feature.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Bell, title: 'Smart Alerts', desc: 'Get notified of unusual spending, bill due dates, and budget limits' },
              { icon: Target, title: 'Budget Goals', desc: 'Set and track savings goals with visual progress indicators' },
              { icon: PieChart, title: 'Category Insights', desc: 'Automatic categorization with customizable spending categories' },
              { icon: RefreshCw, title: 'Recurring Tracking', desc: 'Identify and manage subscriptions and recurring payments' },
              { icon: Download, title: 'Multi-Format Export', desc: 'Export reports in PDF, Excel, or CSV for easy sharing' },
              { icon: Smartphone, title: 'Cross-Platform Sync', desc: 'Access your data seamlessly across web, iOS, and Android' }
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className={`${cardBg} ${borderColor} border rounded-xl p-6 hover:shadow-lg transition`}>
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                      <Icon className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{f.title}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{f.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Feature Demo */}
      <section className="py-20 px-6" data-animate>
        <div className="max-w-6xl mx-auto">
          <div className={`${cardBg} ${borderColor} border-2 rounded-3xl p-8 shadow-xl`}>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">
                  See Your Spending{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    at a Glance
                  </span>
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Visualize where your money goes with beautiful, interactive charts. Identify spending patterns and make smarter decisions.
                </p>
                <ul className="space-y-3">
                  {['Real-time updates', 'Category breakdowns', 'Trend analysis', 'Budget tracking'].map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} rounded-2xl p-6`}>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                        border: 'none', 
                        borderRadius: '8px' 
                      }} 
                    />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {categoryData.map((cat, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm">{cat.name}: ${cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className={`py-20 px-6 ${isDark ? 'bg-gray-800/30' : 'bg-purple-50/50'}`} data-animate>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Your data security is our{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">top priority</span>
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            We employ industry-leading security measures to protect your financial information
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: '256-bit Encryption', desc: 'Bank-level SSL encryption for all data' },
              { icon: Shield, title: 'SOC 2 Certified', desc: 'Regular third-party security audits' },
              { icon: Check, title: 'No Credentials Stored', desc: 'We never access your bank login' }
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className={`${cardBg} ${borderColor} border rounded-xl p-6`}>
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h4 className="font-semibold mb-2">{s.title}</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-6" data-animate>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why choose FinTrack?</h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              See how we compare to traditional spreadsheets
            </p>
          </div>

          <div className={`${cardBg} ${borderColor} border-2 rounded-2xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDark ? 'border-b border-purple-500/20' : 'border-b border-purple-200'}`}>
                    <th className="p-6 text-left"></th>
                    <th className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Spreadsheets</th>
                    <th className="p-6 text-center text-purple-600">FinTrack</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Automatic Categorization', ss: false, ft: true },
                    { feature: 'Real-time Analytics', ss: false, ft: true },
                    { feature: 'Mobile Access', ss: false, ft: true },
                    { feature: 'Bank-level Security', ss: false, ft: true },
                    { feature: 'Time to Setup', ss: 'Hours', ft: '2 mins' }
                  ].map((row, idx) => (
                    <tr key={idx} className={`${isDark ? 'border-b border-purple-500/10' : 'border-b border-purple-100'}`}>
                      <td className="p-6 font-medium">{row.feature}</td>
                      <td className="p-6 text-center">
                        {typeof row.ss === 'boolean' ? (
                          row.ss ? <Check className="w-6 h-6 mx-auto text-green-400" /> : <X className="w-6 h-6 mx-auto text-red-400" />
                        ) : <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{row.ss}</span>}
                      </td>
                      <td className="p-6 text-center">
                        {typeof row.ft === 'boolean' ? (
                          row.ft ? <Check className="w-6 h-6 mx-auto text-green-400" /> : <X className="w-6 h-6 mx-auto text-red-400" />
                        ) : <span className="text-purple-600 font-semibold">{row.ft}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className={`py-20 px-6 ${isDark ? 'bg-gray-800/30' : 'bg-purple-50/50'}`} data-animate>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                thousands of users
              </span>
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Real results from real people</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className={`${cardBg} ${borderColor} border-2 rounded-3xl p-8 lg:p-12 shadow-xl`}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className={`text-xl lg:text-2xl ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-6 leading-relaxed`}>
                "{testimonials[activeTestimonial].text}"
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {testimonials[activeTestimonial].initial}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{testimonials[activeTestimonial].name}</div>
                    <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'} font-semibold`}>
                  <Award className="w-5 h-5" />
                  {testimonials[activeTestimonial].highlight}
                </div>
              </div>
            </div>

            {/* Testimonial Navigation Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-3 rounded-full transition-all ${
                    idx === activeTestimonial 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 w-8' 
                      : isDark ? 'bg-gray-600 w-3' : 'bg-gray-300 w-3'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6" data-animate>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Simple,{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                transparent pricing
              </span>
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Choose the plan that's right for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                name: 'Free', 
                price: '$0', 
                period: 'forever', 
                features: ['Up to 100 transactions/month', 'Basic reporting', 'CSV import', 'Email support', 'Mobile app access'],
                highlighted: false,
                cta: 'Get Started Free'
              },
              { 
                name: 'Pro', 
                price: '$9', 
                period: 'per month', 
                badge: 'MOST POPULAR',
                savings: 'Save 20% with annual billing',
                features: ['Unlimited transactions', 'Advanced analytics & AI insights', 'Multiple accounts & categories', 'Priority support', 'Export to Excel/PDF', 'Custom categories & tags', 'Budget tracking & alerts'],
                highlighted: true,
                cta: 'Try Free for 14 Days'
              },
              { 
                name: 'Business', 
                price: '$29', 
                period: 'per month', 
                features: ['Everything in Pro', 'Team collaboration (up to 5 users)', 'API access', 'Custom integrations', 'Dedicated account manager', 'Advanced security & compliance', 'White-label reports'],
                highlighted: false,
                cta: 'Contact Sales'
              }
            ].map((plan, idx) => (
              <div 
                key={idx} 
                className={`${plan.highlighted ? 'transform scale-105 z-10' : ''} ${cardBg} ${plan.highlighted ? 'border-purple-500 shadow-2xl' : borderColor} border-2 rounded-3xl p-8 transition hover:shadow-xl relative`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-5xl font-black mb-2">{plan.price}</div>
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{plan.period}</div>
                  {plan.savings && <div className="text-sm text-purple-600 mt-2">{plan.savings}</div>}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.name === 'Business' ? 'mailto:sales@fintrack.com' : '/login?mode=signup'}
                  className={`block w-full py-4 rounded-full font-bold text-center transition ${
                    plan.highlighted 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50'  
                      : isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {plan.cta}
                </a>
                {plan.name === 'Pro' && (
                  <p className={`text-xs text-center mt-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    No credit card required • Cancel anytime
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`py-20 px-6 ${isDark ? 'bg-gray-800/30' : 'bg-purple-50/50'}`} data-animate>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Everything you need to know about FinTrack</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`${cardBg} ${borderColor} border-2 rounded-2xl overflow-hidden transition hover:shadow-lg`}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className={`w-full px-6 py-5 flex justify-between items-center text-left ${isDark ? 'hover:bg-gray-800' : 'hover:bg-purple-50'} transition`}
                >
                  <span className="font-bold text-lg pr-4">{faq.q}</span>
                  <ChevronDown className={`w-6 h-6 text-purple-600 flex-shrink-0 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {expandedFaq === idx && (
                  <div className={`px-6 pb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'} animate-fadeIn`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Still have questions?</p>
            <button
              onClick={() => setShowEmailCapture(true)}
              className="text-purple-600 hover:text-purple-700 font-semibold transition inline-flex items-center"
            >
              Contact our support team
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to take control of your finances?
          </h2>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Join 2,500+ users managing their money smarter with FinTrack.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a
              href="/login?mode=signup"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
            >
              Start Your Free Trial
            </a>
            <button 
              onClick={() => setShowEmailCapture(true)}
              className={`${cardBg} ${borderColor} border-2 px-10 py-4 rounded-full text-lg font-bold ${isDark ? 'hover:bg-gray-800' : 'hover:bg-purple-50'} transition`}
            >
              Get Updates
            </button>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-gray-950' : 'bg-gray-900 text-gray-100'} py-12 px-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-8 h-8 text-purple-400" />
                <span className="text-xl font-bold text-white">FinTrack</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">Your intelligent financial management platform</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>SOC 2 Type II Certified</span>
              </div>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Roadmap', 'API Docs'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press Kit', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Data Processing'] }
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-bold mb-4 text-white">{col.title}</h4>
                <ul className="space-y-2 text-sm">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-purple-400 transition">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2024 FinTrack. All rights reserved.</p>
            <div className="flex space-x-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a key={social} href={`https://${social.toLowerCase()}.com`} className="text-gray-400 hover:text-purple-400 transition text-sm">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Live Chat Widget */}
      <button 
        onClick={() => setShowEmailCapture(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-110 z-40"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowDemo(false)}>
          <div className={`${cardBg} rounded-2xl p-8 max-w-4xl w-full relative`} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowDemo(false)} 
              className={`absolute top-4 right-4 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition`}
              aria-label="Close demo"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-3xl font-bold mb-4">Product Demo</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>See FinTrack in action - Import transactions, view analytics, and discover insights</p>
            <div className={`aspect-video ${isDark ? 'bg-gray-900' : 'bg-gray-100'} rounded-xl flex items-center justify-center ${borderColor} border`}>
              <div className="text-center">
                <Play className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Interactive demo video coming soon!</p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>In the meantime, start your free trial to explore all features</p>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <a 
                href="/login?mode=signup" 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full text-center font-semibold hover:shadow-lg transition"
              >
                Start Free Trial
              </a>
              <button 
                onClick={() => setShowDemo(false)} 
                className={`flex-1 ${borderColor} border-2 px-6 py-3 rounded-full font-semibold ${isDark ? 'hover:bg-gray-700' : 'hover:bg-purple-50'} transition`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowEmailCapture(false)}>
          <div className={`${cardBg} rounded-2xl p-8 max-w-md w-full relative`} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowEmailCapture(false)} 
              className={`absolute top-4 right-4 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition`}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Get product updates, tips, and exclusive offers</p>
            </div>
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                alert(`Thanks! We'll send updates to ${email}`); 
                setEmail(''); 
                setShowEmailCapture(false); 
              }} 
              className="space-y-4"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className={`w-full px-4 py-3 ${isDark ? 'bg-gray-900 border-purple-500/20' : 'bg-gray-50 border-purple-200'} border rounded-lg focus:outline-none focus:border-purple-500 ${textColor}`}
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FinTrackEnhanced;