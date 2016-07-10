#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const dashdash = require('dashdash');

const installedCheck = require('./');

const options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Print this help and exit.'
  },
  {
    names: ['engine-check', 'e'],
    type: 'bool',
    help: 'Checks that the engine requirements of the main package is compatible that of its dependencies.'
  },
  {
    names: ['engine-no-dev', 'd'],
    type: 'bool',
    help: 'Excludes dev dependencies from engine check.'
  },
  {
    names: ['strict', 's'],
    type: 'bool',
    help: 'Treat warnings as errors.'
  },
  {
    names: ['verbose', 'v'],
    type: 'bool',
    help: 'Shows warnings and notices.'
  }
];

const parser = dashdash.createParser({ options });

let opts;

try {
  opts = parser.parse(process.argv);
} catch (e) {
  console.error(chalk.bgRed('Error:'), e.message);
  process.exit(1);
}

if (opts.help) {
  const help = parser.help().trimRight();
  console.log(
    '\n' +
    'Usage: installed-check <path to module folder>\n\n' +
    'Defaults to current folder.\n\n' +
    'Options:\n' +
    help +
    '\n'
  );
  process.exit(0);
}

const checkOptions = {
  engineCheck: opts.engine_check,
  engineNoDev: opts.engine_no_dev
};

installedCheck(opts._args[0], checkOptions).then(result => {
  if (opts.strict) {
    result.errors = result.warnings.concat(result.errors);
    result.warnings = [];
  }
  if (
    result.errors.length ||
    (opts.verbose && Object.keys(result).some(key => result[key].length))
  ) {
    console.log('');
  }
  if (opts.verbose && result.notices.length) {
    console.log(chalk.blue('Dependency notices:') + '\n\n' + result.notices.join('\n') + '\n');
  }
  if (opts.verbose && result.warnings.length) {
    console.log(chalk.yellow('Dependency warnings:') + '\n\n' + result.warnings.join('\n') + '\n');
  }
  if (result.errors.length) {
    console.error(chalk.bgRed('Dependency errors:') + '\n\n' + result.errors.join('\n') + '\n');
    process.exit(1);
  }
}).catch(err => {
  console.error(chalk.bgRed('Unexpected error:') + ' ' + err.message + '\n\n' + err.stack + '\n');
  process.exit(1);
});
