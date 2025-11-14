// app/page.tsx or pages/index.tsx (depending on your Next.js version)
import Link from 'next/link';
import { ArrowRight, TrendingUp, Upload, FileText } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">FinTrack</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-gray-700 hover:text-indigo-600 font-medium transition"
              >
                Log In
              </Link>
              <Link 
                href="/register"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your intelligent financial
            <span className="text-indigo-600"> management platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track expenses, analyze spending patterns, and make informed financial 
            decisions with ease. Take control of your finances today.
          </p>
          
          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/register"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition font-semibold text-lg border-2 border-indigo-600 flex items-center justify-center gap-2"
            >
              Sign In
            </Link>
          </div>

          {/* Demo Screenshot Placeholder */}
          <div className="mt-16 bg-white rounded-lg shadow-2xl p-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg h-96 flex items-center justify-center text-white">
              <div className="text-center">
                <p className="text-2xl font-semibold mb-2">Dashboard Preview</p>
                <p className="text-indigo-100">Screenshot of your dashboard goes here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon={<TrendingUp className="w-10 h-10 text-indigo-600" />}
            title="Real-Time Dashboard"
            description="Monitor your financial health with interactive charts and up-to-date metrics at a glance."
          />
          <FeatureCard
            icon={<Upload className="w-10 h-10 text-indigo-600" />}
            title="Easy Upload"
            description="Upload transaction data from various sources with our intelligent CSV import system."
          />
          <FeatureCard
            icon={<FileText className="w-10 h-10 text-indigo-600" />}
            title="Detailed Reports"
            description="Generate comprehensive financial reports and insights to understand your spending."
          />
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center bg-indigo-600 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Join thousands of users managing their money smarter.
          </p>
          <Link 
            href="/register"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg inline-flex items-center gap-2"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}