/**
 * Range Control
 *
 */

/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';
import { useInstanceId } from '@wordpress/compose';
import { range } from 'lodash';
import { Button, DropdownMenu, ToolbarGroup } from '@wordpress/components';
/**
 * Import Css
 */
import './editor.scss';
import HeadingLevelIcon from './../heading-level-icon';
import { pxIcon, emIcon, remIcon, vhIcon, vwIcon, percentIcon } from '@kadence/icons';

let icons = {
	px: pxIcon,
	em: emIcon,
	rem: remIcon,
	vh: vhIcon,
	vw: vwIcon,
	percent: percentIcon,
};
/**
 * Build the Measure controls
 * @returns {object} Measure settings.
 */
export default function tagSelect({
	label,
	onChange,
	value = '',
	className = '',
	ariaLabel = __('Change HTML Tag', '__KADENCE__TEXT__DOMAIN__'),
	reset = false,
	headingOnly = false,
	tagLowLevel = 1,
	tagHighLevel = 7,
	otherTags,
}) {
	const level = value !== 'span' && value !== 'div' && value !== 'p' ? value : 2;
	const htmlTag = value === 'span' || value === 'div' || value === 'p' ? value : 'heading';
	const createhtmlTagControl = (targetLevel) => {
		return [
			{
				icon: (
					<HeadingLevelIcon
						level={targetLevel}
						isPressed={targetLevel === level && htmlTag && htmlTag === 'heading' ? true : false}
					/>
				),
				title: sprintf(
					/* translators: %d: heading level e.g: "1", "2", "3" */
					__('Heading %d', '__KADENCE__TEXT__DOMAIN__'),
					targetLevel
				),
				isActive: targetLevel === level && htmlTag && htmlTag === 'heading' ? true : false,
				onClick: () => onChange(targetLevel),
			},
		];
	};
	const headingOnlyOptions = range(tagLowLevel, tagHighLevel).map(createhtmlTagControl);
	const headingOptions = headingOnlyOptions.map((val) => val);

	if ((otherTags && otherTags.p) || !otherTags) {
		headingOptions.push([
			{
				icon: <HeadingLevelIcon level={'p'} isPressed={htmlTag && htmlTag === 'p' ? true : false} />,
				title: __('Paragraph', '__KADENCE__TEXT__DOMAIN__'),
				isActive: htmlTag && htmlTag === 'p' ? true : false,
				onClick: () => onChange('p'),
			},
		]);
	}
	if ((otherTags && otherTags.span) || !otherTags) {
		headingOptions.push([
			{
				icon: <HeadingLevelIcon level={'span'} isPressed={htmlTag && htmlTag === 'span' ? true : false} />,
				title: __('Span', '__KADENCE__TEXT__DOMAIN__'),
				isActive: htmlTag && htmlTag === 'span' ? true : false,
				onClick: () => onChange('span'),
			},
		]);
	}
	if ((otherTags && otherTags.div) || !otherTags) {
		headingOptions.push([
			{
				icon: <HeadingLevelIcon level={'div'} isPressed={htmlTag && htmlTag === 'div' ? true : false} />,
				title: __('div', '__KADENCE__TEXT__DOMAIN__'),
				isActive: htmlTag && htmlTag === 'div' ? true : false,
				onClick: () => onChange('div'),
			},
		]);
	}

	return [
		onChange && (
			<div className={`kb-tag-level-control components-base-control${className ? ' ' + className : ''}`}>
				{label && (
					<div className={'kadence-component__header kadence-tag-select__header'}>
						{label && (
							<div className="kadence-component__header__title kadence-tag-select__title">
								<label className="components-base-control__label">{label}</label>
								{reset && (
									<div className="title-reset-wrap">
										<Button
											className="is-reset is-single"
											label="reset"
											isSmall
											disabled={isEqual(defaultValue, value) ? true : false}
											icon={undo}
											onClick={() => onReset()}
										/>
									</div>
								)}
							</div>
						)}
					</div>
				)}
				<div className={'kadence-controls-content kb-tag-select-control-inner'}>
					<ToolbarGroup
						isCollapsed={false}
						label={ariaLabel}
						controls={headingOnly ? headingOnlyOptions : headingOptions}
					/>
				</div>
			</div>
		),
	];
}
