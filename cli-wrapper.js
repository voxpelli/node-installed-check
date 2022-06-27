#!/usr/bin/env node
/* eslint-disable no-var, no-console, unicorn/prefer-number-properties */

'use strict';

if (require('./package.json').engines.node !== '^14.18.0 || >=16.0.0') {
  console.error('dependency-check: Mismatch between package.json node engine and cli engine check');
  process.exit(1);
}

var match = process.version.match(/v(\d+)\.(\d+)/) || [];
var major = parseInt(match[1] || '', 10);
var minor = parseInt(match[2] || '', 10);

if (major > 14 || (major === 14 && minor >= 18)) {
  require('./cli-wrapper-bridge.js');
} else {
  console.error('installed-check: Node 14.18.0 or greater is required. `installed-check` did not run.');
  process.exit(0);
}
