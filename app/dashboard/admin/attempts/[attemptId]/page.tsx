'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export default function AttemptReviewPage() {
  const { attemptId } = useParams<{ attemptId: string }>();

  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttempt() {
      const snap = await getDoc(
        doc(firestore, 'testAttempts', attemptId)
      );

      if (snap.exists()) {
        setAttempt(snap.data());
      }

      setLoading(false);
    }

    loadAttempt();
  }, [attemptId]);

  if (loading) return <div className="p-6">Loading attempt...</div>;
  if (!attempt) return <div className="p-6">Attempt not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Submission Review</h1>

      <div className="card">
        <p>Status: {attempt.status}</p>
        <p>Score: {attempt.score}%</p>
        <p>Started: {attempt.startedAt}</p>
        <p>Completed: {attempt.completedAt}</p>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Output</h2>
        <pre className="bg-black text-green-400 p-3 rounded">
          {attempt.stdout || 'No output'}
        </pre>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Code Submitted</h2>
        <pre className="bg-gray-900 text-gray-100 p-3 rounded">
          {attempt.code || 'Not stored'}
        </pre>
      </div>
    </div>
  );
}
