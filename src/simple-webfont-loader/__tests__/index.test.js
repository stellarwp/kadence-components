/**
 * Tests that `KadenceWebfontLoader` actually injects a stylesheet for the font its props name.
 *
 * The regression this guards is narrow and was silent: the component read only `config`, while every
 * caller of this export passes `typography`, so it appended nothing and the block rendered in a
 * fallback face with no error anywhere.
 */
import { render } from '@testing-library/react';
import SimpleWebfontLoader from '../index';

// `withSelect` needs a registered store; the loader only reads the preview device off it.
jest.mock('@wordpress/data', () => ({
	withSelect: () => (WrappedComponent) => (props) => <WrappedComponent {...props} getPreviewDevice="Desktop" />,
}));

/**
 * The stylesheet hrefs the loader appended to the document head.
 *
 * @return {string[]} The hrefs, in append order.
 */
function loadedHrefs() {
	return Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map((link) => link.href);
}

afterEach(() => {
	document.head.querySelectorAll('link[rel="stylesheet"]').forEach((link) => link.remove());
});

describe('KadenceWebfontLoader', () => {
	it('loads the font a typography prop names', () => {
		render(<SimpleWebfontLoader typography={[{ family: 'Abril Fatface', variant: '700' }]} />);

		expect(loadedHrefs()).toEqual([
			'https://fonts.googleapis.com/css2?family=Abril+Fatface:wght@700&display=swap',
		]);
	});

	it('still loads the font a legacy config names', () => {
		render(<SimpleWebfontLoader config={{ google: { families: ['Inter:400'] } }} />);

		expect(loadedHrefs()).toEqual(['https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap']);
	});

	// One stylesheet per font, so a picker listing the catalog never turns into a catalog of requests.
	it('loads only what it was given, once', () => {
		render(
			<SimpleWebfontLoader
				typography={[
					{ family: 'Inter', variant: '400' },
					{ family: 'Inter', variant: '400' },
				]}
			/>
		);

		expect(loadedHrefs()).toHaveLength(1);
	});

	it('loads nothing when no font is named', () => {
		render(<SimpleWebfontLoader typography={[{ family: '' }]} />);

		expect(loadedHrefs()).toEqual([]);
	});

	// The loader mounts in block output rather than behind a selection check, so it must load on
	// first render — that is what makes every block on the page render in its own font on page load.
	it('loads on mount, with no interaction', () => {
		const { container } = render(<SimpleWebfontLoader typography={[{ family: 'Inter' }]} />);

		expect(container).toBeEmptyDOMElement();
		expect(loadedHrefs()).toHaveLength(1);
	});

	// A load pass only appends, so a block that switches families would otherwise keep the old one
	// loaded for the rest of the session -- the opposite of loading only the font its props name.
	it('drops the stylesheet a changed prop no longer names', () => {
		const { rerender } = render(<SimpleWebfontLoader typography={[{ family: 'Inter' }]} />);

		rerender(<SimpleWebfontLoader typography={[{ family: 'Roboto' }]} />);

		expect(loadedHrefs()).toEqual(['https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap']);
	});

	// The face the canvas is painting with stays registered across the change: removing and
	// re-appending it would flash the fallback for as long as the browser took to parse it again.
	it('leaves a stylesheet the new props still name where it is', () => {
		const { rerender } = render(<SimpleWebfontLoader typography={[{ family: 'Inter' }]} />);
		const before = document.head.querySelector('link[rel="stylesheet"]');

		rerender(<SimpleWebfontLoader typography={[{ family: 'Inter' }, { family: 'Roboto' }]} />);

		expect(document.head.querySelector('link[rel="stylesheet"]')).toBe(before);
		expect(loadedHrefs()).toHaveLength(2);
	});

	it('removes its stylesheets on unmount', () => {
		const { unmount } = render(<SimpleWebfontLoader typography={[{ family: 'Inter' }]} />);

		expect(loadedHrefs()).toHaveLength(1);

		unmount();

		expect(loadedHrefs()).toEqual([]);
	});
});
