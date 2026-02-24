import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  const { userId, testId, payload } = await req.json();

  if (!userId || !testId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  await setDoc(
    doc(firestore, 'testProgress', `${userId}_${testId}`),
    {
      userId,
      testId,
      payload,
      updatedAt: Date.now(),
    },
    { merge: true }
  );

  return NextResponse.json({ success: true });
}
