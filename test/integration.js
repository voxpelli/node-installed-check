/**
 * Integration tests for installed-check examples
 * This runs installed-check against the examples and validates the output
 * against expected output blocks in the README files using unified/remark
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { extractExpectedOutput, normalizeOutput } from './test-readme.js';
import { run } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const cliPath = join(rootDir, 'cli-wrapper.cjs');

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
