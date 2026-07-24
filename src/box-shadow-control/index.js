/**
 * BoxShadow Component
 *
 */

/**
 * Import Externals
 */
import PopColorControl from '../pop-color-control';
import KadenceRadioButtons from '../common/radio-buttons';
import { controlActions } from '../common/control-extensions';

/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import {
	ToggleControl,
} from '@wordpress/components';
/**
 * Import Css
 */
import './editor.scss';
import { shadowPresetNone } from '@kadence/icons';

/**
 * Build the BoxShadow controls.
 *
 * Exposes two neutral extension seams so a consumer can decorate the control without this package
 * knowing what the decoration is. The header actions seam (`controlActions`) lets a consumer render
 * extra affordances beside the label (e.g. a whole-shadow picker or a read-only chip), and the generic
 * `readOnly` flag renders every sub-input (preset row, color, X/Y/blur/spread, inset) disabled when the
 * value is driven externally, so partial edits can't fight it. `overrideValue` is an opaque blob the
 * control forwards into the actions seam; `context` is the opaque site identifier the consuming block
 * passes in. With nothing registered and `readOnly` false, rendering and behavior are byte-identical.
 *
 * @param {Object}    props
 * @param {*}         [props.overrideValue] Opaque value forwarded to the header actions seam (unused by this package).
 * @param {boolean}   [props.readOnly]      When true, every sub-input renders disabled (value is driven externally).
 * @param {Object}    [props.context]       Opaque site identifier forwarded to the extension seams.
 *
 * @returns {object} BoxShadow settings.
 */
