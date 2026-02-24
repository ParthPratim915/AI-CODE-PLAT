import { runInDocker } from './dockerRunner';

export async function runGo(code: string, tests: any[]) {
  return runInDocker('go', code, tests);
}
