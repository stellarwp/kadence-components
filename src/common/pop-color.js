/* global kadence_blocks_params */
/**
 * Shared helpers for the pop color controls (`SinglePopColorControl`, `InlinePopColorControl`).
 *
 * The swatch-list filtering + seam and the picker color resolution were duplicated verbatim in both
 * controls; centralizing them here keeps the two in lock-step and the controls lean.
 */
import { applyFilters } from '@wordpress/hooks';
import { KadenceColorOutput } from '@kadence/helpers';

/**
 * The Kadence Blocks color configuration, parsed from the localized params. Falls back to an empty,
 * non-override config when the global is absent or malformed.
 *
 * @since TBD
 *
 * @return {{ palette: Array, override: boolean }} The color configuration.
 */
export function getKadenceColorConfig() {
	if (typeof kadence_blocks_params !== 'undefined' && kadence_blocks_params.colors) {
		try {
			return JSON.parse(kadence_blocks_params.colors);
		} catch (e) {
			return { palette: [], override: false };
		}
	}

	return { palette: [], override: false };
}

/**
 * The swatch list a pop color control renders: the editor palette narrowed by the "Use only Custom
 * Colors" override, then passed through the `kadence.components.popColorControl.colors` filter so a
 * consuming plugin can augment or replace it without this package knowing about its color model.
 * Strictly additive by default — with no listener registered the filtered list is returned unchanged.
 *
 * @param {Array}   allColors The full editor color palette (from useSetting('color.palette')).
 * @param {boolean} override  Whether the "Use only Custom Colors" override is on.
 *
 * @since TBD
 *
 * @return {Array} The swatches to render.
 */
export function getPopColorSwatches(allColors, override) {
	if (!allColors || !Array.isArray(allColors)) {
		return [];
	}

	// Override on: only custom (kb-palette) colors. Override off: theme + custom.
	const filtered =
		override === true ? allColors.filter((color) => color.slug && color.slug.startsWith('kb-palette')) : allColors;

	return applyFilters('kadence.components.popColorControl.colors', filtered, { allColors, override });
}

/**
 * Flatten a color value to a concrete literal the color picker can consume: a token reference or palette
 * slug is resolved (through @kadence/helpers) to its CSS var, whose computed value is read off the
 * document root; a literal (hex/rgba) is returned unchanged. Without this the picker falls back to black
 * on a non-literal value.
 *
 * @param {string} value The current color value (token reference, palette slug, var, or literal).
 *
 * @since TBD
 *
 * @return {string} A concrete color the picker can render.
 */
export function toConcreteColor(value) {
	const resolved = KadenceColorOutput(value);

	if (resolved && resolved.startsWith('var(')) {
		const computed = window
			.getComputedStyle(document.documentElement)
			.getPropertyValue(resolved.slice(4, -1).split(',')[0].trim());

		if (computed) {
			return computed.trim();
		}
	}

	return resolved;
}
