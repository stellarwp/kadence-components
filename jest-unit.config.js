/**
 * Jest configuration for the package's unit tests.
 *
 * Built from `@wordpress/jest-preset-default`'s own settings (JSX babel transform, scss mocking,
 * jsdom environment, testMatch) rather than via Jest's `preset` field, so `setupFilesAfterEnv`
 * below replaces the preset's list instead of being concatenated onto it.
 */
const wpJestPreset = require('@wordpress/jest-preset-default/jest-preset.js');

module.exports = {
	...wpJestPreset,
	setupFilesAfterEnv: ['<rootDir>/test/config/jest.setup.js'],
	testPathIgnorePatterns: [...(wpJestPreset.testPathIgnorePatterns || []), '<rootDir>/dist/'],
};
