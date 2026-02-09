/**
 * Integration tests for installed-check examples
 * This runs installed-check against the examples and validates the output
 * against expected output blocks in the README files using unified/remark
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { extractExpectedOutput, normalizeOutput } from './test-readme.js';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const cliPath = join(rootDir, 'cli-wrapper.cjs');

let failed = false;

/**
 * Run a command and return stdout/stderr
 *
 * @param {string} command
 * @returns {Promise<{code: number, output: string, stderr: string, stdout: string}>}
 */
async function run (command) {
  try {
    const { stderr, stdout } = await execAsync(command, { cwd: rootDir });
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

/**
 * Test helper
 *
 * @param {string} name
 * @param {() => Promise<void>} fn
 */
async function test (name, fn) {
  process.stdout.write(`  ${name} ... `);
  try {
    await fn();
    // eslint-disable-next-line no-console
    console.log('✓');
  } catch (/** @type {any} */ err) {
    // eslint-disable-next-line no-console
    console.log('✗');
    const errMessage = /** @type {string} */ (err.message || 'Unknown error');
    // eslint-disable-next-line no-console
    console.error(`    Error: ${errMessage}`);
    failed = true;
  }
}

/**
 * Assert helper
 *
 * @param {boolean} condition
 * @param {string} message
 */
function assert (condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// eslint-disable-next-line no-console
console.log('\nIntegration Tests\n');

// Test 1: Basic example - verify against README
// eslint-disable-next-line no-console
console.log('Basic Example:');

await test('output matches README expected output', async () => {
  const expectedOutput = await extractExpectedOutput(join(rootDir, 'examples/basic/README.md'));
  assert(expectedOutput !== undefined, 'Could not extract expected output from README');

  const result = await run(`node "${cliPath}" examples/basic`);
  const normalizedOutput = normalizeOutput(result.output);
  const normalizedExpected = normalizeOutput(/** @type {string} */ (expectedOutput));

  assert(
    normalizedOutput.includes(normalizedExpected) || normalizedOutput === normalizedExpected,
    `Output mismatch.\nExpected:\n${normalizedExpected}\n\nActual:\n${normalizedOutput}`
  );
});

// Test 2: Monorepo example - verify against README
// eslint-disable-next-line no-console
console.log('\nMonorepo Example:');

await test('workspace-a output matches README expected output', async () => {
  const expectedOutput = await extractExpectedOutput(join(rootDir, 'examples/monorepo/README.md'));

  // If there's no expected output in README, it means the example should pass cleanly
  if (expectedOutput === undefined) {
    const result = await run(`node "${cliPath}" examples/monorepo/packages/workspace-a`);
    assert(
      result.code === 0,
      `Expected clean run (exit code 0), got ${result.code} with output:\n${result.output}`
    );
    return;
  }

  const result = await run(`node "${cliPath}" examples/monorepo/packages/workspace-a`);
  const normalizedOutput = normalizeOutput(result.output);
  const normalizedExpected = normalizeOutput(/** @type {string} */ (expectedOutput));

  assert(
    normalizedOutput.includes(normalizedExpected) || normalizedOutput === normalizedExpected,
    `Output mismatch.\nExpected:\n${normalizedExpected}\n\nActual:\n${normalizedOutput}`
  );
});

await test('debug output shows parent workspace detection', async () => {
  const expectedDebug = await extractExpectedOutput(
    join(rootDir, 'examples/monorepo/packages/workspace-a/README.md'),
    'DEBUG OUTPUT'
  );
  assert(expectedDebug !== undefined, 'Could not extract expected debug output from README');

  const result = await run(`node "${cliPath}" --debug examples/monorepo/packages/workspace-a`);

  // Check that debug output contains the key messages
  assert(
    result.stderr.includes('Parent workspace detection: Attempting'),
    'Expected debug output to show parent workspace detection attempt'
  );
  assert(
    result.stderr.includes('Parent workspace detection: Found parent workspace root:'),
    'Expected debug output to show found parent workspace root'
  );
  assert(
    result.stderr.includes('Parent workspace detection: Using parent workspace root'),
    'Expected debug output to show using parent workspace root'
  );
});

await test('should exclude workspace root from checks', async () => {
  const result = await run(`node "${cliPath}" --debug examples/monorepo/packages/workspace-a`);
  assert(
    result.stderr.includes('includeWorkspaceRoot') && result.stderr.includes('false'),
    'Expected includeWorkspaceRoot to be false when using parent workspace'
  );
});

await test('should work with --no-parent-workspace flag', async () => {
  const result = await run(`node "${cliPath}" --debug --no-parent-workspace examples/monorepo/packages/workspace-a`);
  assert(
    result.stderr.includes('--no-parent-workspace flag is set'),
    'Expected to skip parent workspace detection when flag is set'
  );
  assert(
    result.stderr.includes('Skipped'),
    'Expected parent workspace detection to be skipped'
  );
});

await test('running from monorepo root matches README expected output', async () => {
  const expectedOutput = await extractExpectedOutput(
    join(rootDir, 'examples/monorepo/README.md'),
    'EXPECTED OUTPUT'
  );
  assert(expectedOutput !== undefined, 'Could not extract expected root output from README');

  const result = await run(`node "${cliPath}" examples/monorepo`);
  const normalizedOutput = normalizeOutput(result.output);
  const normalizedExpected = normalizeOutput(/** @type {string} */ (expectedOutput));

  assert(
    normalizedOutput.includes(normalizedExpected) || normalizedOutput === normalizedExpected,
    `Output mismatch.\nExpected:\n${normalizedExpected}\n\nActual:\n${normalizedOutput}`
  );
});

// eslint-disable-next-line no-console
console.log('');

if (failed) {
  // eslint-disable-next-line no-console
  console.log('Some tests failed\n');
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
} else {
  // eslint-disable-next-line no-console
  console.log('All tests passed\n');
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
}
