/**
 * Turns what a block stores about a font into the Google Fonts request that loads it.
 *
 * Pure and DOM-free so it can be tested without mounting the loader, and so the two prop shapes the
 * loader accepts converge here rather than in the component.
 *
 * Both shapes carry the same information in different arrangements:
 *
 * - `typography` — `[{ family, variant, weight, style }]`, the shape a block's own attribute has.
 * - `config` — `{ google: { families: [ 'Inter:700italic' ] } }`, the shape `webfontloader` took,
 *   where the variant is already joined onto the family with a colon.
 *
 * The colon form is the one worth calling out: it is `webfontloader`'s syntax, and this loader talks
 * to the **css2** endpoint, which does not accept it. `family=Inter:700italic` is a 400 from Google,
 * so a joined variant has to be split back apart and re-expressed as `ital,wght` before it can be
 * asked for.
 */

/**
 * A Google variant string, as stored: `regular`, `italic`, `500`, `700italic`.
 *
 * @since TBD
 *
 * @type {RegExp}
 */
const VARIANT_PATTERN = /^(\d{3})?(italic)?$/;

/**
 * Split a stored variant into the two axes css2 addresses. Anything unrecognized (including an empty
 * variant) reads as upright 400, which is what a family loads at when no axis is requested.
 *
 * @param {string} variant The stored variant.
 *
 * @since TBD
 *
 * @return {{weight: string, italic: boolean}} The axes.
 */
export function parseVariant(variant) {
	const value = String(variant ?? '')
		.trim()
		.toLowerCase();

	if (value === '' || value === 'regular' || value === 'normal') {
		return { weight: '400', italic: false };
	}

	if (value === 'italic') {
		return { weight: '400', italic: true };
	}

	const match = value.match(VARIANT_PATTERN);

	if (!match) {
		return { weight: '400', italic: false };
	}

	return { weight: match[1] || '400', italic: Boolean(match[2]) };
}

/**
 * Normalize one font — from either prop shape — to the family and axes to request, or null when it
 * names no family to load.
 *
 * A `typography` entry may carry `variant` or the `weight`/`style` pair, depending on which handler
 * last wrote it; `variant` wins because it is the one Google's own font list uses, and the pair is
 * read only to fill the gap when it is absent. Absent covers null and blank as well as missing: an
 * entry that carries an empty `variant` beside a real `weight` is naming the pair, not upright 400.
 *
 * @param {string|Object} font A `config` family string, or a `typography` entry.
 *
 * @since TBD
 *
 * @return {?{family: string, weight: string, italic: boolean}} The request, or null.
 */
export function toFontRequest(font) {
	if (typeof font === 'string') {
		const [family, variant] = font.split(':');

		return family.trim() === '' ? null : { family: family.trim(), ...parseVariant(variant) };
	}

	if (!font || typeof font !== 'object') {
		return null;
	}

	const family = String(font.family ?? '').trim();

	if (family === '') {
		return null;
	}

	const variant = String(font.variant ?? '').trim();

	if (variant !== '') {
		return { family, ...parseVariant(variant) };
	}

	const weight = String(font.weight ?? '').trim();
	const italic = String(font.style ?? '')
		.trim()
		.toLowerCase() === 'italic';

	return {
		family,
		weight: /^\d{3}$/.test(weight) ? weight : '400',
		italic,
	};
}

/**
 * The css2 stylesheet URL for one font request.
 *
 * `display=swap` keeps text visible while the file downloads, which matters more in the editor than
 * on the front end: a canvas that blanks its text mid-edit reads as the editor breaking.
 *
 * @param {{family: string, weight: string, italic: boolean}} request The font request.
 *
 * @since TBD
 *
 * @return {string} The stylesheet URL.
 */
export function fontUrl(request) {
	const family = request.family.replace(/ /g, '+');
	const axis = request.italic ? `ital,wght@1,${request.weight}` : `wght@${request.weight}`;

	return `https://fonts.googleapis.com/css2?family=${family}:${axis}&display=swap`;
}

/**
 * Every font a loader's props ask for, deduplicated, as `{ key, url }` pairs.
 *
 * `typography` wins over `config` when both are present: the ~19 call sites that pass `typography`
 * are the ones this exists for, and a caller passing both is describing one font twice. An empty
 * `typography` array wins too — a block that names no font is asking for none, and falling through
 * to `config` there would load a font it has stopped asking for.
 *
 * @param {Object}                props           The loader's props.
 * @param {Array}                 [props.typography] The block's typography attribute.
 * @param {{google: {families: Array}}} [props.config] The legacy config shape.
 *
 * @since TBD
 *
 * @return {Array<{key: string, url: string}>} The stylesheets to load, in order, without duplicates.
 */
export function fontRequests({ typography, config } = {}) {
	const source = Array.isArray(typography) ? typography : config?.google?.families;

	if (!Array.isArray(source)) {
		return [];
	}

	const seen = new Set();
	const requests = [];

	source.forEach((font) => {
		const request = toFontRequest(font);

		if (!request) {
			return;
		}

		// Keyed by family AND axes, so one family at two weights loads both — and so the same font
		// asked for twice loads once.
		const key = `${request.family}:${request.italic ? 'i' : 'n'}${request.weight}`;

		if (seen.has(key)) {
			return;
		}

		seen.add(key);
		requests.push({ key, url: fontUrl(request) });
	});

	return requests;
}
