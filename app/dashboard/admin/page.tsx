'use client';

/**
 * Admin Dashboard page
 *
 * Admin interface for creating and managing coding tests.
 */

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { auth, firestore } from '@/lib/firebase';
import {
  getCurrentUser,
  getCurrentUserProfile,
  isAdmin,
} from '@/lib/auth';

interface Test {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  createdBy: string;
  createdAt: Timestamp;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<{ email: string; name: string } | null>(
    null
  );
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ---------- FORM STATE ---------- */
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState<number>(60);

  /* ---------- LOAD TESTS ---------- */
  const loadTests = useCallback(async (adminId: string) => {
    const testsQuery = query(
      collection(firestore, 'tests'),
      where('createdBy', '==', adminId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(testsQuery);

    const loadedTests: Test[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        timeLimit: data.timeLimit,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
      };
    });

    setTests(loadedTests);
  }, []);

  /* ---------- LOAD DASHBOARD ---------- */
  const loadDashboardData = useCallback(
    async (adminId: string) => {
      try {
        setLoading(true);
        setError(null);

        const profile = await getCurrentUserProfile();
        if (profile) {
          setUser({ email: profile.email, name: 'Admin' });
        }

        await loadTests(adminId);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    },
    [loadTests]
  );

  /* ---------- ADMIN GUARD ---------- */
  const guardAdmin = useCallback(async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      router.push('/login');
      return;
    }

    const allowed = await isAdmin();
    if (!allowed) {
      router.push('/dashboard/candidate');
      return;
    }

    await loadDashboardData(currentUser.uid);
  }, [router, loadDashboardData]);

  useEffect(() => {
    guardAdmin();
  }, [guardAdmin]);

  /* ---------- CREATE TEST ---------- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!title.trim()) {
        setError('Test title is required.');
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Not authenticated.');
        return;
      }

      await addDoc(collection(firestore, 'tests'), {
        title: title.trim(),
        description: description.trim(),
        timeLimit,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setSuccess(`Test "${title}" created successfully.`);
      setTitle('');
      setDescription('');
      setTimeLimit(60);

      await loadTests(currentUser.uid);
    } catch {
      setError('Failed to create test.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- LOGOUT ---------- */
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const formatDate = (timestamp: Timestamp) =>
    timestamp?.toDate().toLocaleString() ?? 'N/A';

  if (loading) {
    return <p className="p-10">Loading admin dashboard…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {user && (
            <p className="text-sm text-gray-600">
              Welcome, {user.email}
            </p>
          )}
        </div>

        <button onClick={handleLogout} className="btn-secondary">
          Sign Out
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CREATE TEST */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Create Test</h2>

          {error && <p className="text-red-600 mb-2">{error}</p>}
          {success && <p className="text-green-600 mb-2">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="input-field"
              placeholder="Test title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="input-field"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="number"
              min={1}
              max={480}
              className="input-field"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            />

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? 'Creating…' : 'Create Test'}
            </button>
          </form>
        </div>

        {/* TEST LIST */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            Your Tests ({tests.length})
          </h2>

          {tests.length === 0 ? (
            <p className="text-gray-500">No tests created yet.</p>
          ) : (
            <ul className="space-y-3">
              {tests.map((test) => (
                <li key={test.id} className="border p-3 rounded bg-white">
                  <h3 className="font-semibold">{test.title}</h3>

                  <p className="text-sm text-gray-600">
                    {test.description}
                  </p>

                  <p className="text-xs text-gray-500 mb-3">
                    {test.timeLimit} min · {formatDate(test.createdAt)}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        router.push(`/test/${test.id}`)
                      }
                      className="btn-secondary text-sm"
                    >
                      Open Test
                    </button>

                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/admin/tests/${test.id}/questions`
                        )
                      }
                      className="btn-primary text-sm"
                    >
                      Manage Questions
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
