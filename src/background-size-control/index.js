/**
 * Basic Background Control.
 */

/**
 * Import External
 */
import { get, map } from 'lodash';
import classnames from 'classnames';
/**
 * WordPress dependencies
 */
import { useInstanceId } from '@wordpress/compose';
import { useState, useEffect } from '@wordpress/element';
/**
 * Import Css
 */
import './editor.scss';
/**
 * Import Kadence Icons
 */
import { settings } from '@wordpress/icons';
/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, ButtonGroup, Icon, __experimentalUnitControl as UnitControl } from '@wordpress/components';
function isCustomOption(optionsArray, value) {
	if (!value) {
		return false;
	}
	if (!optionsArray) {
		return false;
	}
	return !optionsArray.find((option) => option.value === value);
}

/**
 * Tabs for Background Control.
 */
export default function BackgroundSizeControl({
	label,
	value,
	onChange,
	options = [
		{ value: 'cover', label: __('Cover', '__KADENCE__TEXT__DOMAIN__') },
		{ value: 'contain', label: __('Contain', '__KADENCE__TEXT__DOMAIN__') },
		{ value: 'auto', label: __('Auto', '__KADENCE__TEXT__DOMAIN__') },
	],
	allowCustom = true,
}) {
	const instanceId = useInstanceId(BackgroundSizeControl);
	const id = `inspector-background-size-control-${instanceId}`;
	const [isCustom, setIsCustom] = useState(false);
	useEffect(() => {
		setIsCustom(isCustomOption(options, value));
	}, []);
	let width = 'auto';
	let height = 'auto';
	const sizeArray = value.split(' ');
	if (undefined !== sizeArray[0]) {
		width = undefined !== sizeArray[0] && sizeArray[0] ? sizeArray[0] : 'auto';
		height = undefined !== sizeArray[1] && sizeArray[1] ? sizeArray[1] : 'auto';
	}
	const onWidthChange = (newWidth) => {
		const sizeArray = value.split(' ');
		let newHeight = 'auto';
		if (undefined !== sizeArray[0]) {
			newHeight = undefined !== sizeArray[1] && sizeArray[1] ? sizeArray[1] : 'auto';
		}
		onChange(newWidth + ' ' + newHeight);
	};
	const onHeightChange = (newHeight) => {
		const sizeArray = value.split(' ');
		let newWidth = 'auto';
		if (undefined !== sizeArray[0]) {
			newWidth = undefined !== sizeArray[0] && sizeArray[0] ? sizeArray[0] : 'auto';
		}
		onChange(newWidth + ' ' + newHeight);
	};
	return (
		<div className="components-base-control kadence-background-size-control">
			{label && (
				<label htmlFor={id} className="kadence-radio-control-label components-background-size-control__label">
					{label}
				</label>
			)}
			{!isCustom && (
				<div className={'kadence-controls-content'}>
					<ButtonGroup className="kadence-radio-container-control">
						{options.map((option, index) => (
							<Button
								key={`${option.label}-${option.value}-${index}`}
								isTertiary={value !== option.value}
								className={'kadence-radio-item radio-' + option.value}
								isPrimary={value === option.value}
								icon={undefined !== option.icon ? option.icon : undefined}
								aria-pressed={value === option.value}
								onClick={() => {
									onChange(option.value);
								}}
							>
								{option.label}
							</Button>
						))}
						{allowCustom && (
							<Button
								className={'kadence-radio-item radio-custom only-icon'}
								label={__('Set custom size', '__KADENCE__TEXT__DOMAIN__')}
								icon={settings}
								onClick={() => setIsCustom(true)}
								isPressed={false}
								isTertiary={true}
							/>
						)}
					</ButtonGroup>
				</div>
			)}
			{isCustom && (
				<div className={'kadence-controls-content'}>
					<UnitControl
						labelPosition="top"
						label={__('Width', '__KADENCE__TEXT__DOMAIN__')}
						max={4000}
						min={0}
						units={[
							{ value: '%', label: '%' },
							{ value: 'px', label: 'px' },
						]}
						value={width}
						onChange={onWidthChange}
						placeholder={'auto'}
					/>
					<UnitControl
						labelPosition="top"
						label={__('Height', '__KADENCE__TEXT__DOMAIN__')}
						max={4000}
						min={0}
						value={height}
						units={[
							{ value: '%', label: '%' },
							{ value: 'px', label: 'px' },
						]}
						onChange={onHeightChange}
						placeholder={'auto'}
					/>
					{allowCustom && (
						<ButtonGroup className="kadence-radio-container-control kadence-small-radio-container">
							<Button
								className={'kadence-radio-item radio-custom only-icon'}
								label={__('Use size preset', '__KADENCE__TEXT__DOMAIN__')}
								icon={settings}
								isPrimary={true}
								onClick={() => setIsCustom(false)}
								isPressed={true}
							/>
						</ButtonGroup>
					)}
				</div>
			)}
		</div>
	);
}
