/* eslint-disable no-console, unicorn/no-process-exit */

import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import chalk from 'chalk';
import { formatHelpMessage, peowly } from 'peowly';
import { messageWithCauses, stackWithCauses } from 'pony-cause';
import { installedCheck, ROOT } from 'installed-check-core';
import resolveWorkspaceRootPkg from 'resolve-workspace-root';

const { resolveWorkspaceRootAsync } = resolveWorkspaceRootPkg;

// createRequire is needed to load package.json in ESM context
// @ts-expect-error - TS doesn't recognize that require is used below
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const EXIT_CODE_ERROR_RESULT = 1;
const EXIT_CODE_INVALID_INPUT = 2;
const EXIT_CODE_UNEXPECTED_ERROR = 4;

/**
 * Log a debug message to stderr if debug mode is enabled
 *
 * @param {boolean | undefined} debug
 * @param {string} label
 * @param {string} message
 */
function debugLog (debug, label, message) {
  if (debug) {
    console.error(chalk.blue(label + ':') + ' ' + message);
  }
}

const baseFlags = /** @satisfies {Record<string, import('peowly').AnyFlag>} */ ({
  debug: {
    type: 'boolean',
    'default': false,
    description: 'Prints debug info',
  },
  verbose: {
    'short': 'v',
    type: 'boolean',
    'default': false,
    description: 'Shows warnings',
  },
});

const checkFlags = /** @satisfies {Record<string, import('peowly').AnyFlag & { listGroup: 'Checks' }>} */ ({
  engineCheck: {
    'short': 'e',
    type: 'boolean',
    'default': false,
    description: 'Override default checks and explicitly request an engine range check',
    listGroup: 'Checks',
  },
  peerCheck: {
    'short': 'p',
    type: 'boolean',
    'default': false,
    description: 'Override default checks and explicitly request a peer dependency range check',
    listGroup: 'Checks',
  },
  versionCheck: {
    'short': 'c',
    type: 'boolean',
    'default': false,
    description: 'Override default checks and explicitly request a check of installed versions',
    listGroup: 'Checks',
  },
});

const checkOptionFlags = /** @satisfies {Record<string, import('peowly').AnyFlag & { listGroup: 'Check options' }>} */ ({
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
    'default': false,
    description: 'Excludes dev dependencies from non-version checks',
    listGroup: 'Check options',
  },
  strict: {
    'short': 's',
    type: 'boolean',
    'default': false,
    description: 'Treat warnings as errors',
    listGroup: 'Check options',
  },
});

const fixFlags = /** @satisfies {Record<string, import('peowly').AnyFlag & { listGroup: 'Fix options' }>} */ ({
  fix: {
    type: 'boolean',
    'default': false,
    description: 'Tries to apply all suggestions and write them back to disk',
    listGroup: 'Fix options',
  },
});

