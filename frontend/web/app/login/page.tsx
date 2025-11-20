'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const isSubmitting = useRef(false);

  // Check URL params for mode
  useEffect(() => {
    const modeParam = searchParams?.get('mode');
    if (modeParam === 'signup' || modeParam === 'signin') {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (mode === 'signup') {
      if (!formData.name || formData.name.trim().length < 2) {
        setError('Please enter your full name');
        return false;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Prevent duplicate submissions
    if (loading || isSubmitting.current) return;

    setError('');

    if (!validateForm()) return;

    console.log(`🚀 ${mode.toUpperCase()} ATTEMPT:`, new Date().toISOString());
    
    setLoading(true);
    isSubmitting.current = true;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      
      console.log('📤 Sending request to:', `${API_URL}${endpoint}`);
      
      const requestBody = mode === 'signin' 
        ? {
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
          }
        : {
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);

      if (response.status === 429) {
        throw new Error('Too many attempts. Please wait 2-3 minutes and try again.');
      }

      if (!response.ok) {
        let errorMessage = mode === 'signin' ? 'Login failed' : 'Registration failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Success:', { hasToken: !!data.token, hasUser: !!data.user });

      if (data.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token);
          
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }

        setSuccess(true);

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        throw new Error('No authentication token received');
      }

    } catch (err) {
      console.error('❌ Error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('too many')) {
        setError('⏳ Too many attempts. Please wait 2-3 minutes before trying again.');
      } else if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('invalid')) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (errorMessage.includes('409') || errorMessage.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (errorMessage.includes('404')) {
        setError('Authentication service not available. Please try again later.');
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    // Update URL without page reload
    router.push(`/login?mode=${newMode}`, { scroll: false });
  };

  // Success State
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/20 p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            {mode === 'signin' ? 'Welcome back!' : 'Account created!'}
          </h2>
          <p className="text-gray-300 mb-6">
            {mode === 'signin' 
              ? 'Login successful. Redirecting to your dashboard...' 
              : 'Your account has been created successfully. Redirecting...'}
          </p>
          <div className="flex items-center justify-center gap-3 text-purple-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-semibold">Loading your account</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <DollarSign className="w-10 h-10 text-purple-400 group-hover:scale-110 transition" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              FinTrack
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-gray-400">
            {mode === 'signin' 
              ? 'Sign in to continue to your dashboard' 
              : 'Start managing your finances smarter'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/20 p-8">
          {/* Mode Switcher */}
          <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-purple-500/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-purple-500/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-purple-500/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              )}
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-purple-500/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password (Sign In Only) */}
            {mode === 'signin' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-purple-500 bg-slate-900 border-purple-500/20 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-gray-400">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-purple-400 hover:text-purple-300 font-medium">
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 rounded-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Terms (Sign Up Only) */}
          {mode === 'signup' && (
            <p className="text-xs text-gray-500 text-center mt-4">
              By signing up, you agree to our{' '}
              <a href="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
            </p>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Fast Setup</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Encrypted</span>
          </div>
        </div>

        {/* Debug Info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-purple-500/20 text-xs text-gray-400">
            <p className="font-semibold mb-2 text-purple-400">🔧 Debug Info:</p>
            <p>• API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}</p>
            <p>• Mode: {mode}</p>
            <p>• Check console (F12) for detailed logs</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function UnifiedAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}