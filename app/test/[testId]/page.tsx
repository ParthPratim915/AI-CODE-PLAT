'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getQuestionsByTest, Question } from '@/lib/questions';

import CodeEditor from '@/components/editor/CodeEditor';
import LanguageSelector from '@/components/editor/LanguageSelector';
import { SupportedLanguage } from '@/components/editor/editor.types';
import { getStarterCode } from '@/lib/editorDefaults';

import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export default function CandidateTestPage() {
  const router = useRouter();
  const { testId } = useParams<{ testId: string }>();

  const [userId, setUserId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  /* Logic remains identical to your provided code */
  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserId(user.uid);
        const qs = await getQuestionsByTest(testId);
        setQuestions(qs);
        const testRef = doc(firestore, 'tests', testId);
        const testSnap = await getDoc(testRef);
        let timeLimit = 60;
        if (testSnap.exists()) {
          const testData = testSnap.data();
          timeLimit = testData.timeLimit || 60;
        }
        const startRes = await fetch('/api/attempt/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, testId, timeLimit }),
        });
        const startData = await startRes.json();
        setAttemptId(startData.attemptId);
        const res = await fetch('/api/progress/load', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, testId }),
        });
        const data = await res.json();
        if (data.payload) {
          setCodeMap(data.payload.codeMap || {});
          setCurrentIndex(data.payload.currentIndex || 0);
          setLanguage(data.payload.language || 'javascript');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [testId, router]);

  const runCode = async () => {
    setRunning(true);
    setOutput('Running...\n');
    try {
      const question = questions[currentIndex];
      const qid = question?.id || 'q';
      const code = codeMap[`${qid}_${language}`] ?? getStarterCode(question.starterCode, language);
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, input: '' }),
      });
      const result = await res.json();
      if (result.success) {
        setOutput(result.stdout || 'Program finished with no output.');
      } else {
        setOutput(result.stderr || 'Execution failed.');
      }
    } catch {
      setOutput('Execution error.');
    } finally {
      setRunning(false);
    }
  };

  const submitTest = useCallback(async () => {
    if (!userId) return;
    setSubmitting(true);
    setOutput('Submitting test...\n');
    try {
      const question = questions[currentIndex];
      const qid = question?.id || 'q';
      const code = codeMap[`${qid}_${language}`] ?? getStarterCode(question.starterCode, language);
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          testId,
          code,
          tests: (question as any)?.testCases || [],
        }),
      });
      const result = await res.json();
      if (result.error) {
        setOutput(result.error);
      } else {
        setOutput(`Submission complete.\nScore: ${result.score.percentage}%`);
      }
    } catch {
      setOutput('Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }, [userId, testId, questions, currentIndex, codeMap, language]);

  useEffect(() => {
    if (!attemptId) return;
    const interval = setInterval(async () => {
      const res = await fetch('/api/attempt/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId }),
      });
      const data = await res.json();
      if (data.remaining !== undefined) {
        setTimeLeft(data.remaining);
        if (data.remaining <= 0) {
          clearInterval(interval);
          submitTest();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [attemptId, submitTest]);

  useEffect(() => {
    if (!testId || !userId) return;
    const payload = { codeMap, currentIndex, language };
    fetch('/api/progress/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, testId, payload }),
    });
  }, [codeMap, currentIndex, language, testId, userId]);

  useEffect(() => {
    const onBlur = () => console.warn('Tab switch detected');
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
        <p className="text-white font-mono text-sm tracking-widest uppercase">Secure Environment Loading...</p>
      </div>
    </div>
  );

  if (error || questions.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white font-mono p-4">
      <div className="border border-red-500/30 bg-red-500/10 p-6 rounded-lg max-w-md">
         <span className="text-red-500 font-bold block mb-2 underline">SYSTEM_ERROR</span>
         {error || "No questions available in this buffer."}
      </div>
    </div>
  );

  const question = questions[currentIndex];
  const qid = question.id || 'q';
  const code = codeMap[`${qid}_${language}`] ?? getStarterCode(question.starterCode, language);
  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;
  const isTimeCritical = (timeLeft || 0) < 300; // 5 minutes

  return (
    <div className="h-screen flex flex-col bg-[#0d1117] text-[#c9d1d9] overflow-hidden antialiased">
      {/* Navbar / HUD */}
      <header className="h-14 border-b border-white/10 bg-[#161b22] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-white rounded flex items-center justify-center">
              <span className="text-black text-[10px] font-bold">AI</span>
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-[0.1em]">
  Test Terminal
</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="text-xs font-mono">
            <span className="text-gray-500">Question</span>
            <span className="text-white ml-2">{currentIndex + 1} / {questions.length}</span>
          </div>
        </div>

        {timeLeft !== null && (
          <div className={`px-4 py-1 rounded border font-mono text-sm flex items-center gap-2 transition-colors ${
            isTimeCritical ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-white'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
        )}
      </header>

      {/* Workspace */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Left: Instructions Panel */}
        <section className="w-[450px] flex flex-col border-r border-white/10 bg-[#0d1117]">
          <div className="flex-1 overflow-y-auto p-8 prose prose-invert max-w-none">
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Task {currentIndex + 1}</span>
              <h2 className="text-2xl font-bold text-white mt-1 leading-tight">{question.title}</h2>
            </div>
            <div className="text-sm leading-relaxed text-gray-400 space-y-4 font-sans whitespace-pre-wrap">
              {question.description}
            </div>
          </div>

          <div className="p-6 border-t border-white/10 bg-[#161b22] flex justify-between items-center shrink-0">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:text-white transition-colors"
            >
              ← Prev
            </button>
            <button
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="px-6 py-2 bg-white text-black rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </section>

        {/* Right: Code Environment */}
        <section className="flex-1 flex flex-col bg-[#0d1117]">
          
          {/* Tool Bar */}
          <div className="h-12 border-b border-white/10 bg-[#161b22] px-4 flex items-center justify-between shrink-0">
            <LanguageSelector value={language} onChange={setLanguage} />
            
            <div className="flex gap-2">
              <button
                onClick={runCode}
                disabled={running}
                className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {running ? <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Run Code
              </button>
              <button
                onClick={submitTest}
                disabled={submitting}
                className="px-4 py-1.5 bg-[#30363d] hover:bg-[#3fb950] hover:text-white text-gray-300 rounded text-xs font-bold transition-all disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Submit Test'}
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-hidden relative">
            <CodeEditor
              language={language}
              value={code}
              onChange={(val) =>
                val && setCodeMap((prev) => ({
                  ...prev,
                  [`${qid}_${language}`]: val,
                }))
              }
            />
          </div>

          {/* Terminal / Console */}
          <div className="h-[250px] border-t border-white/20 bg-[#010409] flex flex-col">
            <div className="h-8 border-b border-white/5 px-4 flex items-center bg-[#161b22]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Output Terminal</span>
            </div>
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
              {output ? (
                <pre className="text-green-500 leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                  {output}
                </pre>
              ) : (
                <span className="text-gray-600 italic">Execute code to see terminal output...</span>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}