# Monorepo Example

This example demonstrates how `installed-check` automatically detects parent workspace roots in a monorepo setup.

## Structure

```
monorepo/
├── package.json (workspace root with chalk dependency)
├── node_modules/ (shared dependencies installed here)
└── packages/
    ├── workspace-a/
    │   └── package.json (depends on chalk from parent)
    └── workspace-b/
        └── package.json (depends on chalk from parent)
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
1. It detects that `workspace-a` is part of the monorepo at `examples/monorepo`
2. It uses the parent's `node_modules` for module resolution
3. It filters checks to only the workspace package (not the parent)
4. Dependencies like `chalk` are found in the parent's `node_modules`
