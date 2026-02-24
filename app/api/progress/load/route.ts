import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  const { userId, testId } = await req.json();

  const snap = await getDoc(
    doc(firestore, 'testProgress', `${userId}_${testId}`)
  );

  if (!snap.exists()) {
    return NextResponse.json({ payload: null });
  }

  return NextResponse.json({ payload: snap.data().payload });
}
