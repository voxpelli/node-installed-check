# Basic Example

This is a simple example showing how `installed-check` works with a basic Node.js project.

## What's in This Example

This example demonstrates a common issue - a dependency (`meow`) has a stricter `engines.node` requirement than the package itself:
- `chalk@^4.0.0` - A popular terminal coloring library
- `meow@^14.0.0` - A CLI helper library (requires Node >=20, but package specifies >=18.6.0)

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

meow: Narrower "engines.node" is needed: >=20.0.0

Suggestions:

Combined "engines.node" needs to be narrower: >=20.0.0
```
<!-- END EXPECTED OUTPUT -->
