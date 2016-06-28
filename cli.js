#!/usr/bin/env node

const chalk = require('chalk');
const installedCheck = require('./');

// TODO: Enable configuration of options
installedCheck('.', {
  engineCheck: true
}).then(result => {
  if (Object.keys(result).some(key => result[key].length)) {
    console.log('');
  }
  if (result.notices.length) {
    console.log(chalk.blue('Dependency notices:') + '\n\n' + result.notices.join('\n') + '\n');
  }
  if (result.warnings.length) {
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
