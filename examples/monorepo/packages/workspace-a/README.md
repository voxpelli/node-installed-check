# Workspace A

This workspace is part of the monorepo example and demonstrates automatic parent workspace detection.

## What's in This Workspace

This workspace:
- Depends on `chalk@^4.0.0` (installed in parent's node_modules)
- Has a clean configuration with no errors

The parent monorepo root has a `meow` dependency with an engine issue, but that issue does NOT appear when checking this workspace because `includeWorkspaceRoot` is set to `false` when using parent workspace detection.

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
3. **Filtered checking**: Only checks this workspace package, not the parent (includeWorkspaceRoot: false)
4. **Validation**: Passes cleanly - the root's meow issue is excluded

## Example Output

<!-- BEGIN EXPECTED OUTPUT -->
```

```
<!-- END EXPECTED OUTPUT -->

The empty output indicates success - this workspace has no issues, and the parent's issue is excluded.

### Debug Output

When run with `--debug`, you'll see parent workspace detection:

<!-- BEGIN DEBUG OUTPUT -->
```
Parent workspace detection: Attempting to resolve parent workspace root
Parent workspace detection: Found parent workspace root: /absolute/path/to/examples/monorepo
Parent workspace detection: Using parent workspace root, filtering to current workspace
```
<!-- END DEBUG OUTPUT -->
