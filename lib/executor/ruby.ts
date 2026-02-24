import { runInDocker } from './dockerRunner';

export async function runRuby(code: string, tests: any[]) {
  return runInDocker('ruby', code, tests);
}
