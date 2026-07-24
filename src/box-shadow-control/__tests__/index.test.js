/**
 * Tests for BoxShadowControl's token-agnostic extension seams: it renders its own inputs (enabled) with
 * no injected header actions by default, disables every sub-input when the generic `readOnly` flag is
 * set, and lets a consumer inject header actions through the `kadence.components.control.actions` filter,
 * forwarding only neutral context.
 */
import { render, screen } from '@testing-library/react';
import { addFilter, removeFilter } from '@wordpress/hooks';
import BoxShadowControl from '../index';

// Stub the color popover so the control tree renders without the real palette/custom-picker UI.
jest.mock('../../pop-color-control', () => (props) => (
	<div className="mock-pop-color-control">
		<button onClick={() => props.onChange('#ffffff')}>mock color change</button>
	</div>
));

const ACTIONS_HOOK = 'kadence.components.control.actions';
const NS = 'test/seam';

const baseProps = {
	label: 'Box Shadow',
	enable: true,
	color: '#000000',
	colorDefault: '#000000',
	opacity: 0.5,
	spread: 0,
	blur: 5,
	hOffset: 1,
	vOffset: 2,
	inset: false,
	onColorChange: jest.fn(),
	onOpacityChange: jest.fn(),
	onSpreadChange: jest.fn(),
	onBlurChange: jest.fn(),
	onHOffsetChange: jest.fn(),
	onVOffsetChange: jest.fn(),
	onInsetChange: jest.fn(),
	onEnableChange: jest.fn(),
};

afterEach(() => {
	removeFilter(ACTIONS_HOOK, NS);
});

describe('BoxShadowControl extension seams', () => {
	it('renders its inputs enabled and no injected actions by default', () => {
		render(<BoxShadowControl {...baseProps} />);
		const inputs = document.querySelectorAll('.kt-boxshadow-number-input input');
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach((input) => expect(input).not.toBeDisabled());
		expect(screen.queryByText('injected-action')).not.toBeInTheDocument();
	});

	it('disables every sub-input when readOnly is set', () => {
		render(<BoxShadowControl {...baseProps} readOnly />);
		const inputs = document.querySelectorAll('.kt-boxshadow-number-input input');
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach((input) => expect(input).toBeDisabled());
	});

	it('injects header actions and forwards only neutral context', () => {
		const seen = [];
		addFilter(ACTIONS_HOOK, NS, (actions, ctx) => {
			seen.push(ctx);
			return [
				...actions,
				<button key="a" type="button">
					injected-action
				</button>,
			];
		});

		render(
			<BoxShadowControl
				{...baseProps}
				overrideValue="{semantic.shadow.card}"
				readOnly
				context={{ blockName: 'kadence/image', attribute: 'boxShadow' }}
			/>
		);

		expect(screen.getByText('injected-action')).toBeInTheDocument();
		expect(seen[0]).toMatchObject({
			control: 'boxShadow',
			value: '{semantic.shadow.card}',
			readOnly: true,
			context: { blockName: 'kadence/image', attribute: 'boxShadow' },
		});
	});
});