const workspaceFlags = /** @satisfies {Record<string, import('peowly').AnyFlag & { listGroup: 'Workspace options' }>} */ ({
  'no-include-workspace-root': {
    type: 'boolean',
    'default': false,
    description: 'Excludes the workspace root package',
    listGroup: 'Workspace options',
  },
  'no-parent-workspace': {
    type: 'boolean',
    'default': false,
    description: 'Disables detection and use of parent workspace root for module resolution',
    listGroup: 'Workspace options',
  },
  'no-workspaces': {
    type: 'boolean',
    'default': false,
    description: 'Excludes workspace packages',
    listGroup: 'Workspace options',
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
});

const deprecatedFlags = /** @satisfies {Record<string, import('peowly').AnyFlag & { listGroup: 'Deprecated options' }>} */ ({
  engineIgnore: {
    type: 'string',
    multiple: true,
    description: 'Deprecated: use --ignore instead',
    listGroup: 'Deprecated options',
  },
  engineNoDev: {
    type: 'boolean',
    'default': false,
    description: 'Deprecated: use --ignore-dev instead',
    listGroup: 'Deprecated options',
  },
});

const flags = /** @satisfies {import('peowly').AnyFlags} */ ({
  ...baseFlags,
  ...checkFlags,
  ...checkOptionFlags,
  ...fixFlags,
  ...workspaceFlags,
  ...deprecatedFlags,
});

const cli = peowly({
  options: flags,
  help: formatHelpMessage('installed-check', {
    flags,
    usage: '<path to module folder>',
  }),
  name: 'installed-check',
  pkg,
});

if (cli.input.length > 1) {
  console.error(chalk.bgRed('Invalid input:') + ` Can only handle a single folder path, but received ${cli.input.length} paths: "${cli.input.join('", "')}"` + '\n');
  process.exit(EXIT_CODE_INVALID_INPUT);
}

const {
  debug,
  engineCheck,
  engineIgnore, // deprecated
  engineNoDev, // deprecated
  fix,
  peerCheck,
  strict,
  verbose,
  versionCheck,
  workspace,
  workspaceIgnore,
} = cli.flags;

let {
  ignore,
  ignoreDev,
} = cli.flags;

const includeWorkspaceRoot = !cli.flags['no-include-workspace-root'];
const parentWorkspace = !cli.flags['no-parent-workspace'];
const workspaces = !cli.flags['no-workspaces'];

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

// Detect if we're in a workspace within a larger monorepo
// If so, use the parent workspace root to enable access to parent's node_modules
const requestedCwd = resolve(cli.input[0] || process.cwd());

let resolvedCwd = requestedCwd;
let workspaceFilter = workspace;
let resolvedIncludeWorkspaceRoot = includeWorkspaceRoot;

// Only detect parent workspace if:
// - User hasn't explicitly opted out with --no-parent-workspace
// - User hasn't provided explicit workspace filters (which would be incompatible)
if (parentWorkspace && !workspace?.length) {
  debugLog(debug, 'Parent workspace detection', 'Attempting to resolve parent workspace root');

  const parentWorkspaceRoot = await resolveWorkspaceRootAsync(requestedCwd);

  if (parentWorkspaceRoot) {
    debugLog(debug, 'Parent workspace detection', 'Found parent workspace root: ' + parentWorkspaceRoot);
  } else {
    debugLog(debug, 'Parent workspace detection', 'No parent workspace root found');
  }

  // If we found a parent workspace root and it's different from the requested path
  if (parentWorkspaceRoot && parentWorkspaceRoot !== requestedCwd) {
    debugLog(debug, 'Parent workspace detection', 'Parent workspace root differs from requested path');

    // Use the parent workspace root as the cwd
    resolvedCwd = parentWorkspaceRoot;

    // Filter to only the requested workspace
    workspaceFilter = [requestedCwd];

    // Don't include the parent workspace root itself in checks
    resolvedIncludeWorkspaceRoot = false;

    /** @type {string[]} */
    const reasons = [];
    if (requestedCwd !== process.cwd()) {
      reasons.push('path was provided as argument');
    }
    if (workspaces) {
      reasons.push('--workspaces flag is set');
    }

    debugLog(debug, 'Parent workspace detection', `Using parent workspace root because ${reasons.join(' and ')}`);
  } else {
    debugLog(debug, 'Parent workspace detection', 'Parent workspace root is same as requested cwd, not applying');
  }
} else if (debug) {
  /** @type {string[]} */
  const reasons = [];
  if (!parentWorkspace) reasons.push('--no-parent-workspace flag is set');
  if (workspace?.length) reasons.push('explicit workspace filters provided');
  debugLog(debug, 'Parent workspace detection', 'Skipped (' + reasons.join(', ') + ')');
}

const lookupOptions = {
  cwd: resolvedCwd,
  ...workspaceFilter ? { workspace: workspaceFilter } : {},
  includeWorkspaceRoot: resolvedIncludeWorkspaceRoot,
  workspaceIgnore,
  workspaces,
};

if (debug) {
  console.error(chalk.blue('Effective options:'));
  console.error('  cwd:', lookupOptions.cwd);
  console.error('  workspace filter:', workspaceFilter || '(none)');
  console.error('  includeWorkspaceRoot:', lookupOptions.includeWorkspaceRoot);
  console.error('  workspaceIgnore:', lookupOptions.workspaceIgnore || '(none)');
  console.error('  workspaces:', lookupOptions.workspaces);
}

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
  debugLog(debug, 'Checks', inspect(checks, { colors: true, compact: true }));
  debugLog(debug, 'Lookup options', inspect(lookupOptions, { colors: true, compact: true }));
  debugLog(debug, 'Check options', inspect(checkOptions, { colors: true, compact: true }));
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
