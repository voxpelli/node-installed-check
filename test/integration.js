/**
 * Integration tests for installed-check examples
 * This runs installed-check against the examples and validates the output
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const cliPath = join(rootDir, 'cli-wrapper.cjs');

let failed = false;

/**
 * Run a command and return stdout/stderr
 *
 * @param {string} command
 * @returns {Promise<{code: number, stderr: string, stdout: string}>}
 */
async function run (command) {
  try {
    const { stderr, stdout } = await execAsync(command, { cwd: rootDir });
    return { code: 0, stderr, stdout };
  } catch (err) {
    return {
      code: err.code || 1,
      stderr: err.stderr || '',
      stdout: err.stdout || '',
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('✗');
    // eslint-disable-next-line no-console
    console.error(`    Error: ${err.message}`);
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

// Test 1: Basic example (may have suggestions but shouldn't crash)
// eslint-disable-next-line no-console
console.log('Basic Example:');
await test('should run without crashing', async () => {
  const result = await run(`node "${cliPath}" examples/basic`);
  // Exit code 1 means suggestions, which is OK for this test
  // Exit code > 1 would be a crash
  assert(result.code <= 1, `Expected exit code 0 or 1, got ${result.code}`);
});

// Test 2: Monorepo parent workspace detection
// eslint-disable-next-line no-console
console.log('\nMonorepo Example:');
await test('should detect parent workspace for workspace-a', async () => {
  const result = await run(`node "${cliPath}" --debug examples/monorepo/packages/workspace-a`);
  assert(
    result.stderr.includes('Parent workspace detection:'),
    'Expected parent workspace detection in debug output'
  );
  assert(
    result.stderr.includes('Found parent workspace root:'),
    'Expected to find parent workspace root'
  );
  // May have suggestions but shouldn't crash
  assert(result.code <= 1, `Expected exit code 0 or 1, got ${result.code}`);
});

await test('should detect parent workspace for workspace-b', async () => {
  const result = await run(`node "${cliPath}" --debug examples/monorepo/packages/workspace-b`);
  assert(
    result.stderr.includes('Parent workspace detection:'),
    'Expected parent workspace detection in debug output'
  );
  assert(
    result.stderr.includes('Found parent workspace root:'),
    'Expected to find parent workspace root'
  );
  // May have suggestions but shouldn't crash
  assert(result.code <= 1, `Expected exit code 0 or 1, got ${result.code}`);
});

await test('should exclude workspace root from checks', async () => {
  const result = await run(`node "${cliPath}" --debug examples/monorepo/packages/workspace-a`);
  assert(
    result.stderr.includes('includeWorkspaceRoot') && result.stderr.includes('false'),
    'Expected includeWorkspaceRoot to be false when using parent workspace'
  );
  // May have suggestions but shouldn't crash
  assert(result.code <= 1, `Expected exit code 0 or 1, got ${result.code}`);
});

await test('should work with --no-parent-workspace flag', async () => {
  const result = await run(`node "${cliPath}" --debug --no-parent-workspace examples/monorepo/packages/workspace-a`);
  assert(
    result.stderr.includes('--no-parent-workspace flag is set'),
    'Expected to skip parent workspace detection when flag is set'
  );
  // This will likely fail because dependencies aren't installed locally
  // but we're just testing that the flag works
  assert(
    result.stderr.includes('Skipped'),
    'Expected parent workspace detection to be skipped'
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
