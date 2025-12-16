import { spawn, SpawnOptions } from 'child_process';
import { createInterface } from 'readline';

export function spawnProcess(command: string, args: string[] = [], options?: SpawnOptions): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: false, ...(options ?? {}) });

    let stdout = '';
    let stderr = '';

    const rlOut = createInterface({ input: child.stdout });
    rlOut.on('line', (line) => {
      stdout += line + '\n';
    });

    const rlErr = createInterface({ input: child.stderr });
    rlErr.on('line', (line) => {
      stderr += line + '\n';
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Process exited with code ${code}\n${stderr}`));
      }
    });
  });
}