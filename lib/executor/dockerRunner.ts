import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

export async function runInDocker(
  language: string,
  code: string
) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'exec-'));
  const filePath = path.join(tmpDir, 'main.txt');

  await fs.writeFile(filePath, code);

  return new Promise<any>((resolve) => {
    const proc = spawn('docker', [
      'run',
      '--rm',
      '-v',
      `${tmpDir}:/code`,
      'code-runner',
      language,
    ]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', d => (stdout += d.toString()));
    proc.stderr.on('data', d => (stderr += d.toString()));

    proc.on('close', () => {
      resolve({
        success: !stderr,
        stdout,
        stderr,
      });
    });
  });
}
