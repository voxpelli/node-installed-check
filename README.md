<div align="center">
  <img
    src="installed-check.svg"
    width="650"
    height="auto"
    alt="installed-check"
  />
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/installed-check.svg?style=flat)](https://www.npmjs.com/package/installed-check)
[![npm downloads](https://img.shields.io/npm/dm/installed-check.svg?style=flat)](https://www.npmjs.com/package/installed-check)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/voxpelli/eslint-config)
[![Follow @voxpelli@mastodon.social](https://img.shields.io/mastodon/follow/109247025527949675?domain=https%3A%2F%2Fmastodon.social&style=social)](https://mastodon.social/@voxpelli)

</div>

Verifies that installed modules comply with the requirements specified in `package.json`.

By default checks engine ranges, peer dependency ranges and installed versions and, in mono-repos using workspaces, by default checks all workspaces as well as the workspace root.

## Usage

### Command line

```sh
npm install -g installed-check
```

Then run it at the root of your project to validate the installed dependencies:

```sh
installed-check
```

### As npm script

```sh
npm install --save-dev installed-check
```

```json
"scripts": {
  "test": "installed-check"
}
```

### Programmatic use

Use [installed-check-core](https://github.com/voxpelli/node-installed-check-core)

## Checks

* `--engine-check` / `-e` – if set `installed-check` will check that the installed modules doesn't have stricter [`engines`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#engines) ranges than those  in the `package.json` and suggests an alternative requirement if they do. If set, the default checks will be overriden.
* `--peer-check` / `-e` – if set `installed-check` will check that the installed modules doesn't have stricter [`peerDependencies`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies) ranges than those in the `package.json` and suggests an alternative requirement if they do. If set, the default checks will be overriden.
* `--version-check` / `-c` – if set `installed-check` will check that the installed modules comply with the version requirements set for them the `package.json`. If set, the default checks will be overriden.

## Check options

* `--ignore ARG` / `-i ARG` – excludes the named dependency from non-version checks. Supports [`picomatch`](https://www.npmjs.com/package/picomatch) globbing syntax, eg. `@types/*` (but be sure to provide the pattern in a way that avoids your shell from matching it against files first)
* `--ignore-dev` / `-d` – if set then dev dependencies won't be included in the non-version checks.
* `--strict` / `-s` – treats warnings as errors

## Workspace options

  * `--no-include-workspace-root` – excludes the workspace root package. Negated equivalent of npm's [`--include-workspace-root`](https://docs.npmjs.com/cli/v10/commands/npm-run-script#include-workspace-root)
  * `--no-workspaces` – excludes workspace packages. Negated equivalent of npm's [`--workspaces`](https://docs.npmjs.com/cli/v10/commands/npm-run-script#workspaces)
  * `--workspace=ARG` / `-w ARG` – excludes all workspace packages not matching these names / paths. Equivalent to npm's [`--workspace` / `-w`](https://docs.npmjs.com/cli/v10/commands/npm-run-script#workspace)
  * `--workspace-ignore=ARG` – xcludes the specified paths from workspace lookup. (Supports globs)

### Additional command line options

* `--debug` – prints debug info
* `--verbose` / `-v` – prints warnings and notices
* `--help` / `-h` – prints help and exits
* `--version` – prints current version and exits

## Similar modules

* [`knip`](https://github.com/webpro/knip) – finds unused files, dependencies and exports in your JavaScript and TypeScript projects – a great companion module to `installed-check`
