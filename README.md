# Installed Check

Checks that the installed modules comply fulfill the requirements of package.json.

By default checks module versions but can optionally also check engine requirements.

## Usage

### Command line

```bash
npm install -g installed-check
```

Then run it at the root of your project to validate the installed dependencies:

```bash
installed-check
```

### As npm script

```bash
npm install --save-dev installed-check
```

```
"scripts": {
  "test": "installed-check"
}
```

### Programmatic use

```bash
npm install --save installed-check
```

```javascript
var installedCheck = require('installed-check');

installedCheck().then(result => {
  if (result.errors.length) {
    console.error('Dependency errors: \n\n' + result.errors.join('\n') + '\n');
  }
});
```

## Syntax

```javascript
installedCheck('path/to/module', {
  engineCheck: true
})
  .then(result => ...)
```

### Parameters

1. `path` – optional string path to the module to do the check in. Defaults to `.`
2. `options` – optional object containing additional options for the module

### Returns

A Promise resolving to:

```javascript
{
  notices: ['123'],
  warnings: ['Abc'],
  errors: ['Xyz']
};
```

## Options

* `engineCheck` / `--engine-check` / `-e` – if set `installed-check` will check that the installed modules comply with the [engines requirements](https://docs.npmjs.com/files/package.json#engines) of the package.json and suggest an alternative requirement if the installed modules don't comply.
* `engineIgnores` / `--engine-ignore` / `-i` – if set then the specified module names won't be included in the engine check. `engineIgnores` should an array of module names while the CLI flags should be set once for each module name.
* `noVersionCheck` / `--no-version-check` / `-n` – if set `installed-check` will not check that the installed modules comply with the version requirements set for it the package.json.

### Additional command line options

* `--help` / `-h` – prints all available flags
* `--strict` / `-s` – treats warnings as errors
* `--verbose` / `-v` – prints warnings and notices
