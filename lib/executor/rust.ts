import { runInDocker } from './dockerRunner';

export async function runRust(code: string, tests: any[]) {
  return runInDocker('rust', code, tests);
}
