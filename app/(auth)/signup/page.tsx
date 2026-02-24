'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import Link from 'next/link';

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_CODE;

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<'candidate' | 'admin'>('candidate');
  const [adminCode, setAdminCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password || !confirmPassword || !name) {
        setError('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (role === 'admin' && adminCode !== ADMIN_CODE) {
        setError('Invalid Admin ID');
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(firestore, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email,
        role,
        createdAt: serverTimestamp(),
      });

      router.push(role === 'admin' ? '/dashboard/admin' : '/dashboard/candidate');
    } catch {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] text-[#171717] px-4 py-12 antialiased">
      <div className="mb-8 flex flex-col items-center">
        <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center mb-4 shadow-xl">
          <span className="text-white font-mono font-bold">AI</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-gray-500 mt-1">Join the next generation of code assessment</p>
      </div>

      <div className="max-w-[450px] w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        {/* ROLE SELECTOR - Segmented Control Style */}
        <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
          <button
            type="button"
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              role === 'candidate' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setRole('candidate')}
          >
            Candidate
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              role === 'admin' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setRole('admin')}
          >
            Administrator
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {role === 'admin' && (
            <div className="space-y-1.5 animate-in fade-in zoom-in duration-200">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500 ml-1">Admin Verification Code</label>
              <input
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                placeholder="Enter specialized access code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-500 ml-1">Full Name</label>
            <input
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-500 ml-1">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500 ml-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500 ml-1">Confirm</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-black hover:bg-gray-800 text-white font-medium rounded-lg text-sm transition-all active:scale-[0.98] disabled:opacity-70 shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating account...
              </>
            ) : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-500 pt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-black font-semibold hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </form>
      </div>
      
      <footer className="mt-8 text-gray-400 text-[10px] uppercase tracking-[0.2em] text-center max-w-[300px] leading-relaxed">
        By signing up, you agree to our terms of service and privacy policy.
      </footer>
    </div>
  );
}