/* eslint-disable no-console, unicorn/no-process-exit */

import chalk from 'chalk';
import meow from 'meow';
import { messageWithCauses, stackWithCauses } from 'pony-cause';
import { installedCheck } from 'installed-check-core';

const cli = meow(`
  Usage
    $ installed-check <path to module folder>

  Defaults to current folder and to do all check.

  Options
    -e, --engine-check           Set explicitly that an engine check should be made. Deactivates default checks.
    -i ARG, --engine-ignore=ARG  Excludes defined dependency from engine check.
    -d, --engine-no-dev          Excludes dev dependencies from engine check.
    -c, --version-check          Set explicitly that a version check should be made. Deactivates default checks.
    -s, --strict                 Treat warnings as errors.
    -v, --verbose                Shows warnings and notices.
    --help                       Print this help and exits.
    --version                    Prints current version and exits.

  Examples
    $ installed-check
`, {
  flags: {
    engineCheck: {
      alias: 'e',
      type: 'boolean',
    },
    engineIgnore: {
      alias: 'i',
      type: 'string',
      isMultiple: true,
    },
    engineNoDev: {
      alias: 'd',
      type: 'boolean',
    },
    versionCheck: {
      alias: 'c',
      type: 'boolean',
    },
    strict: {
      alias: 's',
      type: 'boolean',
    },
    verbose: {
      alias: 'v',
      type: 'boolean',
    }
  },
  importMeta: import.meta
});

const {
  engineCheck,
  engineIgnore: engineIgnores,
  engineNoDev,
  strict,
  verbose,
  versionCheck
} = cli.flags;

const checkOptions = {
  path: cli.input[0],
  engineCheck,
  engineNoDev,
  engineIgnores,
  versionCheck,
};

if (!checkOptions.engineCheck && !checkOptions.versionCheck) {
  checkOptions.engineCheck = true;
  checkOptions.versionCheck = true;
}

/**
 * @param {{ [key: string]: unknown }} obj
 * @returns {boolean}
 */
const hasNonEmptyProperties = (obj) => {
  for (const key in obj) {
    const value = obj[key];
    if (value) {
      if (Array.isArray(value) && value.length === 0) continue;
      return true;
    }
  }
  return false;
};

const result = await installedCheck(checkOptions).catch(err => {
  console.error(chalk.bgRed('Unexpected error:') + ' ' + messageWithCauses(err) + '\n\n' + stackWithCauses(err) + '\n');
  process.exit(1);
});

if (strict) {
  result.errors = [...result.warnings, ...result.errors];
  result.warnings = [];
}
if (
  result.errors.length ||
  (verbose && hasNonEmptyProperties(result))
) {
  console.log('');
}
if (verbose && result.notices.length) {
  console.log(chalk.blue('Dependency notices:') + '\n\n' + result.notices.join('\n') + '\n');
}
if (verbose && result.warnings.length) {
  console.log(chalk.yellow('Dependency warnings:') + '\n\n' + result.warnings.join('\n') + '\n');
}
if (result.errors.length) {
  console.error(chalk.bgRed('Dependency errors:') + '\n\n' + result.errors.join('\n') + '\n');
  process.exit(1);
}
