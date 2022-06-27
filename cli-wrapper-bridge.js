/* eslint-disable no-console, unicorn/no-process-exit */

'use strict';

// This file purely exists because "import" is a reserved word in old node.js and
// thus can't be included directly in the cli-wrapper.js file without error

import('./cli.mjs').catch(err => {
  console.error('unexpected error:', err);
  process.exit(1);
});

module.exports = {};
