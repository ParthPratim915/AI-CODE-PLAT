'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  createQuestion,
  getQuestionsByTest,
  Question,
  updateQuestion,
  deleteQuestion,
} from '@/lib/questions';

export default function AdminQuestionsPage() {
  const router = useRouter();
  const { testId } = useParams<{ testId: string }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  /* ---------- EDIT STATE ---------- */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  /* ---------- CREATE STATE ---------- */
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  /* ---------- LOAD QUESTIONS ---------- */
  const loadQuestions = useCallback(async () => {
    if (!testId) return;

    setLoading(true);
    const data = await getQuestionsByTest(testId);
    setQuestions(data);
    setLoading(false);
  }, [testId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  /* ---------- CREATE QUESTION ---------- */
  const handleCreate = async () => {
    if (!testId || !newTitle.trim()) return;

    setCreating(true);

    await createQuestion({
      testId,
      title: newTitle.trim(),
      description: newDescription.trim(),
      type: 'coding',
      difficulty: 'easy',
      languages: ['javascript'],
      starterCode: {
        javascript: 'function solution() {\n  \n}',
      },
    });

    setNewTitle('');
    setNewDescription('');
    setCreating(false);

    await loadQuestions();
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await deleteQuestion(id);
    await loadQuestions();
  };

  /* ---------- START EDIT ---------- */
  const startEdit = (q: Question) => {
    if (!q.id) return;

    setEditingId(q.id);
    setEditTitle(q.title);
    setEditDescription(q.description);
  };

  /* ---------- SAVE EDIT ---------- */
  const saveEdit = async () => {
    if (!editingId) return;

    await updateQuestion(editingId, {
      title: editTitle,
      description: editDescription,
    });

    setEditingId(null);
    await loadQuestions();
  };

  if (loading) {
    return <div className="p-6">Loading questions…</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            Questions ({questions.length})
          </h1>
          <p className="text-sm text-gray-500">
            Manage questions for this test
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="btn-secondary"
          >
            ← Dashboard
          </button>

          <button
            onClick={() => router.push(`/test/${testId}`)}
            className="btn-secondary"
          >
            Preview Test
          </button>
        </div>
      </div>

      {/* CREATE FORM */}
      <div className="card space-y-3">
        <h2 className="font-semibold">Add Question</h2>

        <input
          className="input-field"
          placeholder="Question title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />

        <textarea
          className="input-field"
          placeholder="Question description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />

        <button
          onClick={handleCreate}
          disabled={creating || !newTitle.trim()}
          className="btn-primary"
        >
          {creating ? 'Creating…' : '+ Add Question'}
        </button>
      </div>

      {/* LIST */}
      {questions.length === 0 ? (
        <div className="text-gray-500 text-center p-8 border rounded bg-white">
          No questions added yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {questions.map((q, index) => (
            <li
              key={q.id}
              className="border p-4 rounded bg-white space-y-3 shadow-sm"
            >
              {editingId === q.id ? (
                <>
                  <input
                    className="input-field"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />

                  <textarea
                    className="input-field"
                    value={editDescription}
                    onChange={(e) =>
                      setEditDescription(e.target.value)
                    }
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="btn-primary"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      Q{index + 1}: {q.title}
                    </h3>

                    <p className="text-sm text-gray-600 mt-1">
                      {q.description}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(q)}
                      className="text-blue-600 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        q.id && handleDelete(q.id)
                      }
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
