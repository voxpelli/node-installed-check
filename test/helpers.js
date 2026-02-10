import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// Strip ANSI color codes from outputs for consistent assertions
// eslint-disable-next-line no-control-regex
export const stripAnsi = (/** @type {string} */ s) => s.replaceAll(/\u001B\[[0-9;]*m/g, '');

/**
 * Run a command and return stdout/stderr
 *
 * @param {string} command
 * @param {string | {cwd: string}} cwdOrOptions - Either a string cwd path or options object
 * @returns {Promise<{code: number, output: string, stderr: string, stdout: string}>}
 */
export async function run (command, cwdOrOptions) {
  const options = typeof cwdOrOptions === 'string' ? { cwd: cwdOrOptions } : cwdOrOptions;

  try {
    const { stderr, stdout } = await execAsync(command, options);
    return { code: 0, output: stripAnsi(stdout + stderr), stderr: stripAnsi(stderr), stdout: stripAnsi(stdout) };
  } catch (/** @type {any} */ err) {
    const errCode = /** @type {number} */ (err.code || 1);
    const errStdout = /** @type {string} */ (err.stdout || '');
    const errStderr = /** @type {string} */ (err.stderr || '');

    return {
      code: errCode,
      output: stripAnsi(errStdout + errStderr),
      stderr: stripAnsi(errStderr),
      stdout: stripAnsi(errStdout),
    };
  }
}
