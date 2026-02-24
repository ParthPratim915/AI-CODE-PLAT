import { runInDocker } from './dockerRunner';

export async function runPHP(code: string, tests: any[]) {
  return runInDocker('php', code, tests);
}
