# Workspace A

This workspace is part of the monorepo example and demonstrates automatic parent workspace detection.

## What's in This Workspace

This workspace:
- Depends on `chalk@^4.0.0` (installed in parent's node_modules)
- Has `meow@^13.0.0` as a devDependency
- Has an intentionally incorrect `engines.node` range to demonstrate validation

## Usage

```bash
# From the repository root
cd examples/monorepo
npm install
cd ../..

# Run installed-check on this workspace
node cli-wrapper.cjs examples/monorepo/packages/workspace-a

# With debug output
node cli-wrapper.cjs --debug examples/monorepo/packages/workspace-a
```

## What Happens

When you run `installed-check` in this workspace:
1. **Parent detection**: Automatically detects the parent monorepo at `examples/monorepo`
2. **Module resolution**: Uses the parent's `node_modules` for finding dependencies
3. **Filtered checking**: Only checks this workspace package, not the parent
4. **Validation**: Finds the intentional `engines.node` issue

## Example Output

<!-- BEGIN EXPECTED OUTPUT -->
```
Errors:

workspace-a: meow: Narrower "engines.node" is needed: >=18.0.0

Suggestions:

workspace-a: Combined "engines.node" needs to be narrower: >=18.0.0
```
<!-- END EXPECTED OUTPUT -->

### Debug Output

When run with `--debug`, you'll see parent workspace detection:

<!-- BEGIN DEBUG OUTPUT -->
```
Parent workspace detection: Attempting to resolve parent workspace root
Parent workspace detection: Found parent workspace root: /absolute/path/to/examples/monorepo
Parent workspace detection: Using parent workspace root, filtering to current workspace
```
<!-- END DEBUG OUTPUT -->
