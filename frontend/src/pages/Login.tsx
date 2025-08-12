import { FormEvent, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await login(email, password);
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 p-10 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">SB</div>
            <span className="text-2xl font-semibold tracking-tight">SyncBoard</span>
          </div>
          <p className="mt-6 max-w-md text-indigo-50/90">
            Real-time collaborative boards with AI assistance, offline-first resilience, and analytics.
          </p>
        </div>
        <div className="text-indigo-50/70 text-sm">© {new Date().getFullYear()} SyncBoard, Inc.</div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">Sign in to SyncBoard</h1>
            <p className="mt-2 text-sm text-gray-600">Welcome back. Please enter your details.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            No account?{' '}
            <Link className="font-medium text-indigo-600 hover:text-indigo-700" to="/register">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}