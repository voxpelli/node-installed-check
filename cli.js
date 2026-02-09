/* eslint-disable no-console, unicorn/no-process-exit */

import { createRequire } from 'node:module';
import chalk from 'chalk';
import { formatHelpMessage, peowly } from 'peowly';
import { messageWithCauses, stackWithCauses } from 'pony-cause';
import { installedCheck, ROOT } from 'installed-check-core';

// createRequire is needed to load package.json in ESM context
// @ts-expect-error - TS doesn't recognize that require is used below
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const EXIT_CODE_ERROR_RESULT = 1;
const EXIT_CODE_INVALID_INPUT = 2;
const EXIT_CODE_UNEXPECTED_ERROR = 4;

// TODO [engine:node@>=22.4.0]: Remove preprocessArgs and negationFlags, use allowNegative option in peowly
// Preprocess args to handle --no- prefix for boolean flags (needed for Node.js <22.4.0)
// This manually implements the allowNegative behavior for compatibility with older Node.js versions
// The allowNegative option was added to parseArgs in Node.js 22.4.0 (June 2024)
const negationFlags = new Map();

/**
 * @param {string[]} args
 * @returns {string[]}
 */
function preprocessArgs (args) {
  const processed = [];
  for (const arg of args) {
    if (arg === '--no-workspaces') {
      // Track that workspaces should be false, but don't add to args
      // (parseArgs will default to undefined, then we apply negation)
      negationFlags.set('workspaces', false);
    } else if (arg === '--no-include-workspace-root') {
      negationFlags.set('include-workspace-root', false);
    } else {
      processed.push(arg);
    }
  }
  return processed;
}

/** @satisfies {import('peowly').AnyFlags} */
const flags = {
  debug: {
    type: 'boolean',
    description: 'Prints debug info',
  },
  engineCheck: {
    'short': 'e',
    type: 'boolean',
    description: 'Override default checks and explicitly request an engine range check',
    listGroup: 'Checks',
  },
  engineIgnore: {
    type: 'string',
    multiple: true,
    description: 'Deprecated: use --ignore instead',
  },
  engineNoDev: {
    type: 'boolean',
    description: 'Deprecated: use --ignore-dev instead',
  },
  fix: {
    type: 'boolean',
    description: 'Tries to apply all suggestions and write them back to disk',
    listGroup: 'Fix options',
  },
  ignore: {
    'short': 'i',
    type: 'string',
    multiple: true,
    description: 'Excludes the named dependency from non-version checks (Supports globs)',
    listGroup: 'Check options',
  },
  ignoreDev: {
    'short': 'd',
    type: 'boolean',
    description: 'Excludes dev dependencies from non-version checks',
    listGroup: 'Check options',
  },
  // Note: Using kebab-case for this flag name to support --no-include-workspace-root negation
  // with parseArgs allowNegative option. CamelCase names don't work with negation in parseArgs.
  // TODO: File issue with peowly/Node.js about improving allowNegative to support camelCase flag
  // negation (e.g., includeWorkspaceRoot should work with --no-include-workspace-root)
  'include-workspace-root': {
    type: 'boolean',
    description: 'Will exclude the workspace root package when set to false',
    listGroup: 'Workspace options',
  },
  peerCheck: {
    'short': 'p',
    type: 'boolean',
    description: 'Override default checks and explicitly request a peer dependency range check',
    listGroup: 'Checks',
  },
  strict: {
    'short': 's',
    type: 'boolean',
    description: 'Treat warnings as errors',
    listGroup: 'Check options',
  },
  verbose: {
    'short': 'v',
    type: 'boolean',
    description: 'Shows warnings',
  },
  versionCheck: {
    'short': 'c',
    type: 'boolean',
    description: 'Override default checks and explicitly request a check of installed versions',
    listGroup: 'Checks',
  },
  workspace: {
    'short': 'w',
    type: 'string',
    multiple: true,
    description: 'Excludes all workspace packages not matching these names / paths',
    listGroup: 'Workspace options',
  },
  workspaceIgnore: {
    type: 'string',
    multiple: true,
    description: 'Excludes the specified paths from workspace lookup (Supports globs)',
    listGroup: 'Workspace options',
  },
  workspaces: {
    type: 'boolean',
    description: 'Include workspace packages (use --no-workspaces to exclude)',
    listGroup: 'Workspace options',
  },
};

const cli = peowly({
  options: flags,
  help: formatHelpMessage('installed-check', {
    flags,
    usage: '<path to module folder>',
    examples: [
      '',
    ],
  }),
  name: 'installed-check',
  pkg,
  // TODO [engine:node@>=22.4.0]: Add allowNegative: true and remove preprocessArgs/negationFlags
  // allowNegative option (for --no- prefix) is only available in Node.js >=22.4.0
  // Since we support >=18.6.0, we use preprocessArgs to handle --no- flags manually
  args: preprocessArgs(process.argv.slice(2)),
});

// Apply negation flags manually (TODO [engine:node@>=22.4.0]: Remove this block)
if (negationFlags.has('workspaces')) {
  cli.flags.workspaces = false;
}
if (negationFlags.has('include-workspace-root')) {
  cli.flags['include-workspace-root'] = false;
}

if (cli.input.length > 1) {
  console.error(chalk.bgRed('Invalid input:') + ` Can only handle a single folder path, but received ${cli.input.length} paths: "${cli.input.join('", "')}"` + '\n');
  process.exit(EXIT_CODE_INVALID_INPUT);
}

const {
  debug,
  engineCheck,
  fix = false,
  peerCheck,
  strict,
  verbose,
  versionCheck,
  workspaces = true,
} = cli.flags;

const includeWorkspaceRoot = cli.flags['include-workspace-root'] ?? true;

// Accessing multiple-value and deprecated flags that aren't in the typed interface
const engineIgnore = /** @type {string[] | undefined} */ (/** @type {unknown} */ (cli.flags.engineIgnore)); // deprecated
const engineNoDev = /** @type {boolean | undefined} */ (/** @type {unknown} */ (cli.flags.engineNoDev)); // deprecated
let ignore = /** @type {string[] | undefined} */ (/** @type {unknown} */ (cli.flags.ignore));
let ignoreDev = /** @type {boolean | undefined} */ (/** @type {unknown} */ (cli.flags.ignoreDev));
const workspace = /** @type {string[] | undefined} */ (/** @type {unknown} */ (cli.flags.workspace));
const workspaceIgnore = /** @type {string[] | undefined} */ (/** @type {unknown} */ (cli.flags.workspaceIgnore));

// Handle deprecated flags
if (engineIgnore?.length) {
  ignore = [...ignore || [], ...engineIgnore];
  console.error(chalk.bgRed.black('DEPRECATED:') + ' --engine-ignore is replace by --ignore');
}
if (engineNoDev) {
  ignoreDev = engineNoDev;
  console.error(chalk.bgRed.black('DEPRECATED:') + ' --engine-no-dev is replace by --ignore-dev');
}

/** @type {import('installed-check-core').InstalledChecks[]} */
let checks = [
  ...engineCheck ? /** @type {const} */ (['engine']) : [],
  ...peerCheck ? /** @type {const} */ (['peer']) : [],
  ...versionCheck ? /** @type {const} */ (['version']) : [],
];

/** @type {import('installed-check-core').LookupOptions} */
const lookupOptions = {
  cwd: cli.input[0],
  ignorePaths: workspaceIgnore,
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
  const result = await installedCheck(checks, lookupOptions, { ...checkOptions, fix });

  if (verbose && result.warnings.length) {
    console.log('\n' + chalk.bgYellow.black('Warnings:') + '\n\n' + result.warnings.join('\n') + '\n');
  } else if (result.errors.length) {
    console.log('');
  }

  if (result.errors.length) {
    console.error(chalk.bgRed.black('Errors:') + '\n\n' + result.errors.join('\n') + '\n');
  }

  if (result.suggestions.length) {
    console.error(chalk.bgCyanBright.black('Suggestions:') + '\n\n' + result.suggestions.join('\n') + '\n');
  }

  const workspaceSuccess = /** @type {const} */ ([
    ...Object.entries(result.workspaceSuccess),
    ...(result.workspaceSuccess[ROOT] === undefined ? [] : /** @type {const} */ ([['root', result.workspaceSuccess[ROOT]]])),
  ]);

  if (verbose && workspaceSuccess.length) {
    if (result.errors.length === 0 && workspaceSuccess.length === 1 && result.workspaceSuccess[ROOT]) {
      console.log(chalk.bgGreen.black('Successful!') + '\n');
    } else {
      const success = workspaceSuccess.filter(([, value]) => value);
      const failure = workspaceSuccess.filter(([, value]) => !value);

      if (success.length) {
        console.log(chalk.bgGreen.black('Successful workspaces:') + ' ' + success.map(([key]) => key).join(', ') + '\n');
      }
      if (failure.length) {
        console.log(chalk.bgRed.black('Unsuccessful workspaces:') + ' ' + failure.map(([key]) => key).join(', ') + '\n');
      }
    }
  }

  if (result.errors.length) {
    process.exit(EXIT_CODE_ERROR_RESULT);
  }
} catch (err) {
  console.error(chalk.bgRed('Unexpected error:') + ' ' + (err instanceof Error ? messageWithCauses(err) + '\n\n' + stackWithCauses(err) : err) + '\n');
  process.exit(EXIT_CODE_UNEXPECTED_ERROR);
}
