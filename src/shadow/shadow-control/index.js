/**
 * BoxShadow Component
 *
 */

/**
 * Import Externals
 */
import PopColorControl from '../../pop-color-control';
/**
 * Import Css
 */
import './editor.scss';
/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { ToggleControl } from '@wordpress/components';
/**
 * Build the Shadow controls
 * @returns {object} Shadow settings.
 */
const ShadowControl = ( {
	label,
	enable = true,
	color,
	colorDefault,
	opacity,
	blur,
	spread,
	hOffset,
	vOffset,
	inset,
	onColorChange,
	onOpacityChange,
	onBlurChange,
	onHOffsetChange,
	onVOffsetChange,
	onEnableChange,
	onSpreadChange,
	onInsetChange,
	shadowType,
	onArrayChange
} ) => (
	<div className="kb-shadow-container components-base-control">
		{ label && (
			<div className="kt-box-shadow-label">
				<h2 className="kt-beside-color-label">{ label }</h2>
			</div>
		) }
			<div className="kt-inner-sub-section">
				<div className="kt-inner-sub-section-row">
					<div className="kt-box-color-settings kt-box-shadow-subset">
						<p className="kt-box-shadow-title">{ __( 'Color', 'kadence-blocks' ) }</p>
						<PopColorControl
							value={ ( color ? color : colorDefault ) }
							default={ colorDefault }
							onChange={ value => onColorChange( value ) }
							opacityValue={ opacity }
							onOpacityChange={ value => onOpacityChange( value ) }
							onArrayChange={ onArrayChange ? ( color, opacity ) => onArrayChange( color, opacity ) : undefined }
						/>
					</div>
					<div className="kt-box-x-settings kt-box-shadow-subset">
						<p className="kt-box-shadow-title">{ 'X' }</p>
						<div className="components-base-control kt-boxshadow-number-input">
							<div className="components-base-control__field">
								<input
									value={ ( undefined !== hOffset ? hOffset : '' ) }
									onChange={ event => onHOffsetChange( Number( event.target.value ) ) }
									min={ -200 }
									max={ 200 }
									step={ 1 }
									type="number"
									className="components-text-control__input"
								/>
							</div>
						</div>
					</div>
					<div className="kt-box-y-settings kt-box-shadow-subset">
						<p className="kt-box-shadow-title">{ 'Y' }</p>
						<div className="components-base-control kt-boxshadow-number-input">
							<div className="components-base-control__field">
								<input
									value={ ( undefined !== vOffset ? vOffset : '' ) }
									onChange={ event => onVOffsetChange( Number( event.target.value ) ) }
									min={ -200 }
									max={ 200 }
									step={ 1 }
									type="number"
									className="components-text-control__input"
								/>
							</div>
						</div>
					</div>
					<div className="kt-box-blur-settings kt-box-shadow-subset">
						<p className="kt-box-shadow-title">{ 'Blur' }</p>
						<div className="components-base-control kt-boxshadow-number-input">
							<div className="components-base-control__field">
								<input
									value={ ( undefined !== blur ? blur : '' ) }
									onChange={ event => onBlurChange( Number( event.target.value ) ) }
									min={ 0 }
									max={ 200 }
									step={ 1 }
									type="number"
									className="components-text-control__input"
								/>
							</div>
						</div>
					</div>
					{ shadowType === 'box' && (
						<div className="kt-box-spread-settings kt-box-shadow-subset">
							<p className="kt-box-shadow-title">{__('Spread')}</p>
							<div className="components-base-control kt-boxshadow-number-input">
								<div className="components-base-control__field">
									<input
										value={(undefined !== spread ? spread : '')}
										onChange={event => onSpreadChange(Number(event.target.value))}
										min={-200}
										max={200}
										step={1}
										type="number"
										className="components-text-control__input"
									/>
								</div>
							</div>
						</div>
					)}
				</div>
				{ shadowType === 'box' && onInsetChange && (
					<div className="kt-box-inset-settings">
						<ToggleControl
							label={ __( 'Inset' ) }
							checked={ inset }
							onChange={ value => onInsetChange( value ) }
						/>
					</div>
				) }
			</div>
	</div>
);
export default ShadowControl;
