# Monorepo Example

This example demonstrates how `installed-check` works with monorepo workspaces.

## Structure

```
monorepo/
├── package.json (workspace root with chalk@^4.0.0 and meow@^14.0.0 - has engine issue)
├── node_modules/ (shared dependencies installed here)
└── packages/
    ├── workspace-a/
    │   └── package.json (depends on chalk@^4.0.0)
    └── workspace-b/
        └── package.json (depends on chalk@^4.0.0, has typescript in devDeps)
```

## Usage

### Running from Monorepo Root

This checks all workspaces at once including the root:

```bash
# From the repository root
cd examples/monorepo
npm install
cd ../..

# Check the entire monorepo
node cli-wrapper.cjs examples/monorepo
```

## Example Output

<!-- BEGIN EXPECTED OUTPUT -->
```
Errors:

root: meow: Narrower "engines.node" is needed: >=20.0.0
workspace-a: knip: Narrower "engines.node" is needed: >=18.18.0

Suggestions:

root: Combined "engines.node" needs to be narrower: >=20.0.0
workspace-a: Combined "engines.node" needs to be narrower: >=18.18.0
```
<!-- END EXPECTED OUTPUT -->

### Running from Individual Workspace

See [workspace-a/README.md](./packages/workspace-a/README.md) for examples of running `installed-check` on an individual workspace with automatic parent workspace detection.
