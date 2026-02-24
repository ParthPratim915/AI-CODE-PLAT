import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firestore } from './firebase';

export interface Question {
  id?: string;
  testId: string;
  title: string;
  description: string;
  type: 'coding';
  difficulty: 'easy' | 'medium' | 'hard';
  languages: string[];
  starterCode: Record<string, string>;
  createdAt?: any;
}

/* ---------------- CREATE ---------------- */
export async function createQuestion(data: Question) {
  return addDoc(collection(firestore, 'questions'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/* ---------------- READ ---------------- */
export async function getQuestionsByTest(testId: string): Promise<Question[]> {
  const q = query(
    collection(firestore, 'questions'),
    where('testId', '==', testId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Question),
  }));
}

/* ---------------- UPDATE ---------------- */
export async function updateQuestion(
  questionId: string,
  updates: Partial<Question>
) {
  const ref = doc(firestore, 'questions', questionId);
  await updateDoc(ref, updates);
}

/* ---------------- DELETE ---------------- */
export async function deleteQuestion(questionId: string) {
  const ref = doc(firestore, 'questions', questionId);
  await deleteDoc(ref);
}
