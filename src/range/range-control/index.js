/**
 * Range Control
 *
 */

/**
 * Internal block libraries
 */
import { RangeControl as CoreRangeControl } from '@wordpress/components';
import { TokenChip, TokenPickerButton, isTokenAlias } from '../../common/token-alias';

/**
 * Build the Measure controls
 * @returns {object} Measure settings.
 */
export default function RangeControl({
	label,
	onChange,
	value = '',
	className = '',
	step = 1,
	max = 100,
	min = 0,
	beforeIcon = '',
	help = '',
	unit = '',
	onUnit,
	showUnit = false,
	units = ['px', 'em', 'rem'],
	tokens,
	onSelectToken,
	onUnlinkToken,
}) {
	return [
		onChange && (
			<div className={`components-base-control kadence-range-control${className ? ' ' + className : ''}`}>
				{label && <label className="components-base-control__label">{label}</label>}
				<TokenPickerButton
					tokens={tokens}
					onSelect={onSelectToken ? (alias) => onSelectToken(alias) : undefined}
					isActive={isTokenAlias(value)}
				/>
				<div className={'kadence-controls-content'}>
					<div className={'kadence-range-control-inner'}>
						{isTokenAlias(value) ? (
							<TokenChip
								value={value}
								tokens={tokens}
								onUnlink={onUnlinkToken ? () => onUnlinkToken() : undefined}
							/>
						) : (
							<CoreRangeControl
								className={'kadence-range-control-range'}
								beforeIcon={beforeIcon}
								value={value}
								onChange={(newVal) => onChange(newVal)}
								min={min}
								max={max}
								step={step}
								help={help}
								allowReset={true}
							/>
						)}
					</div>
					{(onUnit || showUnit) && (
						<div className={'kadence-units kadence-measure-control-select-wrapper'}>
							<select
								className={'kadence-measure-control-select components-unit-control__select'}
								onChange={(event) => {
									if (onUnit) {
										onUnit(event.target.value);
									}
								}}
								value={unit}
								disabled={units.length === 1}
							>
								{units.map((option) => (
									<option value={option} selected={unit === option ? true : undefined} key={option}>
										{option}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
			</div>
		),
	];
}
