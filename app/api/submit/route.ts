import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

import { executeCode } from '@/lib/executor';
import { calculateScore } from '@/lib/executor/scoring';

type ExecResult = {
  results: { passed: boolean }[];
  stdout?: string;
  success?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { attemptId, code, tests, language } = body;

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Missing attemptId' },
        { status: 400 }
      );
    }

    /* ---------- Fetch attempt ---------- */
    const attemptRef = doc(firestore, 'testAttempts', attemptId);
    const snap = await getDoc(attemptRef);

    if (!snap.exists()) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    const attempt = snap.data();

    if (attempt.status === 'completed') {
      return NextResponse.json({
        error: 'Test already submitted.',
      });
    }

    /* ---------- Execute code ---------- */
    const execResult = (await executeCode(
      language || 'javascript',
      code,
      tests || []
    )) as ExecResult;

    const score = calculateScore(execResult.results || []);

    /* ---------- Lock attempt ---------- */
    await updateDoc(attemptRef, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      score: score.percentage,
    });

    return NextResponse.json({
      score,
      results: execResult.results,
      stdout: execResult.stdout,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    );
  }
}
