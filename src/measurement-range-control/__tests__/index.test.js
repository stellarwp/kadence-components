/**
 * Tests for `MeasureRangeControl`: the header token-picker affordance and per-side chip swap
 * (both preset and custom size modes), plus the byte-identical baseline required when the new
 * props are absent.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import MeasureRangeControl from '../index';

const tokens = [{ id: 'radius.button', alias: '{radius.button}', label: 'Button Radius', value: '0.5rem', type: 'dimension' }];

describe('MeasureRangeControl baseline (no alias props)', () => {
	it('renders no token picker button when tokens is absent', () => {
		render(<MeasureRangeControl label="Padding" value={['0', '0', '0', '0']} onChange={jest.fn()} />);
		expect(screen.queryByLabelText('Use design token')).not.toBeInTheDocument();
	});

	it('renders no token chip for numeric/preset values', () => {
		render(<MeasureRangeControl label="Padding" value={['0', '0', '0', '0']} onChange={jest.fn()} />);
		expect(document.querySelector('.kadence-token-chip')).not.toBeInTheDocument();
	});
});

describe('MeasureRangeControl display', () => {
	it('renders a token chip for an aliased side instead of the preset/size control', () => {
		render(<MeasureRangeControl label="Padding" value={['{radius.button}', '0', '0', '0']} onChange={jest.fn()} tokens={tokens} />);
		expect(screen.getByText('Button Radius')).toBeInTheDocument();
	});

	it('falls back to the dot-path label when the entry is missing', () => {
		render(<MeasureRangeControl label="Padding" value={['{unknown.alias}', '0', '0', '0']} onChange={jest.fn()} />);
		expect(screen.getByText('unknown.alias')).toBeInTheDocument();
	});

	it('renders a chip in linked mode when the value is aliased', () => {
		render(
			<MeasureRangeControl
				label="Padding"
				value={['{radius.button}', '{radius.button}', '{radius.button}', '{radius.button}']}
				control="linked"
				onChange={jest.fn()}
				tokens={tokens}
			/>
		);
		expect(screen.getByText('Button Radius')).toBeInTheDocument();
	});
});

describe('MeasureRangeControl pick/unlink', () => {
	it('renders the header picker and fires onSelectToken with alias + null', () => {
		const onSelectToken = jest.fn();
		render(
			<MeasureRangeControl
				label="Padding"
				value={['0', '0', '0', '0']}
				onChange={jest.fn()}
				tokens={tokens}
				onSelectToken={onSelectToken}
			/>
		);
		fireEvent.click(screen.getByLabelText('Use design token'));
		fireEvent.click(screen.getByText('Button Radius'));
		expect(onSelectToken).toHaveBeenCalledWith('{radius.button}', null);
	});

	it('fires onUnlinkToken with the side index when a side chip is unlinked', () => {
		const onUnlinkToken = jest.fn();
		render(
			<MeasureRangeControl
				label="Padding"
				value={['{radius.button}', '0', '0', '0']}
				onChange={jest.fn()}
				tokens={tokens}
				onUnlinkToken={onUnlinkToken}
			/>
		);
		fireEvent.click(screen.getByLabelText('Unlink token'));
		expect(onUnlinkToken).toHaveBeenCalledWith(0);
	});

	it('hides the unlink button when onUnlinkToken is absent', () => {
		render(<MeasureRangeControl label="Padding" value={['{radius.button}', '0', '0', '0']} onChange={jest.fn()} tokens={tokens} />);
		expect(screen.queryByLabelText('Unlink token')).not.toBeInTheDocument();
	});
});
