'use client';

/**
 * Admin Login Page
 *
 * Allows ONLY admins to log in.
 * Non-admin users are immediately rejected and signed out.
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getCurrentUserProfile } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Email and password are required.');
        setLoading(false);
        return;
      }

      // 1️⃣ Authenticate with Firebase
      await signInWithEmailAndPassword(auth, email, password);

      // 2️⃣ Fetch Firestore profile
      const profile = await getCurrentUserProfile();

      // 3️⃣ HARD CHECK: must be admin
      if (!profile || profile.role !== 'admin') {
        await signOut(auth); // 🚨 force logout
        setError('Access denied. Admins only.');
        setLoading(false);
        return;
      }

      // 4️⃣ Success → admin dashboard
      router.push('/dashboard/admin');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials or insufficient permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-4">

        {/* Back button */}
        <button
          onClick={() => router.push('/login')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Login
        </button>

        <div className="bg-white shadow rounded p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-sm text-gray-600">
              Restricted access — admins only
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Sign in as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
