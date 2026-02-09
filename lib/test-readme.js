/**
 * Test utilities for validating example outputs against README documentation
 *
 * @module lib/test-readme
 */

import { readFile } from 'node:fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

/**
 * Extract expected output from README markdown using unified/remark
 *
 * @param {string} readmePath - Path to README file
 * @param {string} marker - Marker to identify the section
 * @returns {Promise<string | undefined>} The extracted code block content, or undefined if not found
 */
export async function extractExpectedOutput (readmePath, marker = 'EXPECTED OUTPUT') {
  const content = await readFile(readmePath, 'utf8');
  const tree = unified().use(remarkParse).parse(content);

  let foundMarker = false;
  /** @type {string | undefined} */
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
 * Normalize output for comparison (remove absolute paths, etc)
 *
 * @param {string} output - The output to normalize
 * @returns {string} Normalized output
 */
export function normalizeOutput (output) {
  return output
    .replaceAll(/\/\S+\/examples\//g, '/absolute/path/to/examples/')
    .trim();
}
