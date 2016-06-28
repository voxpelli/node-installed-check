'use strict';

const readJson = require('read-package-json');
const readInstalled = require('read-installed');
const semver = require('semver');
const semverIntersect = require('semver-set').intersect;

const checkPackageVersions = function (requiredDependencies, installedDependencies) {
  const errors = [];

  Object.keys(requiredDependencies).forEach(dependency => {
    var version = (installedDependencies[dependency] || {}).version;

    if (!version) {
      errors.push(dependency + ': Missing dependency');
    } else if (!semver.satisfies(version, requiredDependencies[dependency])) {
      errors.push(dependency + ': Invalid version, expected a ' + requiredDependencies[dependency]);
    }
  });

  return errors;
};

const checkEngineVersions = function (engines, requiredDependencies, installedDependencies) {
  let engineKeys = Object.keys(engines);

  if (!engineKeys.length) {
    engines = {
      node: '*',
      npm: '*'
    };
    engineKeys = Object.keys(engines);
  }

  const errors = [];
  const warnings = [];
  const notices = [];

  let finalIntersections = Object.assign({}, engines);

  Object.keys(requiredDependencies).forEach(dependency => {
    const dependencyEngines = (installedDependencies[dependency] || {}).engines || {};

    engineKeys.forEach(engine => {
      if (!dependencyEngines[engine]) {
        warnings.push(dependency + ': Missing engine: ' + engine);
      } else {
        const intersection = semverIntersect(engines[engine], dependencyEngines[engine]);

        if (!intersection) {
          errors.push(dependency + ': Incompatible "' + engine + '" engine requirement: ' + dependencyEngines[engine]);
          finalIntersections[engine] = false;
        } else if (intersection !== engines[engine]) {
          errors.push(dependency + ': Narrower "' + engine + '" engine requirement needed: ' + dependencyEngines[engine]);

          if (finalIntersections[engine]) {
            finalIntersections[engine] = semverIntersect(finalIntersections[engine], dependencyEngines[engine]);
          }
        }
      }
    });
  });

  Object.keys(finalIntersections).forEach(engine => {
    const intersection = finalIntersections[engine];
    if (!intersection) {
      errors.push('Incompatible combined "' + engine + '" requirements.');
    } else if (intersection !== engines[engine]) {
      errors.push('Combined "' + engine + '" engine requirement needs to be narrower: ' + intersection);
    }
  });

  return { errors, warnings, notices };
};

const installedCheck = function (path, options) {
  if (typeof path === 'object') {
    return installedCheck(undefined, path);
  }

  if (!path) { path = '.'; }
  if (!options) { options = {}; }

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
      const mainPackage = result[0];
      const requiredDependencies = Object.assign({}, mainPackage.dependencies, mainPackage.devDependencies);
      const installedDependencies = result[1].dependencies;

      let errors = [];
      let warnings = [];
      let notices = [];

      errors = errors.concat(checkPackageVersions(requiredDependencies, installedDependencies));

      if (options.engineCheck) {
        const engineResult =checkEngineVersions(mainPackage.engines || {}, requiredDependencies, installedDependencies);
        errors = errors.concat(engineResult.errors);
        warnings = warnings.concat(engineResult.warnings);
        notices = notices.concat(engineResult.notices);
      }

      return { errors, warnings, notices };
    });
};

module.exports = installedCheck;
