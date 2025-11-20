// app/(marketing)/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Upload,
  FileText,
  Shield,
  Check,
  Menu,
  X,
  Play,
  Star,
  ArrowRight,
  DollarSign
} from 'lucide-react';

export default function FinTrackLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const expenseData = [
    { month: 'Jan', expenses: 2400, income: 4000 },
    { month: 'Feb', expenses: 1398, income: 3800 },
    { month: 'Mar', expenses: 3800, income: 4200 },
    { month: 'Apr', expenses: 2780, income: 4100 },
    { month: 'May', expenses: 1890, income: 4300 },
    { month: 'Jun', expenses: 2390, income: 4500 }
  ];

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Real-Time Dashboard',
      description:
        'Monitor your financial health with interactive charts showing spending trends, income vs expenses, and category breakdowns. Get instant insights with visual analytics that update automatically.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: 'Easy Upload',
      description:
        'Import transactions from any bank with our intelligent CSV parser. Supports multiple formats. Automatic categorization saves you hours.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Detailed Reports',
      description:
        'Generate comprehensive monthly, quarterly, and annual reports. Export to PDF or Excel for tax preparation.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Bank-Level Security',
      description:
        'Your data is encrypted with 256-bit SSL encryption. We never store your bank credentials.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      content:
        'FinTrack helped me save over $500/month by identifying unnecessary subscriptions and spending patterns I never noticed.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Designer',
      content:
        'The CSV import feature is a game-changer. What used to take me hours now takes 2 minutes. Perfect for tax season!',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Manager',
      content:
        "Finally, a finance app that's actually intuitive. The visual reports make it easy to understand where my money goes.",
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
        'Email support'
      ],
      cta: 'Get Started Free',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      features: [
        'Unlimited transactions',
        'Advanced analytics',
        'Multiple accounts',
        'Priority support',
        'Export to Excel/PDF',
        'Custom categories'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Business',
      price: '$29',
      period: 'per month',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced security'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Top Marketing Nav (separate from your app Navigation) */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FinTrack
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-purple-400 transition">
                Features
              </a>
              <a href="#pricing" className="hover:text-purple-400 transition">
                Pricing
              </a>
              <a href="#testimonials" className="hover:text-purple-400 transition">
                Testimonials
              </a>
              <a href="/login" className="hover:text-purple-400 transition">
                Login
              </a>
              <a
                href="/register"
                className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition"
              >
                Get Started
              </a>
            </div>

            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 hover:bg-purple-500/20 rounded">
                Features
              </a>
              <a href="#pricing" className="block px-3 py-2 hover:bg-purple-500/20 rounded">
                Pricing
              </a>
              <a
                href="#testimonials"
                className="block px-3 py-2 hover:bg-purple-500/20 rounded"
              >
                Testimonials
              </a>
              <a href="/login" className="block px-3 py-2 hover:bg-purple-500/20 rounded">
                Login
              </a>
              <a
                href="/register"
                className="block px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-center"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-semibold">
                  🚀 Trusted by 10,000+ users
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Your intelligent{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  financial management
                </span>{' '}
                platform
              </h1>

              <p className="text-xl text-gray-300">
                Track expenses, analyze spending patterns, and make informed financial decisions
                with ease. Take control of your finances today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/register"
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                </a>
                <button className="group border-2 border-purple-400 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-400/10 transition flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-purple-400">10K+</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pink-400">$2M+</div>
                  <div className="text-sm text-gray-400">Money Saved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-cyan-400">4.9★</div>
                  <div className="text-sm text-gray-400">User Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Dashboard Overview</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-500/20 rounded-xl p-4">
                    <div className="text-sm text-gray-400">Balance</div>
                    <div className="text-2xl font-bold">$12,450</div>
                  </div>
                  <div className="bg-green-500/20 rounded-xl p-4">
                    <div className="text-sm text-gray-400">Income</div>
                    <div className="text-2xl font-bold">$4,500</div>
                  </div>
                  <div className="bg-pink-500/20 rounded-xl p-4">
                    <div className="text-sm text-gray-400">Expenses</div>
                    <div className="text-2xl font-bold">$2,390</div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#ec4899" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful features for{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                smart finance management
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to take control of your finances in one intuitive platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div
                  className={`inline-block p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple comparison block */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why choose FinTrack?</h2>
            <p className="text-xl text-gray-400">See how we compare to traditional methods</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-500/20">
            <div className="grid grid-cols-3 gap-px bg-purple-500/20">
              <div className="bg-slate-800 p-6" />
              <div className="bg-slate-800 p-6 text-center">
                <div className="text-gray-400 font-semibold">Spreadsheets</div>
              </div>
              <div className="bg-slate-800 p-6 text-center">
                <div className="font-semibold text-purple-400">FinTrack</div>
              </div>

              {[
                { feature: 'Automatic Categorization', spreadsheet: false, fintrack: true },
                { feature: 'Real-time Analytics', spreadsheet: false, fintrack: true },
                { feature: 'Mobile Access', spreadsheet: false, fintrack: true },
                { feature: 'Bank-level Security', spreadsheet: false, fintrack: true },
                { feature: 'Time to Setup', spreadsheet: 'Hours', fintrack: '2 mins' }
              ].map((row, idx) => (
                <React.Fragment key={idx}>
                  <div className="bg-slate-800 p-6 font-medium">{row.feature}</div>
                  <div className="bg-slate-800 p-6 text-center">
                    {typeof row.spreadsheet === 'boolean' ? (
                      row.spreadsheet ? (
                        <Check className="w-6 h-6 mx-auto text-green-400" />
                      ) : (
                        <X className="w-6 h-6 mx-auto text-red-400" />
                      )
                    ) : (
                      <span className="text-gray-400">{row.spreadsheet}</span>
                    )}
                  </div>
                  <div className="bg-slate-800 p-6 text-center">
                    {typeof row.fintrack === 'boolean' ? (
                      row.fintrack ? (
                        <Check className="w-6 h-6 mx-auto text-green-400" />
                      ) : (
                        <X className="w-6 h-6 mx-auto text-red-400" />
                      )
                    ) : (
                      <span className="text-purple-400 font-semibold">{row.fintrack}</span>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                thousands of users
              </span>
            </h2>
            <p className="text-xl text-gray-400">Don't just take our word for it</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition"
              >
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{t.content}"</p>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-400">{t.role}</div>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple,{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                transparent pricing
              </span>
            </h2>
            <p className="text-xl text-gray-400">Choose the plan that's right for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 border-2 transition transform hover:scale-105 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 shadow-2xl shadow-purple-500/20'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-5xl font-bold mb-2">{plan.price}</div>
                  <div className="text-gray-400">{plan.period}</div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-4 rounded-full font-semibold transition ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to take control of your finances?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of users managing their money smarter with FinTrack.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-10 py-5 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
            >
              Start Your Free Trial
            </a>
            <button className="border-2 border-purple-400 px-10 py-5 rounded-full text-lg font-semibold hover:bg-purple-400/10 transition">
              Schedule a Demo
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-8 h-8 text-purple-400" />
                <span className="text-xl font-bold">FinTrack</span>
              </div>
              <p className="text-gray-400">
                Your intelligent financial management platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-purple-400 transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-purple-400 transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">GDPR</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 FinTrack. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
