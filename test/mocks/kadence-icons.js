/**
 * Jest mock for the `@kadence/icons` peer dependency.
 *
 * The real package is a sibling GitHub-only repo not installed in this package's own test
 * environment (it is provided by the consuming app's build, e.g. kadence-blocks). Control tests
 * only pass icon values through as opaque props, so any stand-in value is sufficient — a Proxy
 * satisfies every named import without needing to enumerate each icon export.
 */
module.exports = new Proxy(
	{},
	{
		get: () => 'kadence-icon-mock',
	}
);
