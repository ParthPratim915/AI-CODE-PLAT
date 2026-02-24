import { runInDocker } from './dockerRunner';

export async function runPython(code: string, tests: any[]) {
  return runInDocker('python', code, tests);
}
