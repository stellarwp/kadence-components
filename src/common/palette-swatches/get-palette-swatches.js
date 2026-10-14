/**
 * A palette entry as the editor settings store it.
 *
 * @typedef {Object} PaletteColor
 * @property {string} name  Color name shown in the tooltip.
 * @property {string} slug  Color slug.
 * @property {string} color Color value.
 */

/**
 * Builds the swatch list the Kadence color controls offer, in the order core's color panel shows the palette
 * origins: theme colors, then WordPress default colors when the default palette is enabled, then user colors.
 *
 * @since TBD
 *
 * @param {Object}              origins                The palette origins.
 * @param {PaletteColor[]}      [origins.theme]        Theme palette colors.
 * @param {PaletteColor[]}      [origins.defaultColors] WordPress default palette colors.
 * @param {PaletteColor[]}      [origins.custom]       User palette colors from Global Styles.
 * @param {boolean}             [origins.defaultPalette] Whether the default palette is enabled.
 * @return {PaletteColor[]} The palette colors of every origin, each entry kept as its own swatch.
 */
export default function getPaletteSwatches({ theme, defaultColors, custom, defaultPalette }) {
	const asList = (colors) => (Array.isArray(colors) ? colors : []);

	return [...asList(theme), ...(defaultPalette ? asList(defaultColors) : []), ...asList(custom)];
}
