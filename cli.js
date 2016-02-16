#!/usr/bin/env node

var installedCheck = require('./');

installedCheck().then(errors => {
  if (errors) {
    console.error('Dependency errors: \n\n' + errors.join('\n') + '\n');
    process.exit(1);
  }
});
