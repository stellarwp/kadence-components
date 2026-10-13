/**
 * Tests for the font-request derivation behind `KadenceWebfontLoader`: what a block stores turned
 * into the css2 stylesheets that actually load it.
 */
import { fontRequests, fontUrl, parseVariant, toFontRequest } from '../font-request';

describe('parseVariant', () => {
	it.each([
		['', { weight: '400', italic: false }],
		['regular', { weight: '400', italic: false }],
		['normal', { weight: '400', italic: false }],
		['italic', { weight: '400', italic: true }],
		['700', { weight: '700', italic: false }],
		['700italic', { weight: '700', italic: true }],
		['100italic', { weight: '100', italic: true }],
	])('reads %p as %p', (variant, expected) => {
		expect(parseVariant(variant)).toEqual(expected);
	});

	// A variant Google never emits must still load the family at a sane weight rather than producing
	// a URL the endpoint rejects, which would drop the font entirely.
	it.each([undefined, null, 'bold', '12', 'wght@700'])('falls back to upright 400 for %p', (variant) => {
		expect(parseVariant(variant)).toEqual({ weight: '400', italic: false });
	});
});

describe('toFontRequest', () => {
	it('splits the colon form the config shape uses', () => {
		expect(toFontRequest('Inter:700italic')).toEqual({ family: 'Inter', weight: '700', italic: true });
	});

	it('reads a bare family as upright 400', () => {
		expect(toFontRequest('Inter')).toEqual({ family: 'Inter', weight: '400', italic: false });
	});

	it('reads a typography entry by its variant', () => {
		expect(toFontRequest({ family: 'Inter', variant: '500' })).toEqual({
			family: 'Inter',
			weight: '500',
			italic: false,
		});
	});

	// `variant` is what Google's own font list uses, so it wins; weight/style only fill the gap.
	it('prefers variant over the weight/style pair', () => {
		expect(toFontRequest({ family: 'Inter', variant: '700', weight: '300', style: 'italic' })).toEqual({
			family: 'Inter',
			weight: '700',
			italic: false,
		});
	});

	it('falls back to the weight/style pair when there is no variant', () => {
		expect(toFontRequest({ family: 'Inter', weight: '300', style: 'italic' })).toEqual({
			family: 'Inter',
			weight: '300',
			italic: true,
		});
	});

	// A handler that clears the variant may write null or a blank rather than dropping the key, and
	// reading that as upright 400 would throw away the weight and style sitting beside it.
	it.each([null, undefined, '', '   '])('falls back to the pair when variant is %p', (variant) => {
		expect(toFontRequest({ family: 'Inter', variant, weight: '300', style: 'italic' })).toEqual({
			family: 'Inter',
			weight: '300',
			italic: true,
		});
	});

	it.each([null, undefined, '', ':700', { family: '' }, { family: '   ' }, 42])(
		'returns null for %p, which names no family',
		(font) => {
			expect(toFontRequest(font)).toBeNull();
		}
	);
});

describe('fontUrl', () => {
	// The whole bug: css2 rejects `family=Inter:700`, so a joined variant has to become an axis.
	it('expresses weight as a wght axis, not a colon-joined variant', () => {
		expect(fontUrl({ family: 'Inter', weight: '700', italic: false })).toBe(
			'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap'
		);
	});

	it('adds the ital axis for an italic', () => {
		expect(fontUrl({ family: 'Inter', weight: '700', italic: true })).toBe(
			'https://fonts.googleapis.com/css2?family=Inter:ital,wght@1,700&display=swap'
		);
	});

	// Every family Google publishes is alphanumeric and spaces, so this is not for them: `family` is
	// whatever a block stored, and an `&` or a `#` would otherwise end the query string early.
	it('encodes a family name that is not URL-safe', () => {
		expect(fontUrl({ family: 'Ampersand & Hash #1', weight: '400', italic: false })).toBe(
			'https://fonts.googleapis.com/css2?family=Ampersand+%26+Hash+%231:wght@400&display=swap'
		);
	});

	// The previous URL builder substituted `+` for the space and then encoded it, which asked Google
	// for a family with a literal plus in its name -- a 400 for every multi-word family.
	it('does not encode the plus signs it substitutes for spaces', () => {
		expect(fontUrl({ family: 'Abril Fatface', weight: '400', italic: false })).not.toContain('%2B');
	});

	it('joins a multi-word family with plus signs', () => {
		expect(fontUrl({ family: 'Abril Fatface', weight: '400', italic: false })).toBe(
			'https://fonts.googleapis.com/css2?family=Abril+Fatface:wght@400&display=swap'
		);
	});
});

describe('fontRequests', () => {
	it('reads the typography prop every KadenceWebfontLoader caller passes', () => {
		expect(fontRequests({ typography: [{ family: 'Inter', variant: '700' }] })).toEqual([
			{
				key: 'Inter:n700',
				url: 'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap',
			},
		]);
	});

	it('still reads the legacy config shape', () => {
		expect(fontRequests({ config: { google: { families: ['Inter:700'] } } })).toEqual([
			{
				key: 'Inter:n700',
				url: 'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap',
			},
		]);
	});

	// An empty typography array is a block naming no font, not a block declining to answer, so the
	// legacy config must not fill in behind it.
	it('lets an empty typography array win over a legacy config', () => {
		const requests = fontRequests({
			typography: [],
			config: { google: { families: ['Inter'] } },
		});

		expect(requests).toEqual([]);
	});

	it('prefers typography when a caller somehow passes both', () => {
		const requests = fontRequests({
			typography: [{ family: 'Georgia' }],
			config: { google: { families: ['Inter'] } },
		});

		expect(requests.map((request) => request.key)).toEqual(['Georgia:n400']);
	});

	// One family at two weights is two stylesheets; the same font twice is one.
	it('deduplicates by family and axes together', () => {
		const requests = fontRequests({
			typography: [
				{ family: 'Inter', variant: '400' },
				{ family: 'Inter', variant: '700' },
				{ family: 'Inter', variant: '400' },
			],
		});

		expect(requests.map((request) => request.key)).toEqual(['Inter:n400', 'Inter:n700']);
	});

	it('skips entries that name no family rather than requesting a blank one', () => {
		const requests = fontRequests({ typography: [{ family: '' }, { family: 'Inter' }, null] });

		expect(requests.map((request) => request.key)).toEqual(['Inter:n400']);
	});

	it.each([{}, { typography: [] }, { config: {} }, { config: { google: {} } }, undefined])(
		'asks for nothing given %p',
		(props) => {
			expect(fontRequests(props)).toEqual([]);
		}
	);
});
