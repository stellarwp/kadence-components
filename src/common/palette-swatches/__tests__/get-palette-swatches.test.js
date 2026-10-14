/**
 * Internal dependencies
 */
import getPaletteSwatches from '../get-palette-swatches';

const theme = [
	{ name: 'Palette 1', slug: 'theme-palette1', color: '#2B6CB0' },
	{ name: 'Palette 2', slug: 'theme-palette2', color: '#FFFFFF' },
];
const defaultColors = [{ name: 'White', slug: 'white', color: '#ffffff' }];
const custom = [{ name: 'Brand', slug: 'custom-brand', color: '#7a1fa2' }];

describe('getPaletteSwatches', () => {
	it('returns the theme colors when no other origin has colors', () => {
		expect(getPaletteSwatches({ theme, defaultColors: [], custom: [], defaultPalette: false })).toEqual(theme);
	});

	it('lists the user colors after the theme colors', () => {
		expect(getPaletteSwatches({ theme, custom, defaultPalette: false })).toEqual([...theme, ...custom]);
	});

	it('lists the default colors between the theme and user colors when the default palette is enabled', () => {
		expect(getPaletteSwatches({ theme, defaultColors, custom, defaultPalette: true })).toEqual([
			...theme,
			...defaultColors,
			...custom,
		]);
	});

	it('leaves the default colors out when the default palette is disabled', () => {
		expect(getPaletteSwatches({ theme, defaultColors, custom, defaultPalette: false })).toEqual([
			...theme,
			...custom,
		]);
	});

	it('returns an empty list when every origin is missing', () => {
		expect(getPaletteSwatches({})).toEqual([]);
	});

	it('keeps entries of different origins that share a color value', () => {
		const userWhite = { name: 'Paper', slug: 'custom-paper', color: '#ffffff' };

		expect(getPaletteSwatches({ theme: [], defaultColors, custom: [userWhite], defaultPalette: true })).toEqual([
			defaultColors[0],
			userWhite,
		]);
	});
});
