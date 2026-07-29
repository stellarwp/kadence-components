/**
 * Tests for BoxShadowControl's token-agnostic extension seam: it renders its own inputs (enabled) with no
 * injected header actions by default, disables every sub-input when the generic `readOnly` flag is set,
 * and lets a consumer inject header actions through the `kadence.components.control.actions` filter.
 *
 * The control spreads its value across seven props/handlers, so it also has to compose the single
 * `value` / `onChange` pair the seam contract requires — the last two tests pin that composition.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { addFilter, removeFilter } from '@wordpress/hooks';
import BoxShadowControl from '../index';

// Stub the color popover so the control tree renders without the real palette/custom-picker UI, but keep
// the `disabled` prop visible so the readOnly test can assert it is forwarded.
jest.mock('../../pop-color-control', () => (props) => (
	<div className="mock-pop-color-control">
		<button onClick={() => props.onChange('#ffffff')} disabled={props.disabled}>
			mock color change
		</button>
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

beforeEach(() => {
	jest.clearAllMocks();
});

afterEach(() => {
	removeFilter(ACTIONS_HOOK, NS);
});

// The writer sequences its handler calls across microtasks, so let the whole chain settle.
const flushWrites = () => new Promise((resolve) => setTimeout(resolve, 0));

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

		// X / Y / blur / spread.
		const inputs = document.querySelectorAll('.kt-boxshadow-number-input input');
		expect(inputs.length).toBeGreaterThan(0);
		inputs.forEach((input) => expect(input).toBeDisabled());

		// The preset row and the color swatch are really `disabled`, not just visually inert, so the
		// state reaches assistive tech and keyboard users the same way it reaches the mouse.
		const presets = document.querySelectorAll('.kadence-box-shadow-radio-btns button');
		expect(presets.length).toBeGreaterThan(0);
		presets.forEach((preset) => expect(preset).toBeDisabled());
		expect(screen.getByText('mock color change')).toBeDisabled();

		// The inset toggle too — but the enable toggle stays live so the shadow can be turned off.
		expect(screen.getByLabelText('Inset')).toBeDisabled();
	});

	it('leaves the section untouched by pointer-event trapping', () => {
		const { container } = render(<BoxShadowControl {...baseProps} readOnly />);
		// The read-only class is a neutral name and only dims the section; `disabled` does the blocking.
		expect(container.querySelector('.kt-inner-sub-section--read-only')).toBeInTheDocument();
		expect(container.querySelector('.kt-inner-sub-section--token-driven')).not.toBeInTheDocument();
	});

	it('injects header actions and forwards a context that matches the seam contract', () => {
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
				readOnly
				context={{ blockName: 'kadence/image', attribute: 'boxShadow' }}
			/>
		);

		expect(screen.getByText('injected-action')).toBeInTheDocument();

		// Same five fields as every other control — no `readOnly`, no control-specific extras. The
		// consumer sets `readOnly` itself, so the seam does not need to hand it back.
		expect(Object.keys(seen[0]).sort()).toEqual(['context', 'control', 'index', 'onChange', 'value'].sort());
		expect(seen[0]).toMatchObject({
			control: 'boxShadow',
			index: null,
			value: {
				color: '#000000',
				opacity: 0.5,
				hOffset: 1,
				vOffset: 2,
				blur: 5,
				spread: 0,
				inset: false,
			},
			context: { blockName: 'kadence/image', attribute: 'boxShadow' },
		});
		expect(typeof seen[0].onChange).toBe('function');
	});

	it('composes a writer that fans the whole-shadow shape back out to the individual handlers', async () => {
		let ctx;
		addFilter(ACTIONS_HOOK, NS, (actions, seen) => {
			ctx = seen;
			return actions;
		});
		render(<BoxShadowControl {...baseProps} />);

		await ctx.onChange({ hOffset: 4, vOffset: 6, blur: 10, spread: 2, inset: true, color: '#ff0000' });

		expect(baseProps.onHOffsetChange).toHaveBeenCalledWith(4);
		expect(baseProps.onVOffsetChange).toHaveBeenCalledWith(6);
		expect(baseProps.onBlurChange).toHaveBeenCalledWith(10);
		expect(baseProps.onSpreadChange).toHaveBeenCalledWith(2);
		expect(baseProps.onInsetChange).toHaveBeenCalledWith(true);
		expect(baseProps.onColorChange).toHaveBeenCalledWith('#ff0000');
		// A key the caller left out is not written at all.
		expect(baseProps.onOpacityChange).not.toHaveBeenCalled();
	});

	it('applies a preset through that same writer', async () => {
		render(<BoxShadowControl {...baseProps} />);

		fireEvent.click(screen.getByLabelText('Inner Solid'));
		await flushWrites();

		expect(baseProps.onSpreadChange).toHaveBeenCalledWith(15);
		expect(baseProps.onInsetChange).toHaveBeenCalledWith(true);
	});
});
