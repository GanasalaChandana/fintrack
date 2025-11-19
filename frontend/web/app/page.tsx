'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Upload, FileText, Shield, Clock, Users, Check, Star, Menu, X } from 'lucide-react';

// Sample dashboard data
const expenseData = [
  { month: 'Jan', expenses: 2400, income: 4000 },
  { month: 'Feb', expenses: 2210, income: 3800 },
  { month: 'Mar', expenses: 2900, income: 4200 },
  { month: 'Apr', expenses: 2600, income: 4100 },
  { month: 'May', expenses: 2800, income: 4300 },
  { month: 'Jun', expenses: 2500, income: 4500 },
];

const categoryData = [
  { name: 'Food', value: 1200, color: '#667eea' },
  { name: 'Transport', value: 800, color: '#764ba2' },
  { name: 'Shopping', value: 1500, color: '#f093fb' },
  { name: 'Bills', value: 900, color: '#4facfe' },
];

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefit: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}

const FinTrackLanding: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'demo', 'pricing', 'testimonials'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features: Feature[] = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Real-Time Dashboard",
      description: "Monitor your financial health with interactive charts and live metrics.",
      benefit: "Make informed decisions instantly with up-to-the-minute insights"
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Smart CSV Upload",
      description: "Import transactions from any bank in seconds with AI-powered parsing.",
      benefit: "Save 15+ hours monthly on manual data entry"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Detailed Reports",
      description: "Generate comprehensive financial reports with one click.",
      benefit: "Identify wasteful spending and save an average of 18% monthly"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Level Security",
      description: "256-bit encryption and secure cloud storage protect your data.",
      benefit: "Sleep soundly knowing your financial data is fortress-protected"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Automated Tracking",
      description: "Set it and forget it - automatic transaction categorization.",
      benefit: "Track expenses in under 2 minutes per day"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-User Support",
      description: "Collaborate with family members or team on shared budgets.",
      benefit: "Perfect for households managing finances together"
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "FinTrack helped me identify $800/month in unnecessary subscriptions. The ROI was instant!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Freelance Designer",
      content: "As a freelancer, tracking expenses was a nightmare. FinTrack made it effortless. I save 10+ hours monthly.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Manager",
      content: "The dashboard gives me a clear picture of where my money goes. I've saved 22% on monthly expenses!",
      rating: 5
    }
  ];

  const pricingTiers: PricingTier[] = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      features: [
        "Up to 100 transactions/month",
        "Basic dashboard & charts",
        "Manual CSV upload",
        "Email support",
        "1 account connection"
      ]
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      highlighted: true,
      features: [
        "Unlimited transactions",
        "Advanced analytics & AI insights",
        "Automatic bank sync",
        "Priority support",
        "Up to 5 account connections",
        "Custom categories & tags",
        "Export to Excel/PDF"
      ]
    },
    {
      name: "Business",
      price: "$29.99",
      period: "per month",
      features: [
        "Everything in Pro",
        "Multi-user access (up to 10)",
        "Team collaboration tools",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "White-label reports"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              <TrendingUp className="inline-block w-6 h-6 mr-2 text-purple-600" />
              FinTrack
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition">Features</a>
              <a href="#demo" className="text-gray-700 hover:text-purple-600 transition">Demo</a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition">Reviews</a>
              <button className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition">
                Sign In
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition">
                Start Free Trial
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-purple-600">Features</a>
              <a href="#demo" className="block text-gray-700 hover:text-purple-600">Demo</a>
              <a href="#pricing" className="block text-gray-700 hover:text-purple-600">Pricing</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-purple-600">Reviews</a>
              <button className="w-full px-4 py-2 text-purple-600 border border-purple-600 rounded-lg">
                Sign In
              </button>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg">
                Start Free Trial
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                🎉 Trusted by 50,000+ users worldwide
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Your Intelligent
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Financial </span>
                Management Platform
              </h1>
              <p className="text-xl text-gray-600">
                Track expenses, analyze spending patterns, and make informed financial decisions. 
                Save an average of <span className="font-bold text-purple-600">18% monthly</span> and reclaim 
                <span className="font-bold text-purple-600"> 15+ hours</span> with automated insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition transform hover:-translate-y-1">
                  Start Your Free Trial
                  <span className="block text-sm font-normal mt-1">No credit card required</span>
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 rounded-lg text-lg font-semibold border-2 border-gray-200 hover:border-purple-600 hover:text-purple-600 transition">
                  Watch Demo (2 min)
                </button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">4.9/5 from 2,300+ reviews</p>
                </div>
              </div>
            </div>

            {/* Hero Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Financial Overview</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Balance</p>
                    <p className="text-2xl font-bold text-purple-600">$24,580</p>
                    <p className="text-xs text-green-600 mt-1">↑ 12.5% this month</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Monthly Savings</p>
                    <p className="text-2xl font-bold text-blue-600">$1,850</p>
                    <p className="text-xs text-green-600 mt-1">↑ 18% vs last month</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="income" stroke="#667eea" strokeWidth={3} />
                    <Line type="monotone" dataKey="expenses" stroke="#f093fb" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Floating stats */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4 transform hover:scale-110 transition">
                <p className="text-xs text-gray-600">Subscriptions Found</p>
                <p className="text-2xl font-bold text-red-500">12</p>
                <p className="text-xs text-red-500">$347/month saved</p>
              </div>
              
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4 transform hover:scale-110 transition">
                <p className="text-xs text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-green-500">15.2h</p>
                <p className="text-xs text-green-500">This month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white py-8 border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-purple-600">50K+</p>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">2.5M+</p>
              <p className="text-gray-600">Transactions Tracked</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">$45M+</p>
              <p className="text-gray-600">Money Saved</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">99.9%</p>
              <p className="text-gray-600">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Smarter Finance</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to take complete control of your financial future
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm text-purple-700 font-medium">✨ {feature.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">See FinTrack in Action</h2>
            <p className="text-xl opacity-90">Interactive dashboard with real-time data</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Expense Chart */}
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">Income vs Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="month" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#4ade80" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#f87171" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: $${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you need more power</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx}
                className={`relative bg-white p-8 rounded-2xl shadow-lg ${
                  tier.highlighted ? 'ring-4 ring-purple-500 transform scale-105' : ''
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-gray-600"> /{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    tier.highlighted 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {tier.price === 'Free' ? 'Get Started' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-xl text-gray-600">See what our users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex text-yellow-400 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Is my financial data secure?",
                a: "Absolutely. We use bank-level 256-bit encryption, and your data is stored in secure, SOC 2 compliant data centers. We never sell your data to third parties."
              },
              {
                q: "Can I connect my bank account?",
                a: "Yes! Pro and Business plans support automatic bank syncing through secure partnerships with leading financial institutions."
              },
              {
                q: "What file formats can I upload?",
                a: "We support CSV, Excel (XLSX/XLS), and direct bank exports. Our AI automatically detects and maps your transaction columns."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time with no penalties. Your data remains accessible for 30 days after cancellation."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Finances?</h2>
          <p className="text-xl mb-8 opacity-90">Join 50,000+ users saving money and time with FinTrack</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-purple-600 rounded-lg text-lg font-semibold hover:shadow-2xl transition transform hover:-translate-y-1">
              Start Your Free Trial
              <span className="block text-sm font-normal mt-1">No credit card required • Cancel anytime</span>
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-purple-600 transition">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                <TrendingUp className="inline-block w-5 h-5 mr-2" />
                FinTrack
              </h3>
              <p className="text-gray-400">Your intelligent financial management platform</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 FinTrack. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition">GitHub</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FinTrackLanding;