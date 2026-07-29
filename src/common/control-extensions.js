/**
 * Generic, token-agnostic extension seams for Kadence controls.
 *
 * A control exposes two neutral hooks that let an external consumer (e.g. Kadence Blocks, when its
 * design-token module is active) decorate the control WITHOUT this package knowing what the decoration
 * is. The package ships them as no-op pass-throughs, so with nothing registered a control renders
 * exactly as before. No design-token vocabulary lives here — the consumer owns all of that and injects
 * it through `@wordpress/hooks`.
 *
 * - `controlEditor( defaultEditor, ctx )` — wraps/replaces a control's value editor. Returns the default
 *   editor unless a listener swaps it (e.g. for a read-only chip). `ctx` carries only neutral fields:
 *   `{ control, index, value, onChange, context }`, where `context` is an opaque blob the consuming
 *   block passes in so the listener can identify the site.
 * - `controlActions( ctx )` — an array of extra header-action nodes to render beside the control label.
 *   Empty by default.
 *
 * Shape contract: in every `ctx`, `value` and `onChange` speak the same shape. Whatever a listener reads
 * from `ctx.value` is exactly what it may hand back to `ctx.onChange` — a control that stores its value
 * in some other shape internally (e.g. wrapped in a single-element array) adapts on its own side. So a
 * listener can filter `control.editor` and `control.actions` for the same control without reshaping.
 */

/**
 * Internal block libraries
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * The editor hook name every control passes its value editor through.
 *
 * @since TBD
 *
 * @type {string}
 */
export const CONTROL_EDITOR_HOOK = 'kadence.components.control.editor';

/**
 * The actions hook name every control passes its (empty) header-action list through.
 *
 * @since TBD
 *
 * @type {string}
 */
export const CONTROL_ACTIONS_HOOK = 'kadence.components.control.actions';

/**
 * Filter a control's value editor through the extension seam. Returns `defaultEditor` untouched when no
 * listener is registered, so mounting this is always safe.
 *
 * @param {*}      defaultEditor The control's own editor node for this site.
 * @param {Object} ctx           Neutral site context: { control, index, value, onChange, context }.
 *
 * @since TBD
 *
 * @return {*} The editor node to render (the default, or a listener's replacement).
 */
export function controlEditor(defaultEditor, ctx) {
	return applyFilters(CONTROL_EDITOR_HOOK, defaultEditor, ctx);
}

/**
 * The extra header-action nodes a consumer wants rendered beside a control's label. Empty array by
 * default, so a control can always spread the result into its header.
 *
 * @param {Object} ctx Neutral control context: { control, value, onChange, context }.
 *
 * @since TBD
 *
 * @return {Array} The action nodes to render (empty when nothing is registered).
 */
export function controlActions(ctx) {
	return applyFilters(CONTROL_ACTIONS_HOOK, [], ctx);
}
