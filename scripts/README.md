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

## Overview

### NPM Scripts (`npm/`)

NPM scripts automate common tasks like managing dependencies, copying assets, and linking packages during development.

**Available scripts:**
- `kadence-packages.js` - Manages Kadence package configurations
- `link-kadence-packages.js` - Links local Kadence packages for development
- `unlink-kadence-packages.js` - Unlinks local Kadence packages

**Internal scripts (`npm/internals/`)**
- `copy-assets.js` - Copies static assets to the distribution folder (used by `npm run copy:assets`)

**Running Scripts Directly**

You can execute scripts directly using Node:

```bash
node scripts/npm/internals/copy-assets.js
node scripts/npm/link-kadence-packages.js
node scripts/npm/unlink-kadence-packages.js
```

> **Tip:** For frequently used scripts, consider adding them to `package.json` under the `"scripts"` section for easier access via `npm run <command>`.

**Quick Setup Tip**

Add this script to your `package.json` for quick access to linking Kadence packages:

```json
"scripts": {
    "link-kadence": "node node_modules/@kadence/components/scripts/npm/link-kadence-packages.js --root=/path-to-local-packages/",
    "unlink-kadence": "node node_modules/@kadence/components/scripts/npm/unlink-kadence-packages.js "
}
```

Then run: `npm run link-kadence`


### Webpack Scripts (`webpack/`)

Webpack scripts extend the webpack build process with custom plugins and utilities for optimizing the bundle.

**Available scripts:**
- `replace-text-domain-plugin.js` - Custom plugin for text domain replacement
- `split-chunk-name.js` - Handles chunk naming in builds
- `style-only-entry-plugin.js` - Plugin for style-only entries

**Using Scripts in Webpack Config**

To use these webpack scripts in your `webpack.config.js`, import them as follows:

```javascript
const ReplaceTextDomainPlugin = require('./scripts/webpack/replace-text-domain-plugin.js');
const StyleOnlyEntryPlugin = require('./scripts/webpack/style-only-entry-plugin.js');

module.exports = {
    // ... webpack configuration
    plugins: [
        new ReplaceTextDomainPlugin({ domain: 'your-text-domain' }),
        new StyleOnlyEntryPlugin(),
    ]
};
```