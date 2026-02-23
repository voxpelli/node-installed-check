/**
 * Integration tests for installed-check examples
 * This runs installed-check against the examples and validates the output
 * against expected output blocks in the README files using unified/remark
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
// eslint-disable-next-line unicorn/import-style
import { dirname, join } from 'node:path';
import { extractExpectedOutput, normalizeOutput } from './test-readme.js';
import { run } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const cliPath = join(rootDir, 'cli-wrapper.cjs');

/**
 * Asserts that a CLI flag is recognised (not rejected as "Unknown option").
 *
 * @param {string} flag
 */
async function assertFlagRecognised (flag) {
  const result = await run(`node "${cliPath}" ${flag} examples/basic`, rootDir);
  assert.ok(
    !result.output.includes('Unknown option'),
    `Flag ${flag} should be recognised by the CLI, got:\n${result.output}`
  );
  // Exit code 4 means an unexpected error (e.g. ERR_PARSE_ARGS_UNKNOWN_OPTION);
  // exit codes 0 and 1 are both valid results from a recognised flag.
  assert.notEqual(result.code, 4, `Flag ${flag} caused an unexpected error:\n${result.output}`);
}

describe('Basic Example', () => {
  it('output matches README expected output', async () => {
    const expectedOutput = await extractExpectedOutput(join(rootDir, 'examples/basic/README.md'));
    assert.ok(expectedOutput !== undefined, 'Could not extract expected output from README');

    const result = await run(`node "${cliPath}" examples/basic`, rootDir);
    const normalizedOutput = normalizeOutput(result.output);
    const normalizedExpected = normalizeOutput(/** @type {string} */ (expectedOutput));

    assert.ok(
      normalizedOutput.trim().includes(normalizedExpected.trim()) || normalizedOutput.trim() === normalizedExpected.trim(),
      `Output mismatch.\nExpected:\n${normalizedExpected}\n\nActual:\n${normalizedOutput}`
    );
  });
});

describe('Monorepo Example', () => {
  it('workspace-a output matches README expected output', async () => {
    const expectedOutput = await extractExpectedOutput(join(rootDir, 'examples/monorepo/packages/workspace-a/README.md'));

    // If there's no expected output in README, it means the example should pass cleanly
    if (expectedOutput === undefined) {
      const result = await run(`node "${cliPath}" examples/monorepo/packages/workspace-a`, rootDir);
      assert.equal(
        result.code,
        0,
        `Expected clean run (exit code 0), got ${result.code} with output:\n${result.output}`
      );
      return;
    }

    const result = await run(`node "${cliPath}" examples/monorepo/packages/workspace-a`, rootDir);
    const normalizedOutput = normalizeOutput(result.output);
    const normalizedExpected = normalizeOutput(/** @type {string} */ (expectedOutput));

    assert.ok(
      normalizedOutput.trim().includes(normalizedExpected.trim()) || normalizedOutput.trim() === normalizedExpected.trim(),
      `Output mismatch.\nExpected:\n${normalizedExpected}\n\nActual:\n${normalizedOutput}`
    );
  });

  it('debug output shows parent workspace detection', async () => {
    const expectedDebug = await extractExpectedOutput(
      join(rootDir, 'examples/monorepo/packages/workspace-a/README.md'),
      'DEBUG OUTPUT'
    );
    assert.ok(expectedDebug !== undefined, 'Could not extract expected debug output from README');

    const result = await run(`node "${cliPath}" --debug examples/monorepo/packages/workspace-a`, rootDir);

    // Check that debug output contains the key messages
    assert.ok(
      result.stderr.includes('Parent workspace detection: Attempting'),
      'Expected debug output to show parent workspace detection attempt'
    );
    assert.ok(
      result.stderr.includes('Parent workspace detection: Found parent workspace root:'),
      'Expected debug output to show found parent workspace root'
    );
    assert.ok(
      result.stderr.includes('Parent workspace detection: Using parent workspace root'),
      'Expected debug output to show using parent workspace root'
    );
  });

  it('should exclude workspace root from checks', async () => {
    const result = await run(`node "${cliPath}" --debug examples/monorepo/packages/workspace-a`, rootDir);
    assert.ok(
      result.stderr.includes('includeWorkspaceRoot') && result.stderr.includes('false'),
      'Expected includeWorkspaceRoot to be false when using parent workspace'
    );
  });

  it('should work with --no-parent-workspace flag', async () => {
    const result = await run(`node "${cliPath}" --debug --no-parent-workspace examples/monorepo/packages/workspace-a`, rootDir);
    assert.ok(
      result.stderr.includes('--no-parent-workspace flag is set'),
      'Expected to skip parent workspace detection when flag is set'
    );
    assert.ok(
      result.stderr.includes('Skipped'),
      'Expected parent workspace detection to be skipped'
    );
  });

  it('running from monorepo root matches README expected output', async () => {
    const expectedOutput = await extractExpectedOutput(
      join(rootDir, 'examples/monorepo/README.md'),
      'EXPECTED OUTPUT'
    );
    assert.ok(expectedOutput !== undefined, 'Could not extract expected root output from README');

    const result = await run(`node "${cliPath}" examples/monorepo`, rootDir);
    const normalizedOutput = normalizeOutput(result.output);
    const normalizedExpected = normalizeOutput(/** @type {string} */ (expectedOutput));

    assert.ok(
      normalizedOutput.trim().includes(normalizedExpected.trim()) || normalizedOutput.trim() === normalizedExpected.trim(),
      `Output mismatch.\nExpected:\n${normalizedExpected}\n\nActual:\n${normalizedOutput}`
    );
  });
});

describe('CLI flag names', () => {
  // Regression tests: these flags broke when migrating from meow to peowly because
  // peowly uses flag key names as-is (no camelCase→kebab-case conversion like meow did).
  // Each test ensures the flag is recognised by the CLI (not rejected as "Unknown option").

  it('accepts --engine-check', async () => { await assertFlagRecognised('--engine-check'); });
  it('accepts --peer-check', async () => { await assertFlagRecognised('--peer-check'); });
  it('accepts --version-check', async () => { await assertFlagRecognised('--version-check'); });
  it('accepts --ignore-dev', async () => { await assertFlagRecognised('--ignore-dev'); });
  it('accepts --workspace-ignore', async () => { await assertFlagRecognised('--workspace-ignore=foo'); });
  it('accepts --engine-ignore (deprecated)', async () => { await assertFlagRecognised('--engine-ignore=foo'); });
  it('accepts --engine-no-dev (deprecated)', async () => { await assertFlagRecognised('--engine-no-dev'); });
});
