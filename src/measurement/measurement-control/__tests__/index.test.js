/**
 * Tests for MeasurementControl's token-agnostic extension seam: it renders its own editors by default
 * and lets a consumer replace an editor through the `kadence.components.control.editor` filter, receiving
 * only neutral context ({ control, index, value, onChange, context }).
 */
import { render, screen } from '@testing-library/react';
import { addFilter, removeFilter } from '@wordpress/hooks';
import MeasurementControl from '../index';

const EDITOR_HOOK = 'kadence.components.control.editor';
const NS = 'test/seam';

afterEach(() => {
	removeFilter(EDITOR_HOOK, NS);
});

describe('MeasurementControl extension seam', () => {
	it('renders without an override when nothing is registered', () => {
		render(<MeasurementControl measurement={['0', '0', '0', '0']} control="linked" onChange={jest.fn()} />);
		expect(screen.queryByTestId('override')).not.toBeInTheDocument();
	});

	it('lets a consumer replace the editor, receiving only neutral context', () => {
		const seen = [];
		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			seen.push(ctx);
			return ctx.index === null ? <div data-testid="override">overridden</div> : editor;
		});

		render(
			<MeasurementControl
				measurement={['0', '0', '0', '0']}
				control="linked"
				onChange={jest.fn()}
				context={{ blockName: 'kadence/singlebtn', attribute: 'padding' }}
			/>
		);

		expect(screen.getByTestId('override')).toBeInTheDocument();
		const allSite = seen.find((ctx) => ctx.index === null);
		expect(allSite).toMatchObject({
			control: 'measure',
			context: { blockName: 'kadence/singlebtn', attribute: 'padding' },
		});
	});

	it('passes a per-side index at each individual editor site', () => {
		const indexes = [];
		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			indexes.push(ctx.index);
			return editor;
		});

		render(<MeasurementControl measurement={['0', '0', '0', '0']} control="individual" onChange={jest.fn()} />);

		expect(indexes).toEqual(expect.arrayContaining([0, 1, 2, 3]));
	});
});
