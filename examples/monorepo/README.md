# Monorepo Example

This example demonstrates how `installed-check` works with monorepo workspaces.

## Structure

```
monorepo/
├── package.json (workspace root with chalk@^4.0.0 dependency)
├── node_modules/ (shared dependencies installed here)
└── packages/
    ├── workspace-a/
    │   └── package.json (depends on chalk@^4.0.0, has meow, intentional issue)
    └── workspace-b/
        └── package.json (depends on chalk@^4.0.0, has typescript in devDeps)
```

## Usage

### Running from Monorepo Root

This checks all workspaces at once:

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

workspace-a: meow: Narrower "engines.node" is needed: >=18.0.0

Suggestions:

workspace-a: Combined "engines.node" needs to be narrower: >=18.0.0
```
<!-- END EXPECTED OUTPUT -->

### Running from Individual Workspace

See [workspace-a/README.md](./packages/workspace-a/README.md) for examples of running `installed-check` on an individual workspace with automatic parent workspace detection.