class BoxShadowControl extends Component {
	constructor(
		label,
		enable = true,
		color, colorDefault,
		opacity,
		spread,
		blur,
		hOffset,
		vOffset,
		inset,
		onColorChange,
		onOpacityChange,
		onSpreadChange,
		onBlurChange,
		onHOffsetChange,
		onVOffsetChange,
		onInsetChange,
		onEnableChange,
	) {
		super( ...arguments );
	}
	render() {

		const presetOptions = [
			{ value: 'none', label: __('None', '__KADENCE__TEXT__DOMAIN__'), icon: shadowPresetNone },
			{ value: 'soft-inner-glow', label: __('Soft Inner Glow', '__KADENCE__TEXT__DOMAIN__'), icon: 'soft-inner-glow' },
			{ value: 'soft-outer-glow', label: __('Soft Outer Glow', '__KADENCE__TEXT__DOMAIN__'), icon: 'soft-outer-glow' },
			{ value: 'right-offset-glow', label: __('Right Offset Glow', '__KADENCE__TEXT__DOMAIN__'), icon: 'right-offset-glow' },
			{ value: 'bottom-offset-glow', label: __('Bottom Offset Glow', '__KADENCE__TEXT__DOMAIN__'), icon: 'bottom-offset-glow' },
			{ value: 'inner-solid', label: __('Inner Solid', '__KADENCE__TEXT__DOMAIN__'), icon: 'inner-solid' },
			{ value: 'right-bottom-solid', label: __('Right Bottom Solid', '__KADENCE__TEXT__DOMAIN__'), icon: 'right-bottom-solid' },
			{ value: 'top-left-solid', label: __('Top Left Solid', '__KADENCE__TEXT__DOMAIN__'), icon: 'top-left-solid' },
		];
		const presetSettings = {
			'none': {hOffset: 0, vOffset: 0, blur: 0, spread: 0, inset: false},
			'soft-inner-glow': {hOffset: 0, vOffset: 0, blur: 60, spread: -15, inset: true},
			'soft-outer-glow': {hOffset: 0, vOffset: 0, blur: 60, spread: 5, inset: false},
			'right-offset-glow': {hOffset: 20, vOffset: 20, blur: 30, spread: 0, inset: false},
			'bottom-offset-glow': {hOffset: 0, vOffset: 35, blur: 30, spread: -5, inset: false},
			'inner-solid': {hOffset: 0, vOffset: 0, blur: 0, spread: 15, inset: true},
			'right-bottom-solid': {hOffset: 15, vOffset: 15, blur: 0, spread: 0, inset: false},
			'top-left-solid': {hOffset: -15, vOffset: -15, blur: 0, spread: 0, inset: false},
		};

		const { overrideValue, readOnly, context } = this.props;

		const applyPreset = (value) => {
			// A preset writes five scalars at once, which would silently fight an active token.
			// The `kt-inner-sub-section--token-driven` styling only blocks pointer input, so guard
			// the write itself too — a keyboard-activated or programmatic click must not corrupt
			// state while the token is authoritative.
			if (readOnly) {
				return;
			}
			Promise.resolve()
				.then(() => this.props.onHOffsetChange(presetSettings[value].hOffset))
				.then(() => this.props.onVOffsetChange(presetSettings[value].vOffset))
				.then(() => this.props.onBlurChange(presetSettings[value].blur))
				.then(() => this.props.onSpreadChange(presetSettings[value].spread))
				.then(() => this.props.onInsetChange(presetSettings[value].inset));
		};

		return (
			<div className="components-base-control kt-box-shadow-container">
				{ this.props.label && (
					<div className="kt-box-shadow-label">
						<h2 className="kt-beside-color-label">{ this.props.label }</h2>
						{ controlActions( { control: 'boxShadow', value: overrideValue, readOnly, context } ) }
						{ this.props.onEnableChange && (
							<ToggleControl
								checked={ this.props.enable }
								onChange={ value => this.props.onEnableChange( value ) }
							/>
						) }
					</div>
				) }
				{ this.props.enable && (
					<div className={ 'kt-inner-sub-section' + ( readOnly ? ' kt-inner-sub-section--token-driven' : '' ) }>
						<KadenceRadioButtons
							value={0}
							options={presetOptions}
							wrap={true}
							hideLabel={true}
							className={'kadence-box-shadow-radio-btns'}
							onChange={(value) => {
								applyPreset(value);
							}}
						/>
						<div className="kt-inner-sub-section-row">
							<div className="kt-box-color-settings kt-box-shadow-subset">
								<p className="kt-box-shadow-title">{ __( 'Color' ) }</p>
								<PopColorControl
									value={ ( this.props.color ? this.props.color : this.props.colorDefault ) }
									default={ this.props.colorDefault }
									onChange={ value => ! readOnly && this.props.onColorChange( value ) }
									opacityValue={ this.props.opacity }
									onOpacityChange={ value => ! readOnly && this.props.onOpacityChange( value ) }
									onArrayChange={ this.props.onArrayChange ? ( color, opacity ) => ! readOnly && this.props.onArrayChange( color, opacity ) : undefined }
								/>
							</div>
							<div className="kt-box-x-settings kt-box-shadow-subset">
								<p className="kt-box-shadow-title">{ __( 'X' ) }</p>
								<div className="components-base-control kt-boxshadow-number-input">
									<div className="components-base-control__field">
										<input
											value={ ( undefined !== this.props.hOffset ? this.props.hOffset : '' ) }
											onChange={ event => this.props.onHOffsetChange( Number( event.target.value ) ) }
											min={ -200 }
											max={ 200 }
											step={ 1 }
											type="number"
											disabled={ !!readOnly }
											className="components-text-control__input"
										/>
									</div>
								</div>
							</div>
							<div className="kt-box-y-settings kt-box-shadow-subset">
								<p className="kt-box-shadow-title">{ __( 'Y' ) }</p>
								<div className="components-base-control kt-boxshadow-number-input">
									<div className="components-base-control__field">
										<input
											value={ ( undefined !== this.props.vOffset ? this.props.vOffset : '' ) }
											onChange={ event => this.props.onVOffsetChange( Number( event.target.value ) ) }
											min={ -200 }
											max={ 200 }
											step={ 1 }
											type="number"
											disabled={ !!readOnly }
											className="components-text-control__input"
										/>
									</div>
								</div>
							</div>
							<div className="kt-box-blur-settings kt-box-shadow-subset">
								<p className="kt-box-shadow-title">{ __( 'Blur' ) }</p>
								<div className="components-base-control kt-boxshadow-number-input">
									<div className="components-base-control__field">
										<input
											value={ ( undefined !== this.props.blur ? this.props.blur : '' ) }
											onChange={ event => this.props.onBlurChange( Number( event.target.value ) ) }
											min={ 0 }
											max={ 200 }
											step={ 1 }
											type="number"
											disabled={ !!readOnly }
											className="components-text-control__input"
										/>
									</div>
								</div>
							</div>
							<div className="kt-box-spread-settings kt-box-shadow-subset">
								<p className="kt-box-shadow-title">{ __( 'Spread' ) }</p>
								<div className="components-base-control kt-boxshadow-number-input">
									<div className="components-base-control__field">
										<input
											value={ ( undefined !== this.props.spread ? this.props.spread : '' ) }
											onChange={ event => this.props.onSpreadChange( Number( event.target.value ) ) }
											min={ -200 }
											max={ 200 }
											step={ 1 }
											type="number"
											disabled={ !!readOnly }
											className="components-text-control__input"
										/>
									</div>
								</div>
							</div>
						</div>
						{ this.props.onInsetChange && (
							<div className="kt-box-inset-settings">
								<ToggleControl
									label={ __( 'Inset' ) }
									checked={ this.props.inset }
									disabled={ !!readOnly }
									onChange={ value => this.props.onInsetChange( value ) }
								/>
							</div>
						) }
					</div>
				) }
			</div>
		);
	}
}
export default ( BoxShadowControl );
