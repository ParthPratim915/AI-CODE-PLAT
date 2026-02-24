import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, testId } = body;

  const attemptsRef = collection(firestore, 'testAttempts');

  const q = query(
    attemptsRef,
    where('userId', '==', userId),
    where('testId', '==', testId)
  );

  const snapshot = await getDocs(q);

  /* Existing attempt */
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();

    /* Step 3: block completed attempts */
    if (data.status === 'completed') {
      return NextResponse.json({
        attemptId: docSnap.id,
        remaining: 0,
        locked: true,
      });
    }

    return NextResponse.json({
      attemptId: docSnap.id,
      remaining: data.remaining || 0,
    });
  }

  /* Create new attempt */
  const newAttempt = await addDoc(attemptsRef, {
    userId,
    testId,
    status: 'in-progress',
    startedAt: new Date().toISOString(),
    remaining: 0,
  });

  return NextResponse.json({
    attemptId: newAttempt.id,
    remaining: 0,
  });
}
