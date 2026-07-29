/**
 * Tests for ResponsiveBorderControl's token-agnostic extension seams: it injects header actions through
 * the actions filter and forwards its opaque `context` down to the nested width-slot editor seam, with no
 * token vocabulary of its own.
 */
import { render, screen } from '@testing-library/react';
import { createReduxStore, register } from '@wordpress/data';
import { addFilter, removeFilter } from '@wordpress/hooks';
import ResponsiveBorderControl from '../index';

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

const EDITOR_HOOK = 'kadence.components.control.editor';
const ACTIONS_HOOK = 'kadence.components.control.actions';
const NS = 'test/seam';

const numericValue = [
	{
		top: ['#000000', 'solid', 1],
		right: ['#000000', 'solid', 1],
		bottom: ['#000000', 'solid', 1],
		left: ['#000000', 'solid', 1],
		unit: 'px',
	},
];

const baseProps = {
	label: 'Border',
	value: numericValue,
	tabletValue: numericValue,
	mobileValue: numericValue,
	onChange: jest.fn(),
	onChangeTablet: jest.fn(),
	onChangeMobile: jest.fn(),
};

afterEach(() => {
	removeFilter(EDITOR_HOOK, NS);
	removeFilter(ACTIONS_HOOK, NS);
});

describe('ResponsiveBorderControl extension seams', () => {
	it('injects a header action through the actions filter', () => {
		addFilter(ACTIONS_HOOK, NS, (actions) => [
			...actions,
			<button key="a" type="button">
				injected-action
			</button>,
		]);
		render(<ResponsiveBorderControl {...baseProps} />);
		expect(screen.getByText('injected-action')).toBeInTheDocument();
	});

	it('hands the actions seam a value and an onChange that speak the same shape', () => {
		const onChange = jest.fn();
		let seen;
		addFilter(ACTIONS_HOOK, NS, (actions, ctx) => {
			seen = ctx;
			return actions;
		});

		render(<ResponsiveBorderControl {...baseProps} onChange={onChange} />);

		// The seam reads the unwrapped object, not the single-element array the attribute stores.
		expect(seen.value).toEqual(numericValue[0]);

		// And writing that same shape back re-wraps it for the attribute.
		seen.onChange({ ...numericValue[0], unit: 'em' });
		expect(onChange).toHaveBeenCalledWith([{ ...numericValue[0], unit: 'em' }]);
	});

	it('forwards its opaque context down to the nested width-slot editor seam', () => {
		const seen = [];
		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			seen.push(ctx);
			return editor;
		});

		render(<ResponsiveBorderControl {...baseProps} context={{ blockName: 'kadence/singlebtn', attribute: 'border' }} />);

		const borderSite = seen.find((ctx) => ctx.control === 'singleBorder');
		expect(borderSite).toBeTruthy();
		expect(borderSite).toMatchObject({ context: { blockName: 'kadence/singlebtn', attribute: 'border' } });
	});
});
