# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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
