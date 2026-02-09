/**
 * Test helper functions for integration tests
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Run a command and return stdout/stderr
 *
 * @param {string} command
 * @param {object} options
 * @param {string} options.cwd
 * @returns {Promise<{code: number, output: string, stderr: string, stdout: string}>}
 */
export async function run (command, options) {
  try {
    const { stderr, stdout } = await execAsync(command, options);
    return { code: 0, output: stdout + stderr, stderr, stdout };
  } catch (/** @type {any} */ err) {
    const errCode = /** @type {number} */ (err.code || 1);
    const errStdout = /** @type {string} */ (err.stdout || '');
    const errStderr = /** @type {string} */ (err.stderr || '');
    return {
      code: errCode,
      output: errStdout + errStderr,
      stderr: errStderr,
      stdout: errStdout,
    };
  }
}
