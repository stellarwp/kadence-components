/**
 * Tests for ResponsiveMeasurementControl's token-agnostic extension seams: it injects header actions
 * through the actions filter and forwards its opaque `context` down to the per-device control's editor
 * seam, with no token vocabulary of its own.
 */
import { render, screen } from '@testing-library/react';
import { createReduxStore, register } from '@wordpress/data';
import { addFilter, removeFilter } from '@wordpress/hooks';
import ResponsiveMeasurementControl from '../index';

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

describe('ResponsiveMeasurementControl extension seams', () => {
	it('injects a header action through the actions filter', () => {
		addFilter(ACTIONS_HOOK, NS, (actions) => [
			...actions,
			<button key="a" type="button">
				injected-action
			</button>,
		]);
		render(<ResponsiveMeasurementControl {...baseProps} />);
		expect(screen.getByText('injected-action')).toBeInTheDocument();
	});

	it('forwards its opaque context down to the nested control editor seam', () => {
		const seen = [];
		addFilter(EDITOR_HOOK, NS, (editor, ctx) => {
			seen.push(ctx);
			return editor;
		});

		render(<ResponsiveMeasurementControl {...baseProps} context={{ blockName: 'kadence/singlebtn', attribute: 'padding' }} />);

		expect(seen.length).toBeGreaterThan(0);
		expect(seen[0]).toMatchObject({
			control: 'measure',
			context: { blockName: 'kadence/singlebtn', attribute: 'padding' },
		});
	});
});
