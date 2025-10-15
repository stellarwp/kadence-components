/**
 * Generic Responsive Component, add your own controls
 *
 */

/**
 * Internal block libraries
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { map } from 'lodash';
import { capitalizeFirstLetter } from '@kadence/helpers';
import { Dashicon, Button, ButtonGroup } from '@wordpress/components';
/**
 * Import Css
 */
import './editor.scss';
/**
 * Build the Measure controls
 * @returns {object} Measure settings.
 */
export default function ResponsiveControl({ desktopChildren, tabletChildren, mobileChildren }) {
	const [deviceType, setDeviceType] = useState('Desktop');
	const theDevice = useSelect((select) => {
		return select('kadenceblocks/data').getPreviewDeviceType();
	}, []);
	if (theDevice !== deviceType) {
		setDeviceType(theDevice);
	}
	const { setPreviewDeviceType } = useDispatch('kadenceblocks/data');
	const customSetPreviewDeviceType = (device) => {
		setPreviewDeviceType(capitalizeFirstLetter(device));
		setDeviceType(capitalizeFirstLetter(device));
	};
	const devices = [
		{
			name: 'Desktop',
			key: 'desktop',
			label: __('Desktop', '__KADENCE__TEXT__DOMAIN__'),
			title: <Dashicon icon="desktop" />,
			itemClass: 'kb-desk-tab',
		},
		{
			name: 'Tablet',
			key: 'tablet',
			label: __('Tablet', '__KADENCE__TEXT__DOMAIN__'),
			title: <Dashicon icon="tablet" />,
			itemClass: 'kb-tablet-tab',
		},
		{
			name: 'Mobile',
			key: 'mobile',
			label: __('Mobile', '__KADENCE__TEXT__DOMAIN__'),
			title: <Dashicon icon="smartphone" />,
			itemClass: 'kb-mobile-tab',
		},
	];
	const output = {};
	output.Mobile = mobileChildren;
	output.Tablet = tabletChildren;
	output.Desktop = desktopChildren;
	return (
		<div className={'components-base-control kt-inspect-tabs kb-responsive-control'}>
			<div className="kadence-title-bar">
				<ButtonGroup className="components-tab-panel__tabs" aria-label={__('Device', '__KADENCE__TEXT__DOMAIN__')}>
					{map(devices, ({ name, key, title, itemClass, label }) => (
						<Button
							key={key}
							className={`components-tab-panel__tabs-item ${itemClass}${
								name === deviceType ? ' active-tab' : ''
							}`}
							aria-pressed={deviceType === name}
							aria-label={label}
							onClick={() => customSetPreviewDeviceType(name)}
						>
							{title}
						</Button>
					))}
				</ButtonGroup>
			</div>
			<div className="kb-responsive-control-inner">
				{output[deviceType] ? output[deviceType] : output.Desktop}
			</div>
		</div>
	);
}
