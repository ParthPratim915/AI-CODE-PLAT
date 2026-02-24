import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function runC(code: string, tests: any[]) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'c-'));
  const src = path.join(tmpDir, 'main.c');
  const out = path.join(tmpDir, 'main');

  await fs.writeFile(src, code);

  return new Promise((resolve) => {
    const compile = spawn('gcc', [src, '-o', out]);

    compile.on('close', () => {
      const proc = spawn(out);

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (d) => (stdout += d.toString()));
      proc.stderr.on('data', (d) => (stderr += d.toString()));

      proc.on('close', () => {
        resolve({
          success: !stderr,
          stdout,
          stderr,
          results: [],
        });
      });
    });
  });
}
