/**
 * The seam context is a CONTRACT, not a per-control grab bag: every control fills in every field, on
 * both hooks, at every call site. A consumer registers one listener, switches on `ctx.control`, and can
 * read `index` / `value` / `onChange` / `context` without probing for them first.
 *
 * This suite renders every control that mounts a seam and asserts the shape of each context it emits,
 * so a new control (or a new call site in an existing one) cannot quietly drop a field.
 */
import { render } from '@testing-library/react';
import { createReduxStore, register } from '@wordpress/data';
import { addFilter, removeFilter } from '@wordpress/hooks';
import { CONTROL_EDITOR_HOOK, CONTROL_ACTIONS_HOOK } from '../control-extensions';
import ResponsiveMeasurementControl from '../../measurement/responsive-measurement-control';
import ResponsiveBorderControl from '../../border/responsive-border-control';
import ResponsiveMeasureRangeControl from '../../measurement-range-control/responsive';
import RangeControl from '../../range/range-control';
import BoxShadowControl from '../../box-shadow-control';

// Stub the color popover so the control trees render without the real palette/custom-picker UI.
jest.mock('../../pop-color-control', () => () => <div className="mock-pop-color-control" />);

register(
	createReduxStore('kadenceblocks/data', {
		reducer: (state = {}) => state,
		selectors: {
			getPreviewDeviceType: () => 'Desktop',
		},
		actions: {
			setPreviewDeviceType: (deviceType) => ({ type: 'SET_PREVIEW_DEVICE_TYPE', deviceType }),
		},
	})
);

const NS = 'test/contract';
const CONTEXT = { blockName: 'kadence/singlebtn', attribute: 'test' };

const CONTROLS = [
	{
		name: 'ResponsiveMeasurementControl',
		element: (
			<ResponsiveMeasurementControl
				label="Padding"
				value={['0', '0', '0', '0']}
				tabletValue={['0', '0', '0', '0']}
				mobileValue={['0', '0', '0', '0']}
				onChange={jest.fn()}
				onChangeTablet={jest.fn()}
				onChangeMobile={jest.fn()}
				control="individual"
				context={CONTEXT}
			/>
		),
	},
	{
		name: 'ResponsiveBorderControl',
		element: (
			<ResponsiveBorderControl
				label="Border"
				value={[{ top: ['#000000', 'solid', 1], unit: 'px' }]}
				tabletValue={[{ top: ['#000000', 'solid', 1], unit: 'px' }]}
				mobileValue={[{ top: ['#000000', 'solid', 1], unit: 'px' }]}
				onChange={jest.fn()}
				onChangeTablet={jest.fn()}
				onChangeMobile={jest.fn()}
				control="individual"
				context={CONTEXT}
			/>
		),
	},
	{
		name: 'ResponsiveMeasureRangeControl',
		element: (
			<ResponsiveMeasureRangeControl
				label="Padding"
				value={['0', '0', '0', '0']}
				tabletValue={['0', '0', '0', '0']}
				mobileValue={['0', '0', '0', '0']}
				onChange={jest.fn()}
				onChangeTablet={jest.fn()}
				onChangeMobile={jest.fn()}
				control="individual"
				context={CONTEXT}
			/>
		),
	},
	{
		name: 'RangeControl',
		element: <RangeControl label="Size" value={10} onChange={jest.fn()} context={CONTEXT} />,
	},
	{
		// Stores its value across seven props and seven handlers, so it has to compose the contract's
		// single value/onChange pair — the point of the contract is that a listener can't tell.
		name: 'BoxShadowControl',
		element: (
			<BoxShadowControl
				label="Box Shadow"
				enable={true}
				color="#000000"
				colorDefault="#000000"
				opacity={0.5}
				spread={0}
				blur={5}
				hOffset={1}
				vOffset={2}
				inset={false}
				onColorChange={jest.fn()}
				onOpacityChange={jest.fn()}
				onSpreadChange={jest.fn()}
				onBlurChange={jest.fn()}
				onHOffsetChange={jest.fn()}
				onVOffsetChange={jest.fn()}
				onInsetChange={jest.fn()}
				onEnableChange={jest.fn()}
				context={CONTEXT}
			/>
		),
	},
];

/**
 * Render a control with both seams tapped and return every context it emitted.
 *
 * @param {Object} element The control element to render.
 *
 * @return {Array} Every context object seen, across both hooks.
 */
function collectContexts(element) {
	const seen = [];
	const tap = (first, ctx) => {
		seen.push(ctx);
		return first;
	};
	addFilter(CONTROL_EDITOR_HOOK, NS, tap);
	addFilter(CONTROL_ACTIONS_HOOK, NS, tap);

	render(element);

	removeFilter(CONTROL_EDITOR_HOOK, NS);
	removeFilter(CONTROL_ACTIONS_HOOK, NS);
	return seen;
}

describe('seam context contract', () => {
	it.each(CONTROLS)('$name emits a complete context at every seam site', ({ element }) => {
		const contexts = collectContexts(element);
		expect(contexts.length).toBeGreaterThan(0);

		contexts.forEach((ctx) => {
			// Every field is present — `index` and `context` by key, since their values may be null.
			expect(Object.keys(ctx).sort()).toEqual(['context', 'control', 'index', 'onChange', 'value'].sort());
			expect(typeof ctx.control).toBe('string');
			expect(typeof ctx.onChange).toBe('function');
			// `index` is a side (0-3) or null for the whole value — never undefined, never a string.
			expect(ctx.index === null || [0, 1, 2, 3].includes(ctx.index)).toBe(true);
			expect(ctx.context).toEqual(CONTEXT);
		});
	});

	it('numbers the sides top/right/bottom/left as 0-3, whatever order they render in', () => {
		// BorderControl lays the individual sides out top / left / right / bottom, so this pins that
		// `index` follows the value's own side order rather than the visual one.
		const contexts = collectContexts(CONTROLS.find((c) => c.name === 'ResponsiveBorderControl').element);
		const sides = contexts.filter((ctx) => ctx.control === 'singleBorder').map((ctx) => ctx.index);

		expect(sides).toEqual([0, 3, 1, 2]);
	});

	it('leaves the value editor and the action list untouched when nothing is registered', () => {
		const editor = <span>default</span>;
		const { controlEditor, controlActions } = require('../control-extensions');

		expect(controlEditor(editor, { control: 'range', index: null })).toBe(editor);
		expect(controlActions({ control: 'range', index: null })).toEqual([]);
	});
});
