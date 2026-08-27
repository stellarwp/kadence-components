/**
 * Tests for TypographyControls' token-agnostic font-family extension seam: it renders its own
 * react-select by default, and a consumer can replace just that editor through
 * `kadence.components.control.editor`, receiving only neutral context and writing back a plain
 * family string.
 *
 * The seam exists because the family select gates the font weight / style / subset selects behind
 * the same `onFontFamily` prop — a block cannot drop the prop to substitute its own picker without
 * silently losing those three controls too.
 */
import { render, screen } from '@testing-library/react';
import { addFilter, removeFilter } from '@wordpress/hooks';
import TypographyControls from '../index';

const EDITOR_HOOK = 'kadence.components.control.editor';
const NS = 'test/seam';

// Deliberately no consuming-plugin global: the control assembles an empty font list and renders,
// which is exactly the standalone case a seam consumer relies on.

/**
 * The minimum prop set that renders the font-family block: the select is gated on both
 * `onFontFamily` and the clear handler the control derives from `onFontArrayChange`.
 *
 * @param {Object} overrides Props to add or replace.
 *
 * @return {Object} The props to render with.
 */
function props(overrides = {}) {
	return {
		fontFamily: 'Inter',
		onFontFamily: jest.fn(),
		onFontArrayChange: jest.fn(),
		...overrides,
	};
}

afterEach(() => {
	removeFilter(EDITOR_HOOK, NS);
});

describe('TypographyControls font-family extension seam', () => {
	it('renders its own font-family select by default', () => {
		render(<TypographyControls {...props()} />);

		expect(document.querySelector('.typography-family-select-form-row')).toBeInTheDocument();
		expect(screen.queryByTestId('override')).not.toBeInTheDocument();
	});

	it('lets a consumer replace the font-family editor, receiving only neutral context', () => {
		const seen = [];

		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			if (ctx.control !== 'fontFamily') {
				return editor;
			}

			seen.push(ctx);

			return <div data-testid="override">overridden</div>;
		});

		render(<TypographyControls {...props({ context: { blockName: 'kadence/singlebtn' } })} />);

		expect(screen.getByTestId('override')).toBeInTheDocument();
		expect(seen[0]).toMatchObject({
			control: 'fontFamily',
			index: null,
			value: 'Inter',
			context: { blockName: 'kadence/singlebtn' },
		});
	});

	// With no consuming-plugin global there are no options to match, so this also covers the
	// synthesize path: a family the option list does not carry still writes.
	it('writes a plain family string back through the seam, with no react-select option shape', () => {
		const onFontArrayChange = jest.fn();

		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			if (ctx.control !== 'fontFamily') {
				return editor;
			}

			return (
				<button type="button" data-testid="pick" onClick={() => ctx.onChange('Abril Fatface')}>
					pick
				</button>
			);
		});

		render(<TypographyControls {...props({ onFontArrayChange })} />);

		screen.getByTestId('pick').click();

		expect(onFontArrayChange).toHaveBeenCalledWith(expect.objectContaining({ family: 'Abril Fatface' }));
	});

	it('treats an empty family from the seam as a clear', () => {
		const onFontArrayChange = jest.fn();

		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			if (ctx.control !== 'fontFamily') {
				return editor;
			}

			return (
				<button type="button" data-testid="clear" onClick={() => ctx.onChange('')}>
					clear
				</button>
			);
		});

		render(<TypographyControls {...props({ onFontArrayChange })} />);

		screen.getByTestId('clear').click();

		expect(onFontArrayChange).toHaveBeenCalledWith(expect.objectContaining({ family: '', weight: 'inherit' }));
	});
});
