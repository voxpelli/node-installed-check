/* eslint-disable no-console, unicorn/no-process-exit */

import chalk from 'chalk';
import meow from 'meow';
import { messageWithCauses, stackWithCauses } from 'pony-cause';
import { installedCheck } from 'installed-check-core';

const EXIT_CODE_ERROR_RESULT = 1;
const EXIT_CODE_INVALID_INPUT = 2;
const EXIT_CODE_UNEXPECTED_ERROR = 4;

const cli = meow(`
  Usage
    $ installed-check <path to module folder>

  Defaults to current folder and to perform all checks.

  Checks
    -e, --engine-check    Override default checks and explicitly request an engine range check.
    -p, --peer-check      Override default checks and explicitly request a peer dependency range check.
    -c, --version-check   Override default checks and explicitly request a check of installed versions.

  Check options
    -i ARG, --ignore=ARG  Excludes the named dependency from non-version checks. (Supports globs)
    -d, --ignore-dev      Excludes dev dependencies from non-version checks.
    -s, --strict          Treat warnings as errors.

  Workspace options
    --no-include-workspace-root  Will exclude the workspace root package
    --no-workspaces              Will exclude workspace packages
    -w ARG, --workspace=ARG      Excludes all workspace packages not matching these names / paths

  Options
    --debug        Prints debug info
    --help         Print this help and exits.
    --version      Prints current version and exits.
    -v, --verbose  Shows warnings.

  Examples
    $ installed-check
`, {
  flags: {
    debug: { type: 'boolean' },
    engineCheck: { shortFlag: 'e', type: 'boolean' },
    ignore: { shortFlag: 'i', type: 'string', isMultiple: true },
    ignoreDev: { shortFlag: 'd', type: 'boolean' },
    includeWorkspaceRoot: { type: 'boolean', 'default': true },
    peerCheck: { shortFlag: 'p', type: 'boolean' },
    strict: { shortFlag: 's', type: 'boolean' },
    verbose: { shortFlag: 'v', type: 'boolean' },
    versionCheck: { shortFlag: 'c', type: 'boolean' },
    workspace: { shortFlag: 'w', type: 'string', isMultiple: true },
    workspaces: { type: 'boolean', 'default': true },
  },
  importMeta: import.meta,
});

if (cli.input.length > 1) {
  console.error(chalk.bgRed('Invalid input:') + ` Can only handle a single folder path, but received ${cli.input.length} paths: "${cli.input.join('", "')}"` + '\n');
  process.exit(EXIT_CODE_INVALID_INPUT);
}

const {
  debug,
  engineCheck,
  ignore,
  ignoreDev,
  includeWorkspaceRoot,
  peerCheck,
  strict,
  verbose,
  versionCheck,
  workspace,
  workspaces,
} = cli.flags;

/** @type {import('installed-check-core').InstalledChecks[]} */
let checks = [
  ...engineCheck ? /** @type {const} */ (['engine']) : [],
  ...peerCheck ? /** @type {const} */ (['peer']) : [],
  ...versionCheck ? /** @type {const} */ (['version']) : [],
];

/** @type {import('installed-check-core').LookupOptions} */
const lookupOptions = {
  cwd: cli.input[0],
  includeWorkspaceRoot,
  skipWorkspaces: !workspaces,
  workspace,
};

/** @type {import('installed-check-core').InstalledCheckOptions} */
const checkOptions = {
  noDev: ignoreDev,
  ignore,
  strict,
};

if (checks.length === 0) {
  checks = ['engine', 'peer', 'version'];
}

if (debug) {
  const { inspect } = await import('node:util');
  console.log(chalk.blue('Checks:') + ' ' + inspect(checks, { colors: true, compact: true }));
  console.log(chalk.blue('Lookup options:') + ' ' + inspect(lookupOptions, { colors: true, compact: true }));
  console.log(chalk.blue('Check options:') + ' ' + inspect(checkOptions, { colors: true, compact: true }));
}

try {
  const result = await installedCheck(checks, lookupOptions, checkOptions);

  if (verbose && result.warnings.length) {
    console.log('\n' + chalk.bgYellow('Warnings:') + '\n\n' + result.warnings.join('\n') + '\n');
  } else if (result.errors.length) {
    console.log('');
  }

  if (result.errors.length) {
    console.error(chalk.bgRed('Errors:') + '\n\n' + result.errors.join('\n') + '\n');
  }

  if (result.suggestions.length) {
    console.error(chalk.bgCyanBright('Suggestions:') + '\n\n' + result.suggestions.join('\n') + '\n');
  }

  if (result.errors.length) {
    process.exit(EXIT_CODE_ERROR_RESULT);
  }
} catch (err) {
  console.error(chalk.bgRed('Unexpected error:') + ' ' + (err instanceof Error ? messageWithCauses(err) + '\n\n' + stackWithCauses(err) : err) + '\n');
  process.exit(EXIT_CODE_UNEXPECTED_ERROR);
}
