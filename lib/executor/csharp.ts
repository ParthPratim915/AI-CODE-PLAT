import { runInDocker } from './dockerRunner';

export async function runCSharp(code: string, tests: any[]) {
  return runInDocker('csharp', code, tests);
}
