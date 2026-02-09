# Basic Example

This is a simple example showing how `installed-check` works with a basic Node.js project.

## What's in This Example

This example uses:
- `chalk@^4.0.0` - An older version to demonstrate version checking
- `meow@^13.0.0` - A devDependency that may be flagged as unused

## Usage

```bash
# From the repository root
cd examples/basic
npm install
cd ../..

# Run installed-check
node cli-wrapper.cjs examples/basic
```

## Example Output

<!-- BEGIN EXPECTED OUTPUT -->
```
Errors:

knip: Narrower "engines.node" is needed: >=18.18.0

Suggestions:

Combined "engines.node" needs to be narrower: >=18.18.0
```
<!-- END EXPECTED OUTPUT -->

This demonstrates how `installed-check` helps identify issues in your dependency declarations.
