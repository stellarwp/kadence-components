/**
 * WordPress dependencies
 */
import { useSettings } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import getPaletteSwatches from './get-palette-swatches';

export { getPaletteSwatches };

/**
 * Reads every palette origin from the editor settings and returns the swatch list the Kadence color controls offer.
 *
 * The resolved `color.palette` setting returns a single origin (user colors replace the theme colors), so each
 * origin is read on its own path.
 *
 * @since TBD
 *
 * @return {import('./get-palette-swatches').PaletteColor[]} Theme, default (when enabled) and user palette colors.
 */
export function usePaletteSwatches() {
	const [theme, defaultColors, custom, defaultPalette] = useSettings(
		'color.palette.theme',
		'color.palette.default',
		'color.palette.custom',
		'color.defaultPalette'
	);

	return useMemo(
		() => getPaletteSwatches({ theme, defaultColors, custom, defaultPalette }),
		[theme, defaultColors, custom, defaultPalette]
	);
}
