# Basic Example

This is a simple example showing how `installed-check` works with a basic Node.js project.

## What's in This Example

This example uses:
- `chalk@^4.0.0` - A popular terminal coloring library
- `meow@^13.0.0` - A CLI helper library in devDependencies

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

This example passes all checks cleanly, demonstrating a correctly configured package.

<!-- BEGIN EXPECTED OUTPUT -->
```

```
<!-- END EXPECTED OUTPUT -->

The empty output indicates success - all dependencies are properly installed and configured!
