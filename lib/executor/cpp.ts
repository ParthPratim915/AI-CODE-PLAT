import { runInDocker } from './dockerRunner';

export async function runCpp(code: string, tests: any[]) {
  return runInDocker('cpp', code, tests);
}
