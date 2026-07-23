/**
 * Design-token alias support for Kadence controls.
 *
 * A control value may hold a whole-string design-token alias, `{dot.alias}`, instead of a number.
 * These helpers are pure and data-free: the package recognizes only the alias PATTERN; labels and
 * preview literals always come from the consumer-passed `tokens` list, so no token data lives here.
 */

/**
 * Import Css
 */
import './token-alias.scss';

/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';
import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { link, linkOff } from '@wordpress/icons';

const TOKEN_ALIAS_PATTERN = /^\{[\w.-]+\}$/;

/**
 * Determine whether a control value is a whole-string design-token alias (e.g. `{semantic.radius.button}`).
 *
 * @param {*} value The control value to test.
 *
 * @since TBD
 *
 * @return {boolean} True when the value is a whole-string token alias.
 */
export function isTokenAlias(value) {
	return typeof value === 'string' && TOKEN_ALIAS_PATTERN.test(value);
}

/**
 * Find the pickable-token entry whose `alias` matches a value.
 *
 * @param {Array}  tokens The consumer-supplied list of pickable tokens (may be undefined).
 * @param {string} value  The alias string to match against each entry's `alias`.
 *
 * @since TBD
 *
 * @return {?Object} The matching token entry, or null when the list is empty/absent or no entry matches.
 */
export function findTokenEntry(tokens, value) {
	return (tokens || []).find((entry) => entry.alias === value) || null;
}

/**
 * The in-control token display: the token's label (dot-path fallback when no matching entry is found)
 * plus an optional unlink button that hands control back to the consumer. Rendered IN PLACE of a
 * numeric editor whenever the slot's value is a token alias.
 *
 * @param {Object}    props
 * @param {string}    props.value    The alias string currently held by the slot.
 * @param {Array}     [props.tokens] The consumer-supplied list of pickable tokens, used to resolve the label/preview.
 * @param {Function}  [props.onUnlink] Called with no arguments when the unlink button is pressed; the unlink button
 *                                     is hidden when this is not provided.
 *
 * @since TBD
 *
 * @return {Object} The rendered token chip.
 */
export function TokenChip({ value, tokens, onUnlink }) {
	const entry = findTokenEntry(tokens, value);
	const label = entry ? entry.label : String(value).slice(1, -1);

	return (
		<span className="kadence-token-chip">
			<span className="kadence-token-chip__label" title={entry ? entry.value : undefined}>
				{label}
			</span>
			{onUnlink && (
				<Button
					className="kadence-token-chip__unlink"
					icon={linkOff}
					isSmall
					label={__('Unlink token', '__KADENCE__TEXT__DOMAIN__')}
					onClick={() => onUnlink()}
				/>
			)}
		</span>
	);
}

/**
 * The in-control picker affordance: a small header button opening the token list; choosing an entry
 * fires `onSelect( entry.alias )`. Renders nothing when the list is empty/absent or no select handler
 * is provided, so mounting it unconditionally is always safe.
 *
 * @param {Object}   props
 * @param {Array}    [props.tokens]   The consumer-supplied list of pickable tokens.
 * @param {Function} [props.onSelect] Called with the chosen entry's `alias` when a token is picked.
 * @param {boolean}  [props.isActive] Whether the toggle should render in its pressed state.
 *
 * @since TBD
 *
 * @return {?Object} The rendered picker button, or null when there is nothing to pick from.
 */
export function TokenPickerButton({ tokens, onSelect, isActive = false }) {
	if (!tokens || !tokens.length || !onSelect) {
		return null;
	}

	return (
		<DropdownMenu
			className="kadence-token-picker-toggle"
			icon={link}
			label={__('Use design token', '__KADENCE__TEXT__DOMAIN__')}
			toggleProps={{ isSmall: true, isPressed: isActive }}
		>
			{({ onClose }) => (
				<MenuGroup>
					{tokens.map((entry) => (
						<MenuItem
							key={entry.id}
							onClick={() => {
								onClose();
								onSelect(entry.alias);
							}}
						>
							{entry.label}
							<span className="kadence-token-picker__preview">{entry.value}</span>
						</MenuItem>
					))}
				</MenuGroup>
			)}
		</DropdownMenu>
	);
}
