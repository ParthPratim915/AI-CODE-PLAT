import { runInDocker } from './dockerRunner';

export async function executeCode(
  language: string,
  code: string,
  tests: any[]
) {
  const result = await runInDocker(language, code);

  return {
    success: result.success,
    stdout: result.stdout || '',
    results: tests?.length
      ? tests.map((t: any) => ({
          passed: result.stdout?.trim() === t.expected,
        }))
      : [],
  };
}
