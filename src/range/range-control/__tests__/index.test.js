/**
 * Tests for `RangeControl`: the picker beside the label and the chip that replaces the slider
 * row for a scalar aliased value, plus the byte-identical baseline required when the new props
 * are absent.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import RangeControl from '../index';

const tokens = [{ id: 'spacing.md', alias: '{spacing.md}', label: 'Medium Spacing', value: '1rem', type: 'dimension' }];

describe('RangeControl baseline (no alias props)', () => {
	it('renders the core slider and no token picker/chip when tokens is absent', () => {
		render(<RangeControl label="Gap" value={4} onChange={jest.fn()} />);
		expect(screen.queryByLabelText('Use design token')).not.toBeInTheDocument();
		expect(document.querySelector('.kadence-range-control-range')).toBeInTheDocument();
		expect(document.querySelector('.kadence-token-chip')).not.toBeInTheDocument();
	});

	it('preserves today\'s onChange behavior', () => {
		const onChange = jest.fn();
		render(<RangeControl label="Gap" value={4} onChange={onChange} />);
		fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } });
		expect(onChange).toHaveBeenCalledWith(10);
	});
});

describe('RangeControl display', () => {
	it('renders a token chip instead of the slider row when the value is an alias', () => {
		render(<RangeControl label="Gap" value="{spacing.md}" onChange={jest.fn()} tokens={tokens} />);
		expect(screen.getByText('Medium Spacing')).toBeInTheDocument();
		expect(document.querySelector('.kadence-range-control-range')).not.toBeInTheDocument();
	});

	it('falls back to the dot-path label when the entry is missing', () => {
		render(<RangeControl label="Gap" value="{unknown.spacing}" onChange={jest.fn()} />);
		expect(screen.getByText('unknown.spacing')).toBeInTheDocument();
	});
});

describe('RangeControl pick/unlink', () => {
	it('fires onSelectToken with just the alias (scalar controls omit side)', () => {
		const onSelectToken = jest.fn();
		render(<RangeControl label="Gap" value={4} onChange={jest.fn()} tokens={tokens} onSelectToken={onSelectToken} />);
		fireEvent.click(screen.getByLabelText('Use design token'));
		fireEvent.click(screen.getByText('Medium Spacing'));
		expect(onSelectToken).toHaveBeenCalledWith('{spacing.md}');
	});

	it('fires onUnlinkToken with no arguments when the chip is unlinked', () => {
		const onUnlinkToken = jest.fn();
		render(<RangeControl label="Gap" value="{spacing.md}" onChange={jest.fn()} tokens={tokens} onUnlinkToken={onUnlinkToken} />);
		fireEvent.click(screen.getByLabelText('Unlink token'));
		expect(onUnlinkToken).toHaveBeenCalledWith();
	});

	it('does not render the picker button without tokens', () => {
		render(<RangeControl label="Gap" value={4} onChange={jest.fn()} onSelectToken={jest.fn()} />);
		expect(screen.queryByLabelText('Use design token')).not.toBeInTheDocument();
	});
});
