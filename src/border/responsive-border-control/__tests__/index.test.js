/**
 * Tests for `ResponsiveBorderControl`: the header token-picker affordance (width-only semantics)
 * and prop threading down to the width slot, plus the byte-identical baseline required when the
 * new props are absent.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { createReduxStore, register } from '@wordpress/data';
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

const tokens = [{ id: 'width.thin', alias: '{width.thin}', label: 'Thin Width', value: '1px', type: 'dimension' }];

const numericValue = [
	{
		top: ['#000000', 'solid', 1],
		right: ['#000000', 'solid', 1],
		bottom: ['#000000', 'solid', 1],
		left: ['#000000', 'solid', 1],
		unit: 'px',
	},
];

const aliasedValue = [
	{
		top: ['#000000', 'solid', '{width.thin}'],
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

describe('ResponsiveBorderControl baseline (no alias props)', () => {
	it('renders no token picker button when tokens is absent', () => {
		render(<ResponsiveBorderControl {...baseProps} />);
		expect(screen.queryByLabelText('Use design token')).not.toBeInTheDocument();
	});

	it('renders no token chip for numeric widths', () => {
		render(<ResponsiveBorderControl {...baseProps} />);
		expect(document.querySelector('.kadence-token-chip')).not.toBeInTheDocument();
	});
});

describe('ResponsiveBorderControl pick (width-only semantics)', () => {
	it('renders the header picker and fires onSelectToken with alias + null', () => {
		const onSelectToken = jest.fn();
		render(<ResponsiveBorderControl {...baseProps} tokens={tokens} onSelectToken={onSelectToken} />);
		fireEvent.click(screen.getByLabelText('Use design token'));
		fireEvent.click(screen.getByText('Thin Width'));
		expect(onSelectToken).toHaveBeenCalledWith('{width.thin}', null);
	});
});

describe('ResponsiveBorderControl width chip swap', () => {
	it('renders a chip for the aliased width and leaves other sides untouched', () => {
		render(<ResponsiveBorderControl {...baseProps} value={aliasedValue} tokens={tokens} />);
		expect(screen.getByText('Thin Width')).toBeInTheDocument();
	});

	it('fires onUnlinkToken with the side index from the width chip', () => {
		const onUnlinkToken = jest.fn();
		render(<ResponsiveBorderControl {...baseProps} value={aliasedValue} tokens={tokens} onUnlinkToken={onUnlinkToken} />);
		fireEvent.click(screen.getByLabelText('Unlink token'));
		expect(onUnlinkToken).toHaveBeenCalledWith(0);
	});
});
