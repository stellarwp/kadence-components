/**
 * Tests for `MeasurementControls`: the per-side chip swap and linked-mode chip that make the
 * control alias-aware, plus the byte-identical baseline required when the new props are absent.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import MeasurementControls from '../index';

const tokens = [{ id: 'radius.button', alias: '{radius.button}', label: 'Button Radius', value: '0.5rem', type: 'dimension' }];

describe('MeasurementControls baseline (no alias props)', () => {
	it('renders four numeric inputs and no token chip for numeric values', () => {
		const onChange = jest.fn();
		render(<MeasurementControls label="Padding" measurement={[1, 2, 3, 4]} onChange={onChange} />);
		expect(screen.getAllByRole('spinbutton')).toHaveLength(4);
		expect(document.querySelector('.kadence-token-chip')).not.toBeInTheDocument();
	});

	it('preserves today\'s 4-tuple onChange behavior when editing a side', () => {
		const onChange = jest.fn();
		render(<MeasurementControls label="Padding" measurement={[1, 2, 3, 4]} onChange={onChange} />);
		const inputs = screen.getAllByRole('spinbutton');
		fireEvent.change(inputs[0], { target: { value: '9' } });
		expect(onChange).toHaveBeenCalledWith([9, 2, 3, 4]);
	});

	it('renders the linked-mode range control when control is "linked"', () => {
		const onChange = jest.fn();
		render(<MeasurementControls label="Padding" measurement={[1, 1, 1, 1]} control="linked" onChange={onChange} />);
		expect(document.querySelector('.kadence-range-control-range')).toBeInTheDocument();
		expect(document.querySelector('.kadence-token-chip')).not.toBeInTheDocument();
	});
});

describe('MeasurementControls display (alias-aware)', () => {
	it('renders a token chip in place of the numeric input for an aliased side', () => {
		render(<MeasurementControls label="Padding" measurement={['{radius.button}', 2, 3, 4]} onChange={jest.fn()} tokens={tokens} />);
		expect(screen.getByText('Button Radius')).toBeInTheDocument();
		expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
	});

	it('falls back to the dot-path label when the entry is missing', () => {
		render(<MeasurementControls label="Padding" measurement={['{unknown.alias}', 2, 3, 4]} onChange={jest.fn()} />);
		expect(screen.getByText('unknown.alias')).toBeInTheDocument();
	});

	it('renders a full-width chip in linked mode when the value is an alias', () => {
		render(
			<MeasurementControls
				label="Padding"
				measurement={['{radius.button}', '{radius.button}', '{radius.button}', '{radius.button}']}
				control="linked"
				onChange={jest.fn()}
				tokens={tokens}
			/>
		);
		expect(screen.getByText('Button Radius')).toBeInTheDocument();
		expect(document.querySelector('.kadence-range-control-range')).not.toBeInTheDocument();
	});
});

describe('MeasurementControls pick/unlink', () => {
	it('fires onUnlinkToken with the side index when a side chip is unlinked', () => {
		const onUnlinkToken = jest.fn();
		render(
			<MeasurementControls
				label="Padding"
				measurement={['{radius.button}', 2, 3, 4]}
				onChange={jest.fn()}
				tokens={tokens}
				onUnlinkToken={onUnlinkToken}
			/>
		);
		fireEvent.click(screen.getByLabelText('Unlink token'));
		expect(onUnlinkToken).toHaveBeenCalledWith(0);
	});

	it('fires onUnlinkToken with null when the linked-mode chip is unlinked', () => {
		const onUnlinkToken = jest.fn();
		render(
			<MeasurementControls
				label="Padding"
				measurement={['{radius.button}', '{radius.button}', '{radius.button}', '{radius.button}']}
				control="linked"
				onChange={jest.fn()}
				tokens={tokens}
				onUnlinkToken={onUnlinkToken}
			/>
		);
		fireEvent.click(screen.getByLabelText('Unlink token'));
		expect(onUnlinkToken).toHaveBeenCalledWith(null);
	});

	it('hides the unlink button when onUnlinkToken is absent', () => {
		render(<MeasurementControls label="Padding" measurement={['{radius.button}', 2, 3, 4]} onChange={jest.fn()} tokens={tokens} />);
		expect(screen.queryByLabelText('Unlink token')).not.toBeInTheDocument();
	});
});

describe('MeasurementControls edge cases', () => {
	it('does not treat 0, empty string, or "auto" as an alias', () => {
		render(<MeasurementControls label="Padding" measurement={[0, '', 'auto', 4]} onChange={jest.fn()} />);
		expect(document.querySelector('.kadence-token-chip')).not.toBeInTheDocument();
	});

	it('preserves an alias on a sibling side when a numeric side is edited', () => {
		const onChange = jest.fn();
		render(<MeasurementControls label="Padding" measurement={[1, '{radius.button}', 3, 4]} onChange={onChange} tokens={tokens} />);
		const inputs = screen.getAllByRole('spinbutton');
		fireEvent.change(inputs[0], { target: { value: '9' } });
		expect(onChange).toHaveBeenCalledWith([9, '{radius.button}', 3, 4]);
	});
});
