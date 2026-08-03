# Changelog

## [11.0.0](https://github.com/voxpelli/node-installed-check/compare/v10.0.1...v11.0.0) (2026-08-03)


### ⚠ BREAKING CHANGES

* The minimum supported Node.js version is now 22.22.2. Users on Node.js 20 will need to upgrade. (Will fail silently on lower versions)

### 🌟 Features

* **deps:** update dependencies ([361bf51](https://github.com/voxpelli/node-installed-check/commit/361bf5150b54b9f9dcfc1c483b41d37836fb320d))


### 🧹 Chores

* **deps:** update knip to ^6 ([a6faeac](https://github.com/voxpelli/node-installed-check/commit/a6faeac49bafcad95f120cac99868dcb360e0f1c))
* **deps:** update linting ([705f9e7](https://github.com/voxpelli/node-installed-check/commit/705f9e78d515ae98717c13bcb7ae4a43c4a44986))
* **deps:** update npm-run-all2 to version 9.0.3 ([23227aa](https://github.com/voxpelli/node-installed-check/commit/23227aae829611238063bf5601947cb6d5628f8e))
* drop Node.js 20 support, require Node.js 22+ ([130410f](https://github.com/voxpelli/node-installed-check/commit/130410f6aee385c3102b0b201789a4ec4d88af00))
* remove CodeQL analysis workflow ([57a779e](https://github.com/voxpelli/node-installed-check/commit/57a779ed3aadd0d0ddfa8a60b26b74728898918a))

## [10.0.1](https://github.com/voxpelli/node-installed-check/compare/v10.0.0...v10.0.1) (2026-02-23)


### 🩹 Fixes

* kebab-case CLI flags broke in peowly migration ([#125](https://github.com/voxpelli/node-installed-check/issues/125)) ([09f511a](https://github.com/voxpelli/node-installed-check/commit/09f511a4d00a3a3642a7c8dddc221f3f7a981e7f))


### 🧹 Chores

* **deps:** update dependency typescript to ~5.9.3 ([#109](https://github.com/voxpelli/node-installed-check/issues/109)) ([7700887](https://github.com/voxpelli/node-installed-check/commit/7700887952e27fcb5661658d8cda38819c0cdde6))

## [10.0.0](https://github.com/voxpelli/node-installed-check/compare/v9.3.0...v10.0.0) (2026-02-10)


### ⚠ BREAKING CHANGES

* align with eslint 10 on node.js >=20.19.0 ([#121](https://github.com/voxpelli/node-installed-check/issues/121))

### 🌟 Features

* resolve parent workspace in monorepos workspaces ([#118](https://github.com/voxpelli/node-installed-check/issues/118)) ([c386a56](https://github.com/voxpelli/node-installed-check/commit/c386a56edf6fa834584baf4a9517cc4088f7ed3a))


### 🧹 Chores

* align with eslint 10 on node.js &gt;=20.19.0 ([#121](https://github.com/voxpelli/node-installed-check/issues/121)) ([465a346](https://github.com/voxpelli/node-installed-check/commit/465a346e5332ce0a1263ede77eedb7b54c270b1d))
* convert from meow to peowly ([#120](https://github.com/voxpelli/node-installed-check/issues/120)) ([a5f9745](https://github.com/voxpelli/node-installed-check/commit/a5f97453a6b071ea03453be77dddb60fb986daaa))
* **deps:** update dependency meow to v13 ([#84](https://github.com/voxpelli/node-installed-check/issues/84)) ([67a1505](https://github.com/voxpelli/node-installed-check/commit/67a1505e5bbd4162677af2300266be6242c126c6))
* **deps:** update linting dependencies ([#80](https://github.com/voxpelli/node-installed-check/issues/80)) ([0d0a1f6](https://github.com/voxpelli/node-installed-check/commit/0d0a1f64d829719070d905205185e29f383ee792))
* **deps:** update type dependencies ([#82](https://github.com/voxpelli/node-installed-check/issues/82)) ([ed4e4fc](https://github.com/voxpelli/node-installed-check/commit/ed4e4fc11f22024b33dd0ce3d2490085ccc6fb6b))
