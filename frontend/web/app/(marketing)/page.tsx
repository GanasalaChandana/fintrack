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
  DollarSign,
  ChevronDown,
  Mail,
  Globe,
  Users,
  Zap,
  CreditCard
} from 'lucide-react';

export default function FinTrackLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      title: 'Smart CSV Import',
      description:
        'Import transactions from any bank with our intelligent CSV parser. Supports Chase, Bank of America, Wells Fargo, and more. Automatic categorization saves you hours of manual work.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Detailed Reports',
      description:
        'Generate comprehensive monthly, quarterly, and annual reports. Export to PDF or Excel for tax preparation. Custom date ranges and filtering options included.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Bank-Level Security',
      description:
        'Your data is encrypted with 256-bit SSL encryption. We never store your bank credentials. SOC 2 Type II certified with regular security audits.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      avatar: 'SJ',
      content:
        'FinTrack helped me identify $547 in unnecessary subscriptions. The automatic categorization is a lifesaver during tax season.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Designer',
      avatar: 'MC',
      content:
        'I used to spend 3 hours every month on expense tracking. Now it takes 5 minutes. The CSV import is incredibly smart.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Manager',
      avatar: 'ER',
      content:
        'Finally understand where my money goes! The visual reports make budgeting actually enjoyable. Worth every penny.',
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
      answer:
        'Absolutely. We use bank-level 256-bit SSL encryption for all data transmission and storage. We never store your bank login credentials - only transaction data you explicitly upload. Our platform is SOC 2 Type II certified and undergoes regular third-party security audits.'
    },
    {
      question: 'Which banks and file formats do you support?',
      answer:
        'We support CSV files from all major banks including Chase, Bank of America, Wells Fargo, Citibank, and Capital One. Our smart import system can automatically detect and parse different CSV formats. You can also manually map columns if your bank uses a custom format.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer:
        'Yes! There are no long-term contracts. You can cancel your subscription at any time from your account settings. If you cancel, you\'ll retain access until the end of your current billing period. Your data will be available for download for 30 days after cancellation.'
    },
    {
      question: 'Do you offer a free trial?',
      answer:
        'Yes! The Pro plan includes a 14-day free trial with full access to all features. No credit card required to start. The Free plan is available forever with basic features and up to 100 transactions per month.'
    },
    {
      question: 'Can I import historical transactions?',
      answer:
        'Absolutely. You can import transactions going back as far as your bank provides them. Most banks allow CSV exports for the past 1-2 years. There\'s no limit on historical data imports in paid plans.'
    },
    {
      question: 'Is there a mobile app?',
      answer:
        'Yes! FinTrack is available on iOS and Android. The mobile app syncs seamlessly with the web version, so you can track expenses on the go and view detailed reports on your desktop.'
    }
  ];

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert(`Thanks for subscribing! We'll send updates to ${email}`);
    setEmail('');
    setShowEmailCapture(false);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FinTrack
              </span>
            </a>

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
              <a href="#faq" className="hover:text-purple-400 transition">
                FAQ
              </a>
              <a href="/login?mode=signin" className="hover:text-purple-400 transition">
                Login
              </a>
              <a
                href="/login?mode=signup"
                className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105"
              >
                Get Started
              </a>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 hover:bg-purple-500/20 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 hover:bg-purple-500/20 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="block px-3 py-2 hover:bg-purple-500/20 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </a>
              <a
                href="#faq"
                className="block px-3 py-2 hover:bg-purple-500/20 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-semibold">
                  🚀 Join 2,500+ active users
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                Your intelligent{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  financial management
                </span>{' '}
                platform
              </h1>

              <p className="text-lg sm:text-xl text-gray-300">
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
                <button
                  onClick={() => setShowDemo(true)}
                  className="group border-2 border-purple-400 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-400/10 transition flex items-center justify-center"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-purple-400">2.5K+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-pink-400">$450K+</div>
                  <div className="text-xs sm:text-sm text-gray-400">Money Saved</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-cyan-400">4.9★</div>
                  <div className="text-xs sm:text-sm text-gray-400">User Rating</div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                🔒 Bank-level security • 📱 iOS & Android apps • 💳 No credit card required
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-purple-500/20 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Dashboard Overview</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                  <div className="bg-purple-500/20 rounded-xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-400">Balance</div>
                    <div className="text-lg sm:text-2xl font-bold">$12,450</div>
                  </div>
                  <div className="bg-green-500/20 rounded-xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-400">Income</div>
                    <div className="text-lg sm:text-2xl font-bold">$4,500</div>
                  </div>
                  <div className="bg-pink-500/20 rounded-xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-400">Expenses</div>
                    <div className="text-lg sm:text-2xl font-bold">$2,390</div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
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

      {/* Trust Bar */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-400 mb-8">Trusted by users from</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-60">
            <div className="flex items-center space-x-2">
              <Globe className="w-6 h-6" />
              <span className="font-semibold">Google</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6" />
              <span className="font-semibold">Microsoft</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6" />
              <span className="font-semibold">Amazon</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6" />
              <span className="font-semibold">Stripe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Powerful features for{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                smart finance management
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to take control of your finances in one intuitive platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-purple-500/20 hover:border-purple-500/50 transition transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div
                  className={`inline-block p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why choose FinTrack?</h2>
            <p className="text-lg sm:text-xl text-gray-400">
              See how we compare to traditional spreadsheets
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-500/20 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="p-4 sm:p-6 text-left" />
                  <th className="p-4 sm:p-6 text-center text-gray-400 font-semibold">
                    Spreadsheets
                  </th>
                  <th className="p-4 sm:p-6 text-center font-semibold text-purple-400">
                    FinTrack
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Automatic Categorization', spreadsheet: false, fintrack: true },
                  { feature: 'Real-time Analytics', spreadsheet: false, fintrack: true },
                  { feature: 'Mobile Access', spreadsheet: false, fintrack: true },
                  { feature: 'Bank-level Security', spreadsheet: false, fintrack: true },
                  { feature: 'Time to Setup', spreadsheet: 'Hours', fintrack: '2 mins' }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-purple-500/10">
                    <td className="p-4 sm:p-6 font-medium">{row.feature}</td>
                    <td className="p-4 sm:p-6 text-center">
                      {typeof row.spreadsheet === 'boolean' ? (
                        row.spreadsheet ? (
                          <Check className="w-6 h-6 mx-auto text-green-400" />
                        ) : (
                          <X className="w-6 h-6 mx-auto text-red-400" />
                        )
                      ) : (
                        <span className="text-gray-400">{row.spreadsheet}</span>
                      )}
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      {typeof row.fintrack === 'boolean' ? (
                        row.fintrack ? (
                          <Check className="w-6 h-6 mx-auto text-green-400" />
                        ) : (
                          <X className="w-6 h-6 mx-auto text-red-400" />
                        )
                      ) : (
                        <span className="text-purple-400 font-semibold">{row.fintrack}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                thousands of users
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400">Real results from real people</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-purple-500/20 hover:border-purple-500/50 transition"
              >
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                    {t.avatar}
                  </div>
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
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Simple,{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                transparent pricing
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 sm:p-8 border-2 transition transform hover:scale-105 ${
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
                  <div className="text-4xl sm:text-5xl font-bold mb-2">{plan.price}</div>
                  <div className="text-gray-400">{plan.period}</div>
                  {plan.savings && (
                    <div className="text-sm text-purple-400 mt-2">{plan.savings}</div>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm sm:text-base">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.name === 'Business' ? 'mailto:sales@fintrack.com' : '/register'}
                  className={`block w-full py-4 rounded-full font-semibold transition text-center ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {plan.cta}
                </a>
                {plan.highlighted && (
                  <p className="text-xs text-center text-gray-400 mt-4">
                    No credit card required • Cancel anytime
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400">
              Everything you need to know about FinTrack
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex justify-between items-center hover:bg-purple-500/5 transition"
                  aria-expanded={activeFaq === idx}
                >
                  <span className="text-left font-semibold text-base sm:text-lg">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 transition-transform flex-shrink-0 ml-4 ${
                      activeFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to take control of your finances?
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-8">
            Join 2,500+ users managing their money smarter with FinTrack.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
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
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
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
              <p className="text-gray-400 text-sm">
                Your intelligent financial management platform
              </p>
              <div className="flex items-center space-x-2 mt-4">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-500">SOC 2 Type II Certified</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
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
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    API Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
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
                    Press Kit
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@fintrack.com" className="hover:text-purple-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
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
                  <a href="#" className="hover:text-purple-400 transition">
                    GDPR
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition">
                    Data Processing
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 FinTrack. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="https://twitter.com"
                className="text-gray-400 hover:text-purple-400 transition"
                aria-label="Twitter"
              >
                Twitter
              </a>
              <a
                href="https://linkedin.com"
                className="text-gray-400 hover:text-purple-400 transition"
                aria-label="LinkedIn"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com"
                className="text-gray-400 hover:text-purple-400 transition"
                aria-label="GitHub"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDemo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              aria-label="Close demo"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Product Demo</h3>
            <p className="text-gray-400 mb-6">
              See FinTrack in action with our interactive demo video
            </p>

            <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center border border-purple-500/20">
              <div className="text-center">
                <Play className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">Demo video coming soon!</p>
                <p className="text-sm text-gray-500 mt-2">
                  In the meantime, try our free trial to explore all features
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <a
                href="/register"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-full text-center font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
              >
                Start Free Trial
              </a>
              <button
                onClick={() => setShowDemo(false)}
                className="flex-1 border-2 border-purple-400 px-6 py-3 rounded-full font-semibold hover:bg-purple-400/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEmailCapture(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEmailCapture(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-gray-400">
                Get the latest features, tips, and updates delivered to your inbox
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}