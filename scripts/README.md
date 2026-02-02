# Scripts Directory

This directory contains utility scripts for building and managing the Kadence Components library.

## Overview

### NPM Scripts (`npm/`)

NPM scripts automate common tasks like managing dependencies, copying assets, and linking packages during development.

**Available scripts:**
- `copy-assets.js` - Copies static assets to the distribution folder
- `kadence-packages.js` - Manages Kadence package configurations
- `link-kadence-packages.js` - Links local Kadence packages for development
- `unlink-kadence-packages.js` - Unlinks local Kadence packages


**Running Scripts Directly**

You can execute scripts directly using Node:

```bash
node scripts/npm/copy-assets.js
node scripts/npm/link-kadence-packages.js
node scripts/npm/unlink-kadence-packages.js
```

> **Tip:** For frequently used scripts, consider adding them to `package.json` under the `"scripts"` section for easier access via `npm run <command>`.


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