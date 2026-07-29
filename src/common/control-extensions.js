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
 *   editor unless a listener swaps it (e.g. for a read-only chip).
 * - `controlActions( ctx )` — an array of extra header-action nodes to render beside the control label.
 *   Empty by default.
 *
 * Both seams take the SAME context object, and every control fills in every field. One hook pair with a
 * `control` discriminator (rather than a hook name per control) means a consumer registers one listener
 * and switches on `ctx.control` — the same way `@kadence/helpers` post-filters every emitted value
 * through `kadence.helpers.cssValue` with a `type` discriminator.
 */

/**
 * The neutral site context both seams receive. Every field is always present, so a listener never has to
 * probe for one — the shape does not vary by control or by call site.
 *
 * `value` and `onChange` always speak the SAME shape: whatever a listener reads from `value` is exactly
 * what it may hand back to `onChange`. A control that stores its value differently (wrapped in a
 * single-element array, or spread across several handlers) adapts on its own side rather than leaking
 * that to the listener.
 *
 * @since TBD
 *
 * @typedef {Object} ControlContext
 *
 * @property {string}      control  Which control is asking — the discriminator a listener switches on.
 *                                  One of: `measure`, `measureRange`, `range`, `border`, `singleBorder`.
 * @property {number|null} index    Which side this site edits: `0`-`3` for an individual side (top,
 *                                  right, bottom, left in that order), or `null` when the site addresses
 *                                  the value as a whole (a linked control, or a control with no sides).
 *                                  Never absent — a listener can rely on `null` meaning "the whole value".
 * @property {*}           value    The current value this site's `onChange` writes. Depending on the
 *                                  control that is either the whole value (with `index` telling the
 *                                  listener which side the editor in hand is for) or just that side's
 *                                  value — `index` says which, and `onChange` always matches.
 * @property {Function}    onChange Writes a new value for this site. Accepts exactly the shape of `value`.
 * @property {*}           context  Opaque blob the consuming block passes into the control, untouched by
 *                                  this package. It is how a listener identifies the site (block, attribute,
 *                                  …). `undefined` when the block passes none.
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
 * @param {*}              defaultEditor The control's own editor node for this site.
 * @param {ControlContext} ctx           Neutral site context; every field is always present.
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
 * @param {ControlContext} ctx Neutral control context; every field is always present.
 *
 * @since TBD
 *
 * @return {Array} The action nodes to render (empty when nothing is registered).
 */
export function controlActions(ctx) {
	return applyFilters(CONTROL_ACTIONS_HOOK, [], ctx);
}
