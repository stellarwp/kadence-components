/**
 * Tests for `ResponsiveMeasureRangeControl`'s token-agnostic extension seams: it renders the per-device
 * control with no injected UI by default, injects header actions through the actions filter, and forwards
 * its opaque `context` down to the nested control's editor seam.
 */
import { render, screen } from '@testing-library/react';
import { createReduxStore, register } from '@wordpress/data';
import { addFilter, removeFilter } from '@wordpress/hooks';
import ResponsiveMeasureRangeControl from '../responsive';

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

const baseProps = {
	label: 'Padding',
	value: ['0', '0', '0', '0'],
	tabletValue: ['0', '0', '0', '0'],
	mobileValue: ['0', '0', '0', '0'],
	onChange: jest.fn(),
	onChangeTablet: jest.fn(),
	onChangeMobile: jest.fn(),
};

afterEach(() => {
	removeFilter(EDITOR_HOOK, NS);
	removeFilter(ACTIONS_HOOK, NS);
});

describe('ResponsiveMeasureRangeControl extension seams', () => {
	it('renders the per-device control and no injected actions by default', () => {
		render(<ResponsiveMeasureRangeControl {...baseProps} />);
		expect(document.querySelector('.measure-desktop-size')).toBeInTheDocument();
		expect(screen.queryByText('injected-action')).not.toBeInTheDocument();
	});

	it('injects a header action through the actions filter', () => {
		addFilter(ACTIONS_HOOK, NS, (actions) => [
			...actions,
			<button key="a" type="button">
				injected-action
			</button>,
		]);
		render(<ResponsiveMeasureRangeControl {...baseProps} />);
		expect(screen.getByText('injected-action')).toBeInTheDocument();
	});

	it('forwards its opaque context down to the nested control editor seam', () => {
		const seen = [];
		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			seen.push(ctx);
			return editor;
		});

		render(<ResponsiveMeasureRangeControl {...baseProps} context={{ blockName: 'kadence/singlebtn', attribute: 'borderRadius' }} />);

		expect(seen.length).toBeGreaterThan(0);
		expect(seen[0]).toMatchObject({
			control: 'measureRange',
			context: { blockName: 'kadence/singlebtn', attribute: 'borderRadius' },
		});
	});
});
