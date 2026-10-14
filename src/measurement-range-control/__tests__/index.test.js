/**
 * Tests for MeasureRangeControl's generic, token-agnostic extension seams. With nothing registered the
 * control renders its own editors and no extra header actions. A consumer can replace an editor or inject
 * header actions through the `kadence.components.control.*` `@wordpress/hooks` filters, and the control
 * forwards only neutral context ({ control, index, value, onChange, context }) — no token vocabulary.
 */
import { render, screen } from '@testing-library/react';
import { addFilter, removeFilter } from '@wordpress/hooks';
import MeasureRangeControl from '../index';

const EDITOR_HOOK = 'kadence.components.control.editor';
const ACTIONS_HOOK = 'kadence.components.control.actions';
const NS = 'test/seam';

afterEach(() => {
	removeFilter(EDITOR_HOOK, NS);
	removeFilter(ACTIONS_HOOK, NS);
});

describe('MeasureRangeControl extension seams', () => {
	it('renders its own editor and no injected actions when nothing is registered', () => {
		render(<MeasureRangeControl label="Padding" value={['0', '0', '0', '0']} control="linked" onChange={jest.fn()} />);
		expect(document.querySelector('.kb-measure-input-all-inputs')).toBeInTheDocument();
		expect(screen.queryByText('injected-action')).not.toBeInTheDocument();
	});

	it('lets a consumer replace the editor through the filter, receiving only neutral context', () => {
		const seen = [];
		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			seen.push(ctx);
			return ctx.index === null ? <div data-testid="override">overridden</div> : editor;
		});

		render(
			<MeasureRangeControl
				label="Padding"
				value={['0', '0', '0', '0']}
				control="linked"
				onChange={jest.fn()}
				context={{ blockName: 'kadence/singlebtn', attribute: 'borderRadius' }}
			/>
		);

		expect(screen.getByTestId('override')).toBeInTheDocument();

		const allSite = seen.find((ctx) => ctx.index === null);
		expect(allSite).toMatchObject({
			control: 'measureRange',
			context: { blockName: 'kadence/singlebtn', attribute: 'borderRadius' },
		});
		expect(allSite.value).toEqual(['0', '0', '0', '0']);
		expect(typeof allSite.onChange).toBe('function');
	});

	it('renders header actions a consumer injects through the actions filter', () => {
		addFilter(ACTIONS_HOOK, NS, (actions) => [
			...actions,
			<button key="a" type="button">
				injected-action
			</button>,
		]);

		render(<MeasureRangeControl label="Padding" value={['0', '0', '0', '0']} onChange={jest.fn()} />);

		expect(screen.getByText('injected-action')).toBeInTheDocument();
	});

	it('passes a per-side index at each individual editor site', () => {
		const indexes = [];
		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			indexes.push(ctx.index);
			return editor;
		});

		render(
			<MeasureRangeControl label="Padding" value={['0', '0', '0', '0']} control="individual" onChange={jest.fn()} />
		);

		expect(indexes).toEqual(expect.arrayContaining([0, 1, 2, 3]));
	});
});
