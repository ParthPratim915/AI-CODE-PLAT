'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import Link from 'next/link';

interface Test {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  createdBy: string;
  createdAt: any;
}

interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  status: 'completed' | 'in-progress' | 'not-started';
  score?: number;
  startedAt: string;
  completedAt?: string;
}

export default function CandidateDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<{
    email: string;
    name: string;
  } | null>(null);

  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [testHistory, setTestHistory] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const profile = await getUserProfile(currentUser.uid);
      const fallbackName = currentUser.email?.split('@')[0] || 'User';

      setUser({
        email: profile?.email || currentUser.email || '',
        name: (profile as any)?.name || fallbackName,
      });

      await loadAvailableTests(currentUser.uid);
      await loadTestHistory(currentUser.uid);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadAvailableTests = async (userId: string) => {
    const testsQuery = query(
      collection(firestore, 'tests'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(testsQuery);
    const tests: Test[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      tests.push({
        id: doc.id,
        title: data.title || 'Untitled Test',
        description: data.description || '',
        timeLimit: data.timeLimit || 60,
        createdBy: data.createdBy || '',
        createdAt: data.createdAt,
      });
    });
    setAvailableTests(tests);
  };

  const loadTestHistory = async (userId: string) => {
    const attemptsQuery = query(
      collection(firestore, 'testAttempts'),
      where('userId', '==', userId),
      orderBy('startedAt', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(attemptsQuery);
    const attempts: TestAttempt[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      attempts.push({
        id: doc.id,
        testId: data.testId || '',
        testTitle: data.testTitle || 'Unknown Test',
        status: data.status || 'not-started',
        score: data.score,
        startedAt: data.startedAt || '',
        completedAt: data.completedAt,
      });
    });
    setTestHistory(attempts);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const formatDate = (dateString: string) =>
    dateString ? new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
      <p className="text-sm font-medium text-gray-500">Initializing your workspace...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] antialiased">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-black rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold font-mono">AI</span>
          </div>
          <span className="font-semibold tracking-tight">Terminal</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-bold">Candidate</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-xs font-semibold px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Workspace</h1>
          <p className="text-gray-500 mt-2">Manage your active assessments and view performance history.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: Available Tests */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Available Tests</h2>
              <span className="px-2 py-0.5 bg-black text-white text-[10px] rounded-full">{availableTests.length}</span>
            </div>

            {availableTests.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                <p className="text-sm text-gray-400 font-medium">No tests currently assigned to you.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {availableTests.map((test) => (
                  <div key={test.id} className="group bg-white border border-gray-200 p-6 rounded-xl hover:border-black transition-all shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-black transition-colors">{test.title}</h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{test.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           {test.timeLimit} mins
                        </span>
                      </div>
                      <Link
                        href={`/test/${test.id}`}
                        className="text-xs font-bold py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                      >
                        Launch Test
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: Test History */}
          <section className="lg:col-span-5 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Activity History</h2>
            
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {testHistory.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">No recent activity detected.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {testHistory.map((attempt) => (
                    <div key={attempt.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold truncate pr-4">{attempt.testTitle}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${
                          attempt.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {attempt.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[11px] text-gray-400 font-medium italic">{formatDate(attempt.startedAt)}</span>
                        {attempt.score !== undefined ? (
                          <span className="text-sm font-mono font-bold bg-gray-100 px-2 py-1 rounded">
                            {attempt.score}%
                          </span>
                        ) : attempt.status === 'in-progress' && (
                          <Link href={`/test/${attempt.testId}`} className="text-[11px] font-bold text-black hover:underline underline-offset-4">
                            Resume →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Stats Mini-Card */}
            <div className="bg-black rounded-xl p-6 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Avg Performance</p>
                <p className="text-2xl font-mono font-bold mt-1">
                  {testHistory.length > 0 ? (testHistory.reduce((acc, curr) => acc + (curr.score || 0), 0) / testHistory.length).toFixed(1) : '--'}%
                </p>
              </div>
              <div className="h-10 w-10 border border-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}