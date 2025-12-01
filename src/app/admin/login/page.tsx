'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAdminToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success || data.token) {
        setAdminToken(data.token);
        await router.push('/admin/beagle-programs');
      } else {
        setError(data.error || data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-bricolage flex items-center justify-center px-4 relative overflow-hidden">
      {/* Huge beagle image - half visible on the right */}
      <img
        src="/images/bigbeagle.png"
        alt=""
        className="absolute -right-1/2 top-1/2 transform -translate-y-1/2 w-screen h-screen object-cover pointer-events-none"
      />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-beagle-dark text-center mb-2">
            Admin Login
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-beagle-dark mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beagle-orange disabled:bg-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-beagle-dark mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beagle-orange disabled:bg-gray-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-beagle-dark text-white font-semibold py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
