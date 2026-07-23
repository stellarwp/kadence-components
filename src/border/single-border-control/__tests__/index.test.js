/**
 * Tests for `SingleBorderControl`: the width-slot chip swap (color/style stay untouched), plus
 * the byte-identical baseline required when the new props are absent.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import SingleBorderControl from '../index';

const tokens = [{ id: 'width.thin', alias: '{width.thin}', label: 'Thin Width', value: '1px', type: 'dimension' }];

describe('SingleBorderControl baseline (no alias props)', () => {
	it('renders the width unit control and no token chip for a numeric width', () => {
		render(<SingleBorderControl value={['#000000', 'solid', 2]} onChange={jest.fn()} onUnit={jest.fn()} />);
		expect(document.querySelector('.kadence-token-chip')).not.toBeInTheDocument();
		expect(document.querySelector('.components-unit-control')).toBeInTheDocument();
	});
});

describe('SingleBorderControl display', () => {
	it('renders a token chip in place of the width control when the width is aliased', () => {
		render(
			<SingleBorderControl value={['#000000', 'solid', '{width.thin}']} onChange={jest.fn()} onUnit={jest.fn()} tokens={tokens} />
		);
		expect(screen.getByText('Thin Width')).toBeInTheDocument();
	});

	it('leaves the color and style editors untouched when the width is aliased', () => {
		render(
			<SingleBorderControl value={['#000000', 'solid', '{width.thin}']} onChange={jest.fn()} onUnit={jest.fn()} tokens={tokens} />
		);
		expect(screen.getByLabelText('Border Style')).toBeInTheDocument();
	});

	it('falls back to the dot-path label when the entry is missing', () => {
		render(<SingleBorderControl value={['#000000', 'solid', '{unknown.width}']} onChange={jest.fn()} onUnit={jest.fn()} />);
		expect(screen.getByText('unknown.width')).toBeInTheDocument();
	});
});

describe('SingleBorderControl unlink', () => {
	it('fires onUnlink when the chip unlink button is pressed', () => {
		const onUnlink = jest.fn();
		render(
			<SingleBorderControl
				value={['#000000', 'solid', '{width.thin}']}
				onChange={jest.fn()}
				onUnit={jest.fn()}
				tokens={tokens}
				onUnlink={onUnlink}
			/>
		);
		fireEvent.click(screen.getByLabelText('Unlink token'));
		expect(onUnlink).toHaveBeenCalledWith();
	});

	it('hides the unlink button when onUnlink is absent', () => {
		render(
			<SingleBorderControl value={['#000000', 'solid', '{width.thin}']} onChange={jest.fn()} onUnit={jest.fn()} tokens={tokens} />
		);
		expect(screen.queryByLabelText('Unlink token')).not.toBeInTheDocument();
	});
});
