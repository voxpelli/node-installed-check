/**
 * Integration tests for installed-check examples
 * This runs installed-check against the examples and validates the output
 * against expected output blocks in the README files using unified/remark
 */

import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

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
  } catch (err) {
    return {
      code: err.code || 1,
      output: (err.stdout || '') + (err.stderr || ''),
      stderr: err.stderr || '',
      stdout: err.stdout || '',
    };
  }
}

/**
 * Extract expected output from README markdown using unified/remark
 *
 * @param {string} readmePath
 * @param {string} marker
 * @returns {Promise<string | undefined>}
 */
async function extractExpectedOutput (readmePath, marker = 'EXPECTED OUTPUT') {
  const content = await readFile(readmePath, 'utf8');
  const tree = unified().use(remarkParse).parse(content);

  let foundMarker = false;
  let codeBlockContent;

  visit(tree, (node) => {
    // Look for HTML comments marking the section
    if (node.type === 'html' && node.value.includes(`BEGIN ${marker}`)) {
      foundMarker = true;
      return;
    }

    if (node.type === 'html' && node.value.includes(`END ${marker}`)) {
      foundMarker = false;
      return;
    }

    // If we're in the marked section and find a code block, extract it
    if (foundMarker && node.type === 'code') {
      codeBlockContent = node.value;
      return 'skip';
    }
  });

  return codeBlockContent;
}

/**
 * Normalize output for comparison (remove paths, etc)
 *
 * @param {string} output
 * @returns {string}
 */
function normalizeOutput (output) {
  return output
    .replaceAll(/\/\S+\/examples\//g, '/absolute/path/to/examples/')
    .trim();
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

// Test 1: Basic example - verify against README
// eslint-disable-next-line no-console
console.log('Basic Example:');

await test('output matches README expected output', async () => {
  const expectedOutput = await extractExpectedOutput(join(rootDir, 'examples/basic/README.md'));
  assert(expectedOutput !== undefined, 'Could not extract expected output from README');

  const result = await run(`node "${cliPath}" examples/basic`);
  const normalizedOutput = normalizeOutput(result.output);
  const normalizedExpected = normalizeOutput(expectedOutput);

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
  const normalizedExpected = normalizeOutput(expectedOutput);

  assert(
    normalizedOutput.includes(normalizedExpected) || normalizedOutput === normalizedExpected,
    `Output mismatch.\nExpected:\n${normalizedExpected}\n\nActual:\n${normalizedOutput}`
  );
});

await test('debug output shows parent workspace detection', async () => {
  const expectedDebug = await extractExpectedOutput(
    join(rootDir, 'examples/monorepo/README.md'),
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
