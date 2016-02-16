# Installed Check

Checks that all dependencies in your package.json have supported versions installed

## Global use

```bash
npm install -g installed-check
```

Then run it at the root of your project to validate the installed dependencies:

```bash
installed-check
```

## As npm script

```bash
npm install --save-dev installed-check
```

```
"scripts": {
  "test": "installed-check"
}
```

## Programmatic use

```bash
npm install --save installed-check
```

```javascript
var installedCheck = require('installed-check');

installedCheck().then(errors => {
  if (errors) {
    console.error('Dependency errors: \n\n' + errors.join('\n') + '\n');
  }
});
```
