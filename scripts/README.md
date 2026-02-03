# Scripts Directory

This directory contains utility scripts for building and managing the Kadence Components library.

## Directory Structure

```
scripts/
├── helpers/          # Shared utility functions used across scripts
├── npm/              # NPM-related automation scripts
│   └── internals/    # Internal helper scripts for NPM tasks
└── webpack/          # Custom Webpack plugins and build utilities
```

## NPM Scripts (`npm/`)

Automate tasks like managing dependencies, copying assets, and linking packages during development.

**Available scripts:**
- `kadence-packages.js` - Manages Kadence package configurations
- `link-kadence-packages.js` - Links local Kadence packages for development
- `unlink-kadence-packages.js` - Unlinks local Kadence packages

**Usage:**

Run scripts directly with Node:

```bash
node scripts/npm/link-kadence-packages.js --root=/path-to-local-packages/
node scripts/npm/unlink-kadence-packages.js --root=/path-to-local-packages/
```

Or add to your `package.json` for quick access:

```json
"scripts": {
    "link-kadence-packages": "node node_modules/@kadence/components/scripts/npm/link-kadence-packages.js --root=/path-to-local-packages/",
    "unlink-kadence-packages": "node node_modules/@kadence/components/scripts/npm/unlink-kadence-packages.js --root=/path-to-local-packages/"
}
```

Then run: `npm run link-kadence-packages`.

## Webpack Scripts (`webpack/`)

Custom plugins and utilities for optimizing the webpack build.

**Available scripts:**
- `replace-text-domain-plugin.js` - Custom plugin for text domain replacement
- `split-chunk-name.js` - Handles chunk naming in builds
- `style-only-entry-plugin.js` - Plugin for style-only entries

**Usage in webpack.config.js:**

```javascript
const ReplaceTextDomainPlugin = require('./scripts/webpack/replace-text-domain-plugin.js');
const StyleOnlyEntryPlugin = require('./scripts/webpack/style-only-entry-plugin.js');

module.exports = {
    // ... webpack configuration
    plugins: [
        new ReplaceTextDomainPlugin( {
            placeholder: TEXT_DOMAIN_PLACEHOLDER,
            value: TEXT_DOMAIN,
        } );
        new StyleOnlyEntryPlugin(),
    ]
};
```