# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 5.0.0-0 - 2021-03-12

* **Possibly breaking change:** Uses new [`5.x` version](https://github.com/voxpelli/node-installed-check-core/releases/tag/v5.0.0-0) of [`installed-check-core`](https://github.com/voxpelli/node-installed-check-core), which contains a newer engine intersection module as well as some alterations to errors, warnings and notices to make them more robust and consistent (thanks to eg. new tests)

## 4.0.0 - 2021-01-28

Apart from changes in `4.0.0-0`:

* **Dependencies**: Updated [`meow`](https://www.npmjs.com/package/meow) to fix some ignore [flags being greedy](https://github.com/sindresorhus/meow/pull/162)

## 4.0.0-0 - 2020-10-22

* **Breaking change:** Now requires at least Node.js 12.x (somewhat following the LTS of Node.js itself)
* **Dependencies**: Moved from `2.x` to modern `4.x` version of [`chalk`](https://www.npmjs.com/package/chalk)
* **Dependencies**: Now using [`meow`](https://www.npmjs.com/package/meow) instead of [`dashdash`](https://www.npmjs.com/package/dashdash) to parse the CLI input
* **Dependencies:** Uses new `4.x` version of [`installed-check-core`](https://github.com/voxpelli/node-installed-check-core), containing fewer dependencies that are more modern and eg. typed and async in themselves
* **Internal:**  Added strict type checking (using Typescript) verifying that the javascript code doesn't violate any assumptions.

## 3.0.0 - 2019-08-09

* **Breaking change:** Now requires at least Node.js 10.x (somewhat following the LTS of Node.js itself)
* **Breaking change:** Now defaults to both engine and module version checks
* **Breaking change:** Engine check and module check is now treated as equals. `--no-version-check` opt-out has been replaced with `--version-check` opt-in
* **Internal:** Core functionality has been moved to [installed-check-core](https://github.com/voxpelli/node-installed-check-core), this module now just contains the CLI

## 2.2.0 - 2018-07-26

* **Feature**: New `engineIgnores` / `--engine-ignore` / `-i` option enables one to exclude one or more modules from the engine check
* **Feature**: New `noVersionCheck` / `--no-version-check` / `-n` option enables one to only use the engine check and skip the check of the versions installed
* **Dependencies**: Updated [`@voxpelli/semver-set`](https://www.npmjs.com/package/@voxpelli/semver-set) module to fix some bugs

## 2.1.2 - 2017-11-07

* **Dependencies**: Moved to published [`@voxpelli/semver-set`](https://www.npmjs.com/package/@voxpelli/semver-set) module, fixes some errenous version checks

## 2.1.1 - 2016-11-06

* Widen version range, support Node 4

## 2.1.0 - 2016-07-10

### Added
- New `engineNoDev` / `--engine-no-dev` / `-d` option that will exclude dev dependencies from the `engines` requirements check. Eg. makes it possible to use this module while still supporting a node version that isn't compatible with `>=5.0.0`.

### Fixed
- Removed empty line that would be printed on a successful run in non-verbose mode when there were hidden warnings or notices.

## 2.0.0 - 2016-07-05

### Added
- New `engineCheck` / `--engine-check` / `-e` option that will add validation of the installed dependencies `engines` requirements against the the `engines` requirement of the tested module

### Changed
- Improved the CLI tool to expose all options, include a help feature and provide improved presentation of errors
- Changed the format of the data returned when calling the module programmatically.

## 1.0.0 - 2016-02-16

### Added
- Initial release
