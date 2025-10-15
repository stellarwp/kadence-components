/**
 * Range Control
 *
 */
/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Import Css
 */
import './editor.scss';
/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';
import { Button, TabPanel } from '@wordpress/components';
import { isRTL } from '@kadence/helpers';
/**
 * Import Icons
 */
import { hoverToggle, click } from '@kadence/icons';
/**
 * Build the Measure controls
 * @returns {object} Measure settings.
 */
export default function HoverToggleControl({
	label = __('Hover Styles', '__KADENCE__TEXT__DOMAIN__'),
	activeLabel = __('Active Styles', '__KADENCE__TEXT__DOMAIN__'),
	initial = 'normal',
	hoverTab = __( 'Hover', '__KADENCE__TEXT__DOMAIN__' ),
	normalTab = __( 'Normal', '__KADENCE__TEXT__DOMAIN__' ),
	activeTab = __( 'Active', '__KADENCE__TEXT__DOMAIN__' ),
	active,
	hover,
	normal,
	className = '',
	icon = hoverToggle,
	activeIcon = click,
	tabUI = true,
	setActivePreview,
	activePreview,
} ) {
	const [ isHover, setIsHover ] = useState( initial === 'hover' ? true : false );
	const [ isActive, setIsActive ] = useState( initial === 'active' ? true : false );

	var tabs = [
		{
			name: 'normal',
			title: normalTab,
			className: 'kt-normal-tab',
		},
	];
	if ( hover ) {
		tabs.push( {
			name: 'hover',
			title: hoverTab,
			className: 'kt-hover-tab',
		} );
	}
	if ( active ) {
		tabs.push( {
			name: 'active',
			title: activeTab,
			className: 'kt-active-tab',
		} );
	}

	if ( tabUI ) {
		return [
			<div
				className={ `components-base-control kb-hover-toggle-control-tab-ui kb-hover-toggle-control${
					className ? ' ' + className : ''
				}` }
			>
				<TabPanel className="kt-inspect-tabs kt-hover-tabs" activeClass="active-tab" tabs={ tabs }>
					{ ( tab ) => {
						if ( tab.name ) {
							if ( 'hover' === tab.name ) {
								return <>{ hover }</>;
							} else if ( 'active' === tab.name ) {
								return (
									<>
										{ setActivePreview && (
											<Button
												className={ 'kb-hover-toggle-active-preview' }
												isPressed={ activePreview }
												text={
													activePreview
														? __( 'Hide Active State', '__KADENCE__TEXT__DOMAIN__' )
														: __( 'Preview Active State', '__KADENCE__TEXT__DOMAIN__' )
												}
												onClick={ () => {
													setActivePreview( ! activePreview );
												} }
												variant="secondary"
											></Button>
										) }
										{ active }
									</>
								);
							} else {
								return <>{ normal }</>;
							}
						}
					}}
				</TabPanel>
			</div>,
		];
	}
	return [
		<div className={`components-base-control kb-hover-toggle-control${className ? ' ' + className : ''}`}>
			<div className={'kb-hover-toggle-control-toggle'}>
				{hover && (
					<Button
						className={ 'kb-hover-toggle-btn ' + ( isRTL ? 'is-rtl' : '' ) }
						isPrimary={ isHover }
						icon={ icon }
						aria-pressed={ isHover }
						label={ label }
						onClick={ () => {
							setIsActive( false );
							setIsHover( ! isHover );
						} }
					></Button>
				) }
				{ active && (
					<Button
						className={ 'kb-active-toggle-btn ' + ( isRTL ? 'is-rtl' : '' ) }
						isPrimary={ isActive }
						icon={ activeIcon }
						aria-pressed={ isActive }
						label={ activeLabel }
						onClick={ () => {
							setIsHover( false );
							setIsActive( ! isActive );
						} }
					></Button>
				) }
			</div>
			<div className={ 'kb-hover-toggle-area' }>
				{ isHover && <div className="kb-hover-control-wrap">{ hover }</div> }
				{ isActive && <div className="kb-active-control-wrap">{ active }</div> }
				{ ! isHover && ! isActive && <>{ normal }</> }
			</div>
		</div>,
	];
}
