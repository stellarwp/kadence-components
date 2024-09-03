import {
	PopColorControl,
	BackgroundTypeControl,
	GradientControl,
	ResponsiveBorderControl,
	ResponsiveMeasurementControls,
	BoxShadowControl,
} from '../';

import { __ } from '@wordpress/i18n';

/**
 * Basic Background Control.
 */
export default function ButtonStyleControls({
	colorKey,
	backgroundTypeKey,
	gradientKey,
	backgroundKey,
	borderStyleKey,
	tabletBorderStyleKey,
	mobileBorderStyleKey,
	borderRadiusKey,
	tabletBorderRadiusKey,
	mobileBorderRadiusKey,
	borderRadiusUnitKey,
	displayShadowKey,
	shadowKey,
	attributes,
	setAttributes,
}) {
	const {
		[colorKey]: color,
		[backgroundTypeKey]: backgroundType,
		[gradientKey]: gradient,
		[backgroundKey]: background,
		[borderStyleKey]: borderStyle,
		[tabletBorderStyleKey]: tabletBorderStyle,
		[mobileBorderStyleKey]: mobileBorderStyle,
		[borderRadiusKey]: borderRadius,
		[tabletBorderRadiusKey]: tabletBorderRadius,
		[mobileBorderRadiusKey]: mobileBorderRadius,
		[borderRadiusUnitKey]: borderRadiusUnit,
		[displayShadowKey]: displayShadow,
		[shadowKey]: shadow,
	} = attributes;

	const saveShadow = (value) => {
		const newUpdate = shadow.map((item, index) => {
			if (0 === index) {
				item = { ...item, ...value };
			}
			return item;
		});
		setAttributes({
			[shadowKey]: newUpdate,
		});
	};

	return (
		<>
			<PopColorControl
				label={__('Color', 'kadence-blocks')}
				value={color ? color : ''}
				default={''}
				onChange={(value) => setAttributes({ [colorKey]: value })}
			/>
			<BackgroundTypeControl
				label={__('Type', 'kadence-blocks')}
				type={backgroundType ? backgroundType : 'normal'}
				onChange={(value) => setAttributes({ [backgroundTypeKey]: value })}
				allowedTypes={['normal', 'gradient']}
			/>
			{'gradient' === backgroundType && (
				<GradientControl
					value={gradient}
					onChange={(value) => setAttributes({ [gradientKey]: value })}
					gradients={[]}
				/>
			)}
			{'normal' === backgroundType && (
				<PopColorControl
					label={__('Background Color', 'kadence-blocks')}
					value={background ? background : ''}
					default={''}
					onChange={(value) => setAttributes({ [backgroundKey]: value })}
				/>
			)}
			<ResponsiveBorderControl
				label={__('Border', 'kadence-blocks')}
				value={borderStyle}
				tabletValue={tabletBorderStyle}
				mobileValue={mobileBorderStyle}
				onChange={(value) => setAttributes({ [borderStyleKey]: value })}
				onChangeTablet={(value) => setAttributes({ [tabletBorderStyleKey]: value })}
				onChangeMobile={(value) => setAttributes({ [mobileBorderStyleKey]: value })}
			/>
			<ResponsiveMeasurementControls
				label={__('Border Radius', 'kadence-blocks')}
				value={borderRadius}
				tabletValue={tabletBorderRadius}
				mobileValue={mobileBorderRadius}
				onChange={(value) => setAttributes({ [borderRadiusKey]: value })}
				onChangeTablet={(value) => setAttributes({ [tabletBorderRadiusKey]: value })}
				onChangeMobile={(value) => setAttributes({ [mobileBorderRadiusKey]: value })}
				unit={borderRadiusUnit}
				units={['px', 'em', 'rem', '%']}
				onUnit={(value) => setAttributes({ [borderRadiusUnitKey]: value })}
				max={borderRadiusUnit === 'em' || borderRadiusUnit === 'rem' ? 24 : 500}
				step={borderRadiusUnit === 'em' || borderRadiusUnit === 'rem' ? 0.1 : 1}
				min={0}
				isBorderRadius={true}
				allowEmpty={true}
			/>
			<BoxShadowControl
				label={__('Box Shadow', 'kadence-blocks')}
				enable={undefined !== displayShadow ? displayShadow : false}
				color={
					undefined !== shadow && undefined !== shadow[0] && undefined !== shadow[0].color
						? shadow[0].color
						: '#000000'
				}
				colorDefault={'#000000'}
				onArrayChange={(color, opacity) => {
					saveShadow({ color: color, opacity: opacity });
				}}
				opacity={
					undefined !== shadow && undefined !== shadow[0] && undefined !== shadow[0].opacity
						? shadow[0].opacity
						: 0.2
				}
				hOffset={
					undefined !== shadow && undefined !== shadow[0] && undefined !== shadow[0].hOffset
						? shadow[0].hOffset
						: 0
				}
				vOffset={
					undefined !== shadow && undefined !== shadow[0] && undefined !== shadow[0].vOffset
						? shadow[0].vOffset
						: 0
				}
				blur={
					undefined !== shadow && undefined !== shadow[0] && undefined !== shadow[0].blur
						? shadow[0].blur
						: 14
				}
				spread={
					undefined !== shadow && undefined !== shadow[0] && undefined !== shadow[0].spread
						? shadow[0].spread
						: 0
				}
				inset={
					undefined !== shadow && undefined !== shadow[0] && undefined !== shadow[0].inset
						? shadow[0].inset
						: false
				}
				onEnableChange={(value) => {
					setAttributes({
						[displayShadowKey]: value,
					});
				}}
				onColorChange={(value) => {
					saveShadow({ color: value });
				}}
				onOpacityChange={(value) => {
					saveShadow({ opacity: value });
				}}
				onHOffsetChange={(value) => {
					saveShadow({ hOffset: value });
				}}
				onVOffsetChange={(value) => {
					saveShadow({ vOffset: value });
				}}
				onBlurChange={(value) => {
					saveShadow({ blur: value });
				}}
				onSpreadChange={(value) => {
					saveShadow({ spread: value });
				}}
				onInsetChange={(value) => {
					saveShadow({ inset: value });
				}}
			/>
		</>
	);
}
