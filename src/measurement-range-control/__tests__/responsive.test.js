/**
 * Tests for `ResponsiveMeasureRangeControl`: the header token-picker affordance and prop
 * threading down to the per-device `MeasureRangeControl`, plus the byte-identical baseline
 * required when the new props are absent.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { createReduxStore, register } from '@wordpress/data';
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

const tokens = [{ id: 'radius.button', alias: '{radius.button}', label: 'Button Radius', value: '0.5rem', type: 'dimension' }];

const baseProps = {
	label: 'Padding',
	value: ['0', '0', '0', '0'],
	tabletValue: ['0', '0', '0', '0'],
	mobileValue: ['0', '0', '0', '0'],
	onChange: jest.fn(),
	onChangeTablet: jest.fn(),
	onChangeMobile: jest.fn(),
};

describe('ResponsiveMeasureRangeControl baseline (no alias props)', () => {
	it('renders no token picker button when tokens is absent', () => {
		render(<ResponsiveMeasureRangeControl {...baseProps} />);
		expect(screen.queryByLabelText('Use design token')).not.toBeInTheDocument();
	});

	it('renders no token chip for numeric/preset values', () => {
		render(<ResponsiveMeasureRangeControl {...baseProps} />);
		expect(document.querySelector('.kadence-token-chip')).not.toBeInTheDocument();
	});
});

describe('ResponsiveMeasureRangeControl pick', () => {
	it('renders the header picker and fires onSelectToken with alias + null', () => {
		const onSelectToken = jest.fn();
		render(<ResponsiveMeasureRangeControl {...baseProps} tokens={tokens} onSelectToken={onSelectToken} />);
		fireEvent.click(screen.getByLabelText('Use design token'));
		fireEvent.click(screen.getByText('Button Radius'));
		expect(onSelectToken).toHaveBeenCalledWith('{radius.button}', null);
	});

	it('does not render the picker button without tokens', () => {
		render(<ResponsiveMeasureRangeControl {...baseProps} onSelectToken={jest.fn()} />);
		expect(screen.queryByLabelText('Use design token')).not.toBeInTheDocument();
	});
});

describe('ResponsiveMeasureRangeControl prop threading', () => {
	it('renders a chip for the live device when the value is aliased', () => {
		render(
			<ResponsiveMeasureRangeControl
				{...baseProps}
				value={['{radius.button}', '0', '0', '0']}
				tokens={tokens}
				onSelectToken={jest.fn()}
			/>
		);
		expect(screen.getByText('Button Radius')).toBeInTheDocument();
	});

	it('fires onUnlinkToken with the side index from the nested chip', () => {
		const onUnlinkToken = jest.fn();
		render(
			<ResponsiveMeasureRangeControl
				{...baseProps}
				value={['{radius.button}', '0', '0', '0']}
				tokens={tokens}
				onUnlinkToken={onUnlinkToken}
			/>
		);
		fireEvent.click(screen.getByLabelText('Unlink token'));
		expect(onUnlinkToken).toHaveBeenCalledWith(0);
	});
});
