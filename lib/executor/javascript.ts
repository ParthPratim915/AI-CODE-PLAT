import { runInDocker } from './dockerRunner';

export async function runJavaScript(code: string, tests: any[]) {
  return runInDocker('javascript', code, tests);
}