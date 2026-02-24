'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getCurrentUserProfile } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      const profile = await getCurrentUserProfile();

      if (!profile) {
        setError('User profile not found. Please contact support.');
        return;
      }

      if (profile.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/candidate');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const errorCode = (err as { code: string }).code;
        setError(getErrorMessage(errorCode));
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password.';
      case 'auth/invalid-email': return 'Invalid email address.';
      case 'auth/too-many-requests': return 'Too many attempts. Try later.';
      default: return 'Failed to sign in.';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] text-[#171717] px-4 antialiased">
      {/* Subtle Logo/Brand Area */}
      <div className="mb-8 flex flex-col items-center">
        <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center mb-4 shadow-xl">
          <span className="text-white font-mono font-bold">AI</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your credentials to access the platform</p>
      </div>

      <div className="max-w-[400px] w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-4 py-3 rounded-lg flex items-center animate-in fade-in zoom-in duration-200">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500 ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black placeholder:text-gray-400"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-medium uppercase tracking-wider text-gray-400">Password</label>
                <Link href="#" className="text-[11px] text-gray-400 hover:text-black transition-colors">Forgot?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-black hover:bg-gray-800 text-white font-medium rounded-lg text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Authenticating...
              </span>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-black font-semibold hover:underline underline-offset-4">
                Sign up free
              </Link>
            </p>
            <Link href="/admin-login" className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors italic">
              Access admin terminal
            </Link>
        </div>
      </div>
      
      {/* Footer Decoration */}
      <footer className="mt-12 text-gray-400 text-[11px] uppercase tracking-[0.2em]">
        Secured by AI-Code Systems © 2026
      </footer>
    </div>
  );
}