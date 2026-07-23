/**
 * Tests for the alias-detection toolkit: `isTokenAlias`, `findTokenEntry`, `TokenChip`, and
 * `TokenPickerButton`.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { isTokenAlias, findTokenEntry, TokenChip, TokenPickerButton } from '../token-alias';

const tokens = [
	{ id: 'semantic.radius.button', alias: '{semantic.radius.button}', label: 'Button Radius', value: '0.5rem', type: 'dimension' },
	{ id: 'semantic.radius.card', alias: '{semantic.radius.card}', label: 'Card Radius', value: '1rem', type: 'dimension' },
];

describe('isTokenAlias', () => {
	it('recognizes a whole-string dot-alias', () => {
		expect(isTokenAlias('{semantic.radius.button}')).toBe(true);
	});

	it('recognizes a hyphenated alias segment', () => {
		expect(isTokenAlias('{semantic.border-width.thin}')).toBe(true);
	});

	it('rejects a plain number', () => {
		expect(isTokenAlias(0)).toBe(false);
	});

	it('rejects an empty string', () => {
		expect(isTokenAlias('')).toBe(false);
	});

	it('rejects the "auto" sentinel', () => {
		expect(isTokenAlias('auto')).toBe(false);
	});

	it('rejects an unterminated alias', () => {
		expect(isTokenAlias('{not closed')).toBe(false);
	});

	it('rejects a value that merely contains an alias substring', () => {
		expect(isTokenAlias('10px {semantic.radius.button}')).toBe(false);
	});

	it('rejects non-string values', () => {
		expect(isTokenAlias(undefined)).toBe(false);
		expect(isTokenAlias(null)).toBe(false);
		expect(isTokenAlias(['{semantic.radius.button}'])).toBe(false);
	});
});

describe('findTokenEntry', () => {
	it('finds the entry whose alias matches', () => {
		expect(findTokenEntry(tokens, '{semantic.radius.card}')).toEqual(tokens[1]);
	});

	it('returns null when no entry matches', () => {
		expect(findTokenEntry(tokens, '{unknown.alias}')).toBeNull();
	});

	it('returns null when the tokens list is absent', () => {
		expect(findTokenEntry(undefined, '{semantic.radius.card}')).toBeNull();
	});
});

describe('TokenChip', () => {
	it('renders the matching token entry label', () => {
		render(<TokenChip value="{semantic.radius.button}" tokens={tokens} />);
		expect(screen.getByText('Button Radius')).toBeInTheDocument();
	});

	it('falls back to the dot-path text when no entry matches', () => {
		render(<TokenChip value="{unknown.alias}" tokens={tokens} />);
		expect(screen.getByText('unknown.alias')).toBeInTheDocument();
	});

	it('falls back to the dot-path text when tokens is absent', () => {
		render(<TokenChip value="{semantic.radius.button}" />);
		expect(screen.getByText('semantic.radius.button')).toBeInTheDocument();
	});

	it('hides the unlink button when onUnlink is absent', () => {
		render(<TokenChip value="{semantic.radius.button}" tokens={tokens} />);
		expect(screen.queryByLabelText('Unlink token')).not.toBeInTheDocument();
	});

	it('fires onUnlink with no arguments when the unlink button is pressed', () => {
		const onUnlink = jest.fn();
		render(<TokenChip value="{semantic.radius.button}" tokens={tokens} onUnlink={onUnlink} />);
		fireEvent.click(screen.getByLabelText('Unlink token'));
		expect(onUnlink).toHaveBeenCalledWith();
	});
});

describe('TokenPickerButton', () => {
	it('renders nothing when tokens is absent', () => {
		const { container } = render(<TokenPickerButton onSelect={jest.fn()} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders nothing when tokens is empty', () => {
		const { container } = render(<TokenPickerButton tokens={[]} onSelect={jest.fn()} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders nothing when onSelect is absent', () => {
		const { container } = render(<TokenPickerButton tokens={tokens} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('fires onSelect with the chosen entry alias', () => {
		const onSelect = jest.fn();
		render(<TokenPickerButton tokens={tokens} onSelect={onSelect} />);
		fireEvent.click(screen.getByLabelText('Use design token'));
		fireEvent.click(screen.getByText('Card Radius'));
		expect(onSelect).toHaveBeenCalledWith('{semantic.radius.card}');
	});
});
