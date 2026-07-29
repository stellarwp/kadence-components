/**
 * Jest mock for the `@kadence/helpers` peer dependency.
 *
 * The real package is a sibling GitHub-only repo not installed in this package's own test
 * environment (it is provided by the consuming app's build, e.g. kadence-blocks). These stand-ins
 * reproduce just enough behavior for the control tests, which do not assert on helper internals.
 */
module.exports = {
	capitalizeFirstLetter: (value) => (value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : value),
	objectSameFill: () => true,
	clearNonMatchingValues: (current, next) => next,
	KadenceColorOutput: (color) => color,
};
