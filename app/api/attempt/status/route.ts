import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const { attemptId } = await req.json();

    const snap = await getDoc(
      doc(firestore, 'testAttempts', attemptId)
    );

    if (!snap.exists()) {
      return NextResponse.json({ error: 'Attempt not found' });
    }

    const data = snap.data();

    const startedAt = data.startedAt.toDate().getTime();
    const duration = data.durationSec;

    const now = Date.now();
    const elapsed = Math.floor((now - startedAt) / 1000);

    const remaining = Math.max(duration - elapsed, 0);

    return NextResponse.json({ remaining });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
