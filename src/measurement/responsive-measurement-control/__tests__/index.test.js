/**
 * Tests for `ResponsiveMeasurementControls`: the header token-picker affordance and prop
 * threading down to the per-device `MeasurementControls`, plus the byte-identical baseline
 * required when the new props are absent.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { createReduxStore, register } from '@wordpress/data';
import ResponsiveMeasurementControls from '../index';

// The control reads the live device from the `kadenceblocks/data` store (registered by the
// consuming app, e.g. kadence-blocks). Register a minimal stand-in so `useSelect` resolves without
// throwing; the control only ever reads `getPreviewDeviceType()` and dispatches
// `setPreviewDeviceType()` in these tests.
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

const tokens = [{ id: 'radius.button', alias: '{radius.button}', label: 'Button Radius', value: '0.5rem', type: 'dimension' }];

const baseProps = {
	label: 'Border Radius',
	value: [1, 2, 3, 4],
	tabletValue: [1, 2, 3, 4],
	mobileValue: [1, 2, 3, 4],
	onChange: jest.fn(),
	onChangeTablet: jest.fn(),
	onChangeMobile: jest.fn(),
};

describe('ResponsiveMeasurementControls baseline (no alias props)', () => {
	it('renders no token picker button when tokens is absent', () => {
		render(<ResponsiveMeasurementControls {...baseProps} />);
		expect(screen.queryByLabelText('Use design token')).not.toBeInTheDocument();
	});

	it('renders four numeric inputs for the desktop device with no token chip', () => {
		render(<ResponsiveMeasurementControls {...baseProps} />);
		expect(screen.getAllByRole('spinbutton')).toHaveLength(4);
		expect(document.querySelector('.kadence-token-chip')).not.toBeInTheDocument();
	});
});

describe('ResponsiveMeasurementControls pick', () => {
	it('renders the header picker button when tokens and onSelectToken are provided', () => {
		render(<ResponsiveMeasurementControls {...baseProps} tokens={tokens} onSelectToken={jest.fn()} />);
		expect(screen.getByLabelText('Use design token')).toBeInTheDocument();
	});

	it('fires onSelectToken with the alias and null (whole-control semantics) when an entry is chosen', () => {
		const onSelectToken = jest.fn();
		render(<ResponsiveMeasurementControls {...baseProps} tokens={tokens} onSelectToken={onSelectToken} />);
		fireEvent.click(screen.getByLabelText('Use design token'));
		fireEvent.click(screen.getByText('Button Radius'));
		expect(onSelectToken).toHaveBeenCalledWith('{radius.button}', null);
	});

	it('does not render the picker button without onSelectToken even if tokens are provided', () => {
		render(<ResponsiveMeasurementControls {...baseProps} tokens={tokens} />);
		expect(screen.queryByLabelText('Use design token')).not.toBeInTheDocument();
	});
});

describe('ResponsiveMeasurementControls prop threading', () => {
	it('renders a chip for the live device when the value is aliased', () => {
		render(
			<ResponsiveMeasurementControls
				{...baseProps}
				value={['{radius.button}', 2, 3, 4]}
				tokens={tokens}
				onSelectToken={jest.fn()}
			/>
		);
		expect(screen.getByText('Button Radius')).toBeInTheDocument();
	});

	it('fires onUnlinkToken with the side index from the nested chip', () => {
		const onUnlinkToken = jest.fn();
		render(
			<ResponsiveMeasurementControls
				{...baseProps}
				value={['{radius.button}', 2, 3, 4]}
				tokens={tokens}
				onUnlinkToken={onUnlinkToken}
			/>
		);
		fireEvent.click(screen.getByLabelText('Unlink token'));
		expect(onUnlinkToken).toHaveBeenCalledWith(0);
	});
});
