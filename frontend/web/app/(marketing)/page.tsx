'use client';
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Upload, FileText, Shield, Check, Menu, X, Play, Star, ArrowRight,
  DollarSign, ChevronDown, Mail, Globe, Users, Zap, CreditCard, Lock, BarChart3,
  Smartphone, Bell, Download, RefreshCw, Target, PieChart, Calculator, Clock,
  AlertCircle, TrendingDown, Activity, ExternalLink, MessageCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

export default function FinTrackEnhanced() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveActivity, setLiveActivity] = useState([]);
  const [activityIndex, setActivityIndex] = useState(0);
  const [savingsCalculator, setSavingsCalculator] = useState({
    transactions: 50,
    timeSpent: 2
  });

  // Live activity feed
  const activities = [
    { name: 'Sarah J.', action: 'saved $547', location: 'New York', time: '2m ago' },
    { name: 'Mike C.', action: 'tracked 234 expenses', location: 'SF', time: '5m ago' },
    { name: 'Emma R.', action: 'created budget', location: 'London', time: '8m ago' },
    { name: 'David L.', action: 'exported report', location: 'Toronto', time: '12m ago' },
    { name: 'Lisa K.', action: 'reached goal', location: 'Berlin', time: '15m ago' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowStickyBar(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Exit intent
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitIntent && window.scrollY > 300) {
        setShowExitIntent(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [showExitIntent]);

  // Live activity rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % activities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const expenseData = [
    { month: 'Jan', expenses: 2400, income: 4000 },
    { month: 'Feb', expenses: 1398, income: 3800 },
    { month: 'Mar', expenses: 3800, income: 4200 },
    { month: 'Apr', expenses: 2780, income: 4100 },
    { month: 'May', expenses: 1890, income: 4300 },
    { month: 'Jun', expenses: 2390, income: 4500 }
  ];

  const categoryData = [
    { name: 'Food', value: 450, color: '#ec4899' },
    { name: 'Transport', value: 280, color: '#8b5cf6' },
    { name: 'Bills', value: 820, color: '#3b82f6' },
    { name: 'Entertainment', value: 340, color: '#10b981' }
  ];

  const calculateROI = () => {
    const monthlyHoursSaved = (savingsCalculator.timeSpent * savingsCalculator.transactions) / 60;
    const annualHoursSaved = monthlyHoursSaved * 12;
    const moneySaved = annualHoursSaved * 50; // $50/hour value
    return { annualHoursSaved: Math.round(annualHoursSaved), moneySaved: Math.round(moneySaved) };
  };

  const roi = calculateROI();

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Real-Time Dashboard',
      description: 'Monitor your financial health with interactive charts showing spending trends, income vs expenses, and category breakdowns.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: 'Smart CSV Import',
      description: 'Import transactions from any bank with our intelligent CSV parser. Automatic categorization saves you hours.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Detailed Reports',
      description: 'Generate comprehensive reports. Export to PDF or Excel for tax preparation with custom date ranges.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Bank-Level Security',
      description: 'Your data is encrypted with 256-bit SSL. SOC 2 Type II certified with regular security audits.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      avatar: 'SJ',
      content: 'FinTrack helped me identify $547 in unnecessary subscriptions. The automatic categorization is a lifesaver during tax season.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Designer',
      avatar: 'MC',
      content: 'I used to spend 3 hours every month on expense tracking. Now it takes 5 minutes. The CSV import is incredibly smart.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Manager',
      avatar: 'ER',
      content: 'Finally understand where my money goes! The visual reports make budgeting actually enjoyable. Worth every penny.',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 100 transactions/month',
        'Basic reporting',
        'CSV import',
        'Email support',
        'Mobile app access'
      ],
      cta: 'Get Started Free',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      savings: 'Save 20% with annual billing',
      features: [
        'Unlimited transactions',
        'Advanced analytics & AI insights',
        'Multiple accounts & categories',
        'Priority support',
        'Export to Excel/PDF',
        'Custom categories & tags',
        'Budget tracking & alerts'
      ],
      cta: 'Try Free for 14 Days',
      highlighted: true
    },
    {
      name: 'Business',
      price: '$29',
      period: 'per month',
      features: [
        'Everything in Pro',
        'Team collaboration (up to 5 users)',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced security & compliance',
        'White-label reports'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  const faqs = [
    {
      question: 'Is my financial data secure?',
      answer: 'Absolutely. We use bank-level 256-bit SSL encryption for all data transmission and storage. We never store your bank login credentials.'
    },
    {
      question: 'Which banks and file formats do you support?',
      answer: 'We support CSV files from all major banks including Chase, Bank of America, Wells Fargo, Citibank, and Capital One.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes! There are no long-term contracts. You can cancel anytime from your account settings.'
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! The Pro plan includes a 14-day free trial with full access to all features. No credit card required.'
    },
    {
      question: 'Can I import historical transactions?',
      answer: 'Absolutely. You can import transactions going back as far as your bank provides them.'
    },
    {
      question: 'Is there a mobile app?',
      answer: 'Yes! FinTrack is available on iOS and Android with seamless sync across all devices.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Sticky CTA Bar */}
      {showStickyBar && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-600 py-3 px-4 shadow-lg transform translate-y-0 animate-slideDown">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold text-sm sm:text-base">
                Limited Time: Get 2 months free with annual plan!
              </span>
            </div>
            <a
              href="/login?mode=signup"
              className="bg-white text-purple-600 px-4 sm:px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition text-sm sm:text-base"
            >
              Claim Offer →
            </a>
          </div>
        </div>
      )}

      {/* Exit Intent Popup */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full relative border border-purple-500/30 shadow-2xl">
            <button
              onClick={() => setShowExitIntent(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <DollarSign className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-bold mb-3">Wait! Don't Miss Out</h3>
              <p className="text-xl text-purple-300 font-semibold mb-2">
                Get 50% OFF your first month
              </p>
              <p className="text-gray-400 mb-6">
                Join 2,500+ users saving an average of $450/month
              </p>

              <div className="space-y-3">
                <a
                  href="/login?mode=signup"
                  className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
                >
                  Claim My 50% Discount →
                </a>
                <button
                  onClick={() => setShowExitIntent(false)}
                  className="block w-full text-gray-400 hover:text-white transition text-sm"
                >
                  No thanks, I don't want to save money
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                ✓ No credit card required ✓ Cancel anytime
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed w-full z-40 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FinTrack
              </span>
            </a>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-purple-400 transition">Features</a>
              <a href="#how-it-works" className="hover:text-purple-400 transition">How It Works</a>
              <a href="#pricing" className="hover:text-purple-400 transition">Pricing</a>
              <a href="#faq" className="hover:text-purple-400 transition">FAQ</a>
              <a href="/login?mode=signin" className="hover:text-purple-400 transition">Login</a>
              <a
                href="/login?mode=signup"
                className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105"
              >
                Get Started
              </a>
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 hover:bg-purple-500/20 rounded">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 hover:bg-purple-500/20 rounded">How It Works</a>
              <a href="#pricing" className="block px-3 py-2 hover:bg-purple-500/20 rounded">Pricing</a>
              <a href="#faq" className="block px-3 py-2 hover:bg-purple-500/20 rounded">FAQ</a>
              <a href="/login?mode=signup" className="block px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-center">Get Started</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero with Live Activity */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Live Activity Notification */}
          <div className="absolute top-0 right-0 max-w-xs animate-slideIn">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {activities[activityIndex].name} from {activities[activityIndex].location}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {activities[activityIndex].action} • {activities[activityIndex].time}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block animate-bounce">
                <span className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm text-purple-200 px-5 py-2.5 rounded-full text-sm font-semibold border border-purple-400/30">
                  🚀 Join 2,500+ active users
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight">
                Your intelligent{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  financial management
                </span>{' '}
                platform
              </h1>

              <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed">
                Track expenses, analyze spending patterns, and make informed financial decisions with ease.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <a
                  href="/login?mode=signup"
                  className="group bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/60 transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </a>
                <button
                  onClick={() => setShowDemo(true)}
                  className="group backdrop-blur-xl bg-white/10 border-2 border-white/30 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="group cursor-pointer transform hover:scale-110 transition">
                  <div className="text-5xl font-black bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent">2.5K+</div>
                  <div className="text-sm text-gray-300 font-medium mt-1">Active Users</div>
                </div>
                <div className="group cursor-pointer transform hover:scale-110 transition">
                  <div className="text-5xl font-black bg-gradient-to-br from-pink-400 to-pink-600 bg-clip-text text-transparent">$450K+</div>
                  <div className="text-sm text-gray-300 font-medium mt-1">Money Saved</div>
                </div>
                <div className="group cursor-pointer transform hover:scale-110 transition">
                  <div className="text-5xl font-black bg-gradient-to-br from-cyan-400 to-cyan-600 bg-clip-text text-transparent">4.9★</div>
                  <div className="text-sm text-gray-300 font-medium mt-1">User Rating</div>
                </div>
              </div>
            </div>

            {/* Interactive Dashboard Preview */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 animate-pulse transition" />

              <div className="relative bg-slate-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl transform group-hover:scale-[1.02] transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Dashboard Overview
                  </h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5 mb-8">
                  <div className="bg-gradient-to-br from-purple-500/30 to-purple-600/30 backdrop-blur-xl rounded-2xl p-5 border border-purple-400/30 transform hover:scale-105 transition cursor-pointer">
                    <div className="text-sm text-purple-200 mb-1">Balance</div>
                    <div className="text-3xl font-black text-white">$12,450</div>
                    <div className="text-xs text-purple-300 mt-1">+12.5% ↑</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/30 to-emerald-600/30 backdrop-blur-xl rounded-2xl p-5 border border-green-400/30 transform hover:scale-105 transition cursor-pointer">
                    <div className="text-sm text-green-200 mb-1">Income</div>
                    <div className="text-3xl font-black text-white">$4,500</div>
                    <div className="text-xs text-green-300 mt-1">+8.3% ↑</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500/30 to-rose-600/30 backdrop-blur-xl rounded-2xl p-5 border border-pink-400/30 transform hover:scale-105 transition cursor-pointer">
                    <div className="text-sm text-pink-200 mb-1">Expenses</div>
                    <div className="text-3xl font-black text-white">$2,390</div>
                    <div className="text-xs text-pink-300 mt-1">-3.2% ↓</div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="expenses" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-400 mb-8">Trusted by users from</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            <div className="flex items-center space-x-2"><Globe className="w-6 h-6" /><span className="font-semibold">Google</span></div>
            <div className="flex items-center space-x-2"><Users className="w-6 h-6" /><span className="font-semibold">Microsoft</span></div>
            <div className="flex items-center space-x-2"><Zap className="w-6 h-6" /><span className="font-semibold">Amazon</span></div>
            <div className="flex items-center space-x-2"><CreditCard className="w-6 h-6" /><span className="font-semibold">Stripe</span></div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900/50 to-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Calculate Your{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Time & Money Savings
              </span>
            </h2>
            <p className="text-gray-400 text-lg">See how much you could save with FinTrack</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold mb-3">Monthly Transactions</label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={savingsCalculator.transactions}
                  onChange={(e) => setSavingsCalculator({ ...savingsCalculator, transactions: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-3xl font-bold text-purple-400 mt-2">{savingsCalculator.transactions}</div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Minutes per Transaction</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={savingsCalculator.timeSpent}
                  onChange={(e) => setSavingsCalculator({ ...savingsCalculator, timeSpent: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-3xl font-bold text-pink-400 mt-2">{savingsCalculator.timeSpent} min</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-6 border border-purple-400/30">
                <Clock className="w-8 h-8 text-purple-400 mb-3" />
                <div className="text-sm text-gray-400 mb-1">Time Saved Annually</div>
                <div className="text-4xl font-black text-white">{roi.annualHoursSaved}h</div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl p-6 border border-green-400/30">
                <DollarSign className="w-8 h-8 text-green-400 mb-3" />
                <div className="text-sm text-gray-400 mb-1">Money Saved Annually</div>
                <div className="text-4xl font-black text-white">${roi.moneySaved}</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/login?mode=signup"
                className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
              >
                Start Saving Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Get started in{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                three simple steps
              </span>
            </h2>
            <p className="text-xl text-gray-400">From signup to insights in under 2 minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Sign Up Free', desc: 'Create your account in 30 seconds', icon: <Users className="w-8 h-8" /> },
              { step: '2', title: 'Upload Transactions', desc: 'Import bank CSV or add manually', icon: <Upload className="w-8 h-8" /> },
              { step: '3', title: 'Get Insights', desc: 'View analytics and track trends', icon: <BarChart3 className="w-8 h-8" /> }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition transform hover:scale-105 text-center">
                  <div className="inline-block p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6">{item.icon}</div>
                  <div className="text-4xl font-bold text-purple-400 mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
                {idx < 2 && <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"><ArrowRight className="w-8 h-8 text-purple-400" /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Powerful features for{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                smart finance management
              </span>
            </h2>
            <p className="text-xl text-gray-400">Everything you need in one intuitive platform</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 mb-12">
            {features.map((f, idx) => (
              <div key={idx} className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className={`inline-block p-4 rounded-xl bg-gradient-to-r ${f.color} mb-4 group-hover:scale-110 transition`}>{f.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Bell className="w-6 h-6" />, title: 'Smart Alerts', desc: 'Get notified of unusual spending' },
              { icon: <Target className="w-6 h-6" />, title: 'Budget Goals', desc: 'Track savings with visual indicators' },
              { icon: <PieChart className="w-6 h-6" />, title: 'Category Insights', desc: 'Automatic categorization' },
              { icon: <RefreshCw className="w-6 h-6" />, title: 'Recurring Tracking', desc: 'Manage subscriptions easily' },
              { icon: <Download className="w-6 h-6" />, title: 'Multi-Format Export', desc: 'Export to PDF, Excel, CSV' },
              { icon: <Smartphone className="w-6 h-6" />, title: 'Cross-Platform Sync', desc: 'Access on web, iOS, Android' }
            ].map((f, idx) => (
              <div key={idx} className="bg-slate-800/30 backdrop-blur-xl rounded-xl p-6 border border-purple-500/10 hover:border-purple-500/30 transition">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">{f.icon}</div>
                  <div>
                    <h4 className="font-semibold mb-1">{f.title}</h4>
                    <p className="text-sm text-gray-400">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Feature Demo */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">
                  See Your Spending{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    at a Glance
                  </span>
                </h3>
                <p className="text-gray-400 mb-6">
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

              <div className="bg-slate-900/50 rounded-2xl p-6">
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
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
            <Shield className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Your data security is our{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">top priority</span>
          </h2>
          <p className="text-lg text-gray-400 mb-8">Industry-leading security measures to protect your financial information</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: <Lock className="w-8 h-8" />, title: '256-bit Encryption', desc: 'Bank-level SSL encryption' },
              { icon: <Shield className="w-8 h-8" />, title: 'SOC 2 Certified', desc: 'Regular security audits' },
              { icon: <Check className="w-8 h-8" />, title: 'No Credentials Stored', desc: 'We never access your bank' }
            ].map((s, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
                <div className="text-purple-400 mx-auto mb-3">{s.icon}</div>
                <h4 className="font-semibold mb-2">{s.title}</h4>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why choose FinTrack?</h2>
            <p className="text-xl text-gray-400">See how we compare to traditional spreadsheets</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-500/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="p-6 text-left"></th>
                    <th className="p-6 text-center text-gray-400">Spreadsheets</th>
                    <th className="p-6 text-center text-purple-400">FinTrack</th>
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
                    <tr key={idx} className="border-b border-purple-500/10">
                      <td className="p-6 font-medium">{row.feature}</td>
                      <td className="p-6 text-center">
                        {typeof row.ss === 'boolean' ? (
                          row.ss ? <Check className="w-6 h-6 mx-auto text-green-400" /> : <X className="w-6 h-6 mx-auto text-red-400" />
                        ) : <span className="text-gray-400">{row.ss}</span>}
                      </td>
                      <td className="p-6 text-center">
                        {typeof row.ft === 'boolean' ? (
                          row.ft ? <Check className="w-6 h-6 mx-auto text-green-400" /> : <X className="w-6 h-6 mx-auto text-red-400" />
                        ) : <span className="text-purple-400 font-semibold">{row.ft}</span>}
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
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">thousands of users</span>
            </h2>
            <p className="text-xl text-gray-400">Real results from real people</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition transform hover:scale-105">
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold">{t.avatar}</div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Simple,{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">transparent pricing</span>
            </h2>
            <p className="text-xl text-gray-400">Choose the plan that's right for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div key={idx} className={`rounded-2xl p-8 border-2 transition transform hover:scale-105 ${plan.highlighted ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 shadow-2xl' : 'bg-slate-800/50 border-slate-700'}`}>
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-1 rounded-full text-sm font-semibold">MOST POPULAR</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-5xl font-bold mb-2">{plan.price}</div>
                  <div className="text-gray-400">{plan.period}</div>
                  {plan.savings && <div className="text-sm text-purple-400 mt-2">{plan.savings}</div>}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.name === 'Business' ? 'mailto:sales@fintrack.com' : '/login?mode=signup'}
                  className={`block w-full py-4 rounded-full font-semibold transition text-center ${plan.highlighted ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  {plan.cta}
                </a>
                {plan.highlighted && <p className="text-xs text-center text-gray-400 mt-4">No credit card required • Cancel anytime</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-xl text-gray-400">Everything you need to know</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex justify-between items-center hover:bg-purple-500/5 transition"
                >
                  <span className="text-left font-semibold text-lg">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 text-gray-400 leading-relaxed">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <button
              onClick={() => setShowEmailCapture(true)}
              className="text-purple-400 hover:text-purple-300 font-semibold transition"
            >
              Contact our support team →
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to take control of your finances?</h2>
          <p className="text-xl text-gray-400 mb-8">Join 2,500+ users managing their money smarter with FinTrack.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login?mode=signup"
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-10 py-5 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
            >
              Start Your Free Trial
            </a>
            <button
              onClick={() => setShowEmailCapture(true)}
              className="border-2 border-purple-400 px-10 py-5 rounded-full text-lg font-semibold hover:bg-purple-400/10 transition"
            >
              Get Updates
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-8 h-8 text-purple-400" />
                <span className="text-xl font-bold">FinTrack</span>
              </div>
              <p className="text-gray-400 text-sm">Your intelligent financial management platform</p>
              <div className="flex items-center space-x-2 mt-4">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-500">SOC 2 Type II Certified</span>
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Roadmap', 'API Docs'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press Kit', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Data Processing'] }
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  {col.links.map((link, i) => (
                    <li key={i}><a href="#" className="hover:text-purple-400 transition">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 FinTrack. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a key={social} href={`https://${social.toLowerCase()}.com`} className="text-gray-400 hover:text-purple-400 transition">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Live Chat Widget */}
      <button className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-110 z-40">
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowDemo(false)}>
          <div className="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowDemo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-3xl font-bold mb-4">Product Demo</h3>
            <p className="text-gray-400 mb-6">See FinTrack in action</p>
            <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center border border-purple-500/20">
              <div className="text-center">
                <Play className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">Demo video coming soon!</p>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <a href="/login?mode=signup" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-full text-center font-semibold">Start Free Trial</a>
              <button onClick={() => setShowDemo(false)} className="flex-1 border-2 border-purple-400 px-6 py-3 rounded-full font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowEmailCapture(false)}>
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowEmailCapture(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-gray-400">Get the latest features and updates</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert(`Thanks! We'll send updates to ${email}`); setEmail(''); setShowEmailCapture(false); }} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}