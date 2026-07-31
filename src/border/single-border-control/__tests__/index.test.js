/**
 * Tests for SingleBorderControl's token-agnostic extension seam: the width slot renders its own unit
 * control by default, and a consumer can replace just that slot through the
 * `kadence.components.control.editor` filter (color/style stay untouched), receiving only neutral context.
 */
import { render, screen } from '@testing-library/react';
import { addFilter, removeFilter } from '@wordpress/hooks';
import SingleBorderControl from '../index';

const EDITOR_HOOK = 'kadence.components.control.editor';
const NS = 'test/seam';

afterEach(() => {
	removeFilter(EDITOR_HOOK, NS);
});

describe('SingleBorderControl extension seam', () => {
	it('renders the width unit control by default', () => {
		render(<SingleBorderControl value={['#000000', 'solid', 2]} onChange={jest.fn()} onUnit={jest.fn()} />);
		expect(document.querySelector('.components-unit-control')).toBeInTheDocument();
		expect(screen.queryByTestId('override')).not.toBeInTheDocument();
	});

	it('lets a consumer replace the width editor, receiving only neutral context', () => {
		const seen = [];
		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			seen.push(ctx);
			return <div data-testid="override">overridden</div>;
		});

		render(
			<SingleBorderControl
				value={['#000000', 'solid', '2']}
				onChange={jest.fn()}
				onUnit={jest.fn()}
				context={{ blockName: 'kadence/singlebtn', attribute: 'borderWidth' }}
			/>
		);

		expect(screen.getByTestId('override')).toBeInTheDocument();
		expect(seen[0]).toMatchObject({
			control: 'singleBorder',
			value: '2',
			context: { blockName: 'kadence/singlebtn', attribute: 'borderWidth' },
		});
	});

	it('leaves the color and style editors untouched when the width slot is overridden', () => {
		addFilter(EDITOR_HOOK, NS, () => <div data-testid="override">overridden</div>);
		render(<SingleBorderControl value={['#000000', 'solid', '2']} onChange={jest.fn()} onUnit={jest.fn()} />);
		expect(screen.getByLabelText('Border Style')).toBeInTheDocument();
	});
});
