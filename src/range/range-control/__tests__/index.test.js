/**
 * Tests for RangeControl's token-agnostic extension seams: it renders its own editor and no injected
 * actions by default, and a consumer can replace the editor or inject header actions through the
 * `kadence.components.control.*` filters, receiving only neutral context.
 */
import { render, screen } from '@testing-library/react';
import { addFilter, removeFilter } from '@wordpress/hooks';
import RangeControl from '../index';

const EDITOR_HOOK = 'kadence.components.control.editor';
const ACTIONS_HOOK = 'kadence.components.control.actions';
const NS = 'test/seam';

afterEach(() => {
	removeFilter(EDITOR_HOOK, NS);
	removeFilter(ACTIONS_HOOK, NS);
});

describe('RangeControl extension seams', () => {
	it('renders its own editor and no injected actions by default', () => {
		render(<RangeControl label="Width" value="10" onChange={jest.fn()} />);
		expect(document.querySelector('.kadence-range-control-range')).toBeInTheDocument();
		expect(screen.queryByText('injected-action')).not.toBeInTheDocument();
	});

	it('lets a consumer replace the editor, receiving only neutral context', () => {
		const seen = [];
		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			seen.push(ctx);
			return <div data-testid="override">overridden</div>;
		});

		render(<RangeControl label="Width" value="10" onChange={jest.fn()} context={{ blockName: 'kadence/singlebtn', attribute: 'width' }} />);

		expect(screen.getByTestId('override')).toBeInTheDocument();
		expect(seen[0]).toMatchObject({
			control: 'range',
			value: '10',
			context: { blockName: 'kadence/singlebtn', attribute: 'width' },
		});
	});

	it('renders header actions a consumer injects through the actions filter', () => {
		addFilter(ACTIONS_HOOK, NS, (actions) => [
			...actions,
			<button key="a" type="button">
				injected-action
			</button>,
		]);

		render(<RangeControl label="Width" value="10" onChange={jest.fn()} />);

		expect(screen.getByText('injected-action')).toBeInTheDocument();
	});
});
