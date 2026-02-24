import { runInDocker } from './dockerRunner';

export async function runJava(code: string, tests: any[]) {
  return runInDocker('java', code, tests);
}
