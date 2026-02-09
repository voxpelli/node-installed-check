# Monorepo Example

This example demonstrates how `installed-check` automatically detects parent workspace roots in a monorepo setup.

## Structure

```
monorepo/
├── package.json (workspace root with chalk@^4.0.0 dependency)
├── node_modules/ (shared dependencies installed here)
└── packages/
    ├── workspace-a/
    │   └── package.json (depends on chalk@^4.0.0, has meow)
    └── workspace-b/
        └── package.json (depends on chalk@^4.0.0, has typescript in devDeps)
```

## Usage

```bash
# From the repository root, install dependencies
cd examples/monorepo
npm install
cd ../..

# Check workspace-a - automatically detects parent workspace
node cli-wrapper.cjs examples/monorepo/packages/workspace-a

# With debug output to see parent workspace detection
node cli-wrapper.cjs --debug examples/monorepo/packages/workspace-a
```

## What Happens

When you run `installed-check` in a workspace:
1. **Parent detection**: It detects that `workspace-a` is part of the monorepo at `examples/monorepo`
2. **Module resolution**: It uses the parent's `node_modules` for finding dependencies
3. **Filtered checking**: It only checks the workspace package, not the parent
4. **Shared dependencies**: Dependencies like `chalk` are found in the parent's `node_modules`

The workspace passes all checks because the dependencies are correctly installed in the parent's `node_modules` and the parent workspace detection works properly.

### Debug Output

When run with `--debug`, you'll see information about parent workspace detection:

<!-- BEGIN DEBUG OUTPUT -->
```
Parent workspace detection: Attempting to resolve parent workspace root
Parent workspace detection: Found parent workspace root: /absolute/path/to/examples/monorepo
Parent workspace detection: Using parent workspace root, filtering to current workspace
```
<!-- END DEBUG OUTPUT -->

This demonstrates how `installed-check` works seamlessly in monorepo environments.
