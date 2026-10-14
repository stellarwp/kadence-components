/**
 * Jest configuration for the package's unit tests.
 *
 * Built from `@wordpress/jest-preset-default`'s own settings (JSX babel transform, scss mocking,
 * jsdom environment, testMatch) rather than via Jest's `preset` field: Jest MERGES (concatenates)
 * array-valued options like `setupFilesAfterEnv` between a preset and the local config, so setting
 * `preset` directly would keep `@wordpress/jest-console`'s strict fail-on-console-warning behavior
 * even after this file lists its own `setupFilesAfterEnv`. This package's control tests render
 * against a newer test-only `@wordpress/components` devDependency than the one the consuming app
 * (e.g. kadence-blocks) actually provides at runtime, which emits deprecation warnings unrelated to
 * the behavior under test — so that strict policing does not apply here.
 */
const wpJestPreset = require('@wordpress/jest-preset-default/jest-preset.js');

module.exports = {
	...wpJestPreset,
	setupFilesAfterEnv: ['<rootDir>/test/config/jest.setup.js'],
	moduleNameMapper: {
		...wpJestPreset.moduleNameMapper,
		'^@kadence/icons$': '<rootDir>/test/mocks/kadence-icons.js',
		'^@kadence/helpers$': '<rootDir>/test/mocks/kadence-helpers.js',
	},
	testPathIgnorePatterns: [...(wpJestPreset.testPathIgnorePatterns || []), '<rootDir>/dist/'],
};
