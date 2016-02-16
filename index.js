'use strict';

const readJson = require('read-package-json');
const readInstalled = require('read-installed');
const semver = require('semver');

module.exports = function (path) {
  if (!path) { path = '.'; }

  let packagePromise = new Promise(function (resolve, reject) {
    readJson(path + '/package.json', function (err, data) {
      if (err) { return reject(err); }
      resolve(data);
    });
  });

  let installedPromise = new Promise(function (resolve, reject) {
    readInstalled(path, { dev: true, depth: 1 }, function (err, data) {
      if (err) { return reject(err); }
      resolve(data);
    });
  });

  return Promise.all([
    packagePromise,
    installedPromise
  ])
    .then(result => {
      let requiredDependencies = Object.assign({}, result[0].dependencies, result[0].devDependencies);
      let installedDependencies = result[1];
      let errors = [];

      Object.keys(requiredDependencies).forEach(dependency => {
        var version = (installedDependencies.dependencies[dependency] || installedDependencies.devDependencies[dependency] || {}).version;

        if (!version) {
          errors.push(dependency + ': Missing dependency');
        } else if (!semver.satisfies(version, requiredDependencies[dependency])) {
          errors.push(dependency + ': Invalid version, expected a ' + requiredDependencies[dependency]);
        }
      });

      return errors.length ? errors : false;
    });
};
