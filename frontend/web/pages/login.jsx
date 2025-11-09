import { useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('🔐 Attempting login with:', email);
      
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let msg = 'Login failed';
        try {
          const j = JSON.parse(text);
          msg = j.message || msg;
        } catch {
          if (res.status === 401) msg = 'Invalid email or password';
        }
        throw new Error(msg);
      }

      const data = await res.json();
      console.log('✅ Login response:', data);

      if (!data.token) {
        console.error('❌ No token in response!');
        throw new Error('No authentication token received from server');
      }

      // Save token as 'authToken'
      console.log('💾 Saving token to localStorage as authToken...');
      localStorage.setItem('authToken', data.token);
      
      // Also save user info
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Verify token was saved
      const savedToken = localStorage.getItem('authToken');
      console.log('✅ Token saved:', savedToken ? 'YES' : 'NO');
      console.log('🔍 Verify token:', savedToken?.substring(0, 20) + '...');
      
      if (!savedToken) {
        throw new Error('Failed to save authentication token');
      }

      // Navigate to dashboard
      console.log('🚀 Redirecting to dashboard...');
      router.replace('/dashboard');
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Unable to login');
    } finally {
      setBusy(false);
    }
  }

  async function createDemoUser() {
    try {
      setBusy(true);
      setError('');
      setSuccessMessage('');
      
      // Generate random demo user
      const rand = Math.floor(Math.random() * 900000) + 100000;
      const demoEmail = `user${rand}@test.com`;
      const demoPass = 'Test1234!';

      console.log('📝 Creating demo user:', demoEmail);

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: demoEmail, 
          password: demoPass 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await res.json();
      console.log('✅ Registration successful:', data);

      // Auto-fill the form with demo credentials
      setEmail(demoEmail);
      setPassword(demoPass);
      
      // Show success message with credentials
      setSuccessMessage(
        `✅ Demo user created successfully!\n\nEmail: ${demoEmail}\nPassword: ${demoPass}\n\nCredentials have been auto-filled. Click "Sign in" to continue.`
      );
      
      // If registration returns a token, save it and redirect
      if (data.token) {
        console.log('💾 Registration returned token, saving...');
        localStorage.setItem('authToken', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Give user time to see the message, then redirect
        setTimeout(() => {
          console.log('🚀 Redirecting to dashboard...');
          router.replace('/dashboard');
        }, 1500);
      }
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FinTrack</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm whitespace-pre-line">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {busy ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={createDemoUser}
            disabled={busy}
            className="mt-6 w-full rounded-lg bg-gray-100 text-gray-700 font-semibold py-3 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all border border-gray-300"
          >
            {busy ? 'Creating...' : '🎯 Create Demo Account'}
          </button>
          
          <p className="mt-4 text-center text-xs text-gray-500">
            Creates a test account with random credentials
          </p>
        </div>
      </div>
    </div>
  );
}