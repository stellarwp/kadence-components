/**
 * A component that allows for a sub component to be added multiple times
 * Provides and index property to the sub component so it can save to a array
 */

import { Button, TextControl, SelectControl, DatePicker, TimePicker, DateTimePicker } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { closeSmall as closeIcon, plus } from '@wordpress/icons';
import { isEmpty, get } from 'lodash';
import { useEntityBlockEditor, useEntityProp } from '@wordpress/core-data';

import { getBlockByUniqueID } from '@kadence/helpers';

function FieldMultiRule({ props, formPostID, setAttributes, combine }) {
	// StoreAttribute hsould be the attribute that will store the state of this multi component.
	// It should come as an empty object {}
	// Here, it will be populated by component attributes, each sub component getting an index as it's added
	// The format will look like this
	//
	// {
	//     idjanjeifh: {
	//         componentAttribute1: 'value'
	//         componentAttribute2: 'value2'
	//     },
	//     pdnuanedue: {
	//         componentAttribute1: 'value'
	//         componentAttribute2: 'value2'
	//     },
	//     bguoszqufh: {
	//         componentAttribute1: 'value'
	//         componentAttribute2: 'value2'
	//     }
	// }

	const {
		attributes,
		attributes: { kadenceFieldConditional },
	} = props;
	const defaultOptions = {
		enable: false,
		rules: [],
	};
	const conditionalOptions =
		kadenceFieldConditional && kadenceFieldConditional.conditionalData
			? kadenceFieldConditional.conditionalData
			: defaultOptions;

	const [currentFields] = useFormMeta('_kad_form_fields');

	let currentFieldsSelect = [];

	const [blocks] = useEntityBlockEditor('postType', 'kadence_form', formPostID);
	const formInnerBlocks = get(blocks, [0, 'innerBlocks'], []);
	if (currentFields) {
		currentFieldsSelect = currentFields.reduce(function (result, item) {
			if ('undefined' != typeof item.uniqueID && item.uniqueID != attributes.uniqueID) {
				result.push({ label: item.label, value: item.uniqueID });
			}
			return result;
		}, []);
		currentFieldsSelect.unshift({ label: __('Select Field', '__KADENCE__TEXT__DOMAIN__'), value: '' });
	}

	const rows = [];

	const numberTypes = ['number', 'date', 'time'];
	const optionTypes = ['select', 'radio', 'accept'];
	const optionMultiTypes = ['checkbox'];
	const fillTypes = ['file'];

	const compareOptions = {
		text: [
			{ value: 'not_empty', label: __('Not Empty', '__KADENCE__TEXT__DOMAIN__') },
			{ value: 'is_empty', label: __('Empty', '__KADENCE__TEXT__DOMAIN__') },
			{ value: 'equals', label: '=' },
			{ value: 'not_equals', label: '!=' },
			{ value: 'contains', label: __('Contains', '__KADENCE__TEXT__DOMAIN__') },
			{ value: 'doesnotcontain', label: __('Does Not Contain', '__KADENCE__TEXT__DOMAIN__') },
			{ value: 'beginswith', label: __('Begins With', '__KADENCE__TEXT__DOMAIN__') },
			{ value: 'doesnotbeginwith', label: __('Does Not Begin With', '__KADENCE__TEXT__DOMAIN__') },
			{ value: 'endswith', label: __('Ends With', '__KADENCE__TEXT__DOMAIN__') },
			{ value: 'doesnotendwith', label: __('Does Not End With', '__KADENCE__TEXT__DOMAIN__') },
		],
		number: [
			{ value: 'not_empty', label: __('Not Empty', '__KADENCE__TEXT__DOMAIN__') },
			{ value: 'is_empty', label: __('Empty', '__KADENCE__TEXT__DOMAIN__') },
			{ value: 'equals', label: '=' },
			{ value: 'not_equals', label: '!=' },
			{ value: 'equals_or_greater', label: '>=' },
			{ value: 'equals_or_less', label: '<=' },
			{ value: 'greater', label: '>' },
			{ value: 'less', label: '<' },
		],
		option: [
			{ value: 'equals', label: '=' },
			{ value: 'not_equals', label: '!=' },
		],
		optionMulti: [
			{ value: 'equals', label: '=' },
			{ value: 'not_equals', label: '!=' },
			{ value: 'contains', label: __('Contains', '__KADENCE__TEXT__DOMAIN__') },
		],
		fill: [
			{ value: 'not_empty', label: __('Not Empty', '__KADENCE__TEXT__DOMAIN__') },
			{ value: 'is_empty', label: __('Empty', '__KADENCE__TEXT__DOMAIN__') },
		],
	};

	const blankRule = {
		field: '',
		compare: '',
		value: '',
	};

	const saveConditionalRule = (value, key) => {
		let options = kadenceFieldConditional;
		if (isEmpty(options.conditionalData.rules[key])) {
			options.conditionalData.rules[key] = blankRule;
		}
		options.conditionalData.rules[key] = { ...options.conditionalData.rules[key], ...value };

		options = JSON.parse(JSON.stringify(options));
		setAttributes({
			kadenceFieldConditional: options,
		});
	};

	const addConditionalRule = () => {
		const key = Math.random().toString(16).slice(2); //random id
		let options = kadenceFieldConditional;
		options.conditionalData.rules[key] = blankRule;

		options = JSON.parse(JSON.stringify(options));
		setAttributes({
			kadenceFieldConditional: options,
		});
	};

	const removeConditionalRule = (key) => {
		let options = kadenceFieldConditional;
		delete options.conditionalData.rules[key];

		options = JSON.parse(JSON.stringify(options));
		setAttributes({
			kadenceFieldConditional: options,
		});
	};

	const getOptionFieldOptions = (selectedField) => {
		let options = [];
		if ('accept' == selectedField?.type) {
			options = [
				,
				{
					label: 'not checked',
					value: '',
				},
				{
					label: 'checked',
					value: 'accept',
				},
			];
		} else {
			const block = getBlockByUniqueID(formInnerBlocks, selectedField?.uniqueID);
			options = [...block?.attributes?.options];
			options = options.map((option) => {
				return { label: option.label, value: option?.value ? option.value : option.label };
			});

			options.unshift({ label: __('Select Option', '__KADENCE__TEXT__DOMAIN__'), value: '' });
			// console.log(1, block, options);
		}
		return options;
	};

	// The main loop that poulates the rows of individual rules
	var z = Object.entries(conditionalOptions.rules).length;
	for (const [key, value] of Object.entries(conditionalOptions.rules)) {
		const selectedField = conditionalOptions.rules[key].field
			? currentFields.find((e) => e.uniqueID === conditionalOptions.rules[key].field)
			: {};
		let selectedFieldType = 'text';
		let selectedFieldOptions = [];

		if (numberTypes.includes(selectedField?.type)) {
			selectedFieldType = 'number';
		}
		if (optionTypes.includes(selectedField?.type)) {
			selectedFieldType = 'option';
		}
		if (optionMultiTypes.includes(selectedField?.type)) {
			selectedFieldType = 'optionMulti';
		}
		if (fillTypes.includes(selectedField?.type)) {
			selectedFieldType = 'fill';
		}

		if ('option' == selectedFieldType || 'optionMulti' == selectedFieldType) {
			selectedFieldOptions = getOptionFieldOptions(selectedField);
		}
		const rField = conditionalOptions.rules[key].field;
		const rCompare = conditionalOptions.rules[key].compare;
		const rValue = conditionalOptions.rules[key].value;
		const defaultCompare = compareOptions[selectedFieldType][0].value;
		const needsValue = !('not_empty' == rCompare || 'is_empty' == rCompare || '' == rCompare);

		// Set compare to default based on field type, it should only be empty if we haven't selected a field yet.
		if (selectedField?.type && '' == rCompare) {
			saveConditionalRule({ compare: defaultCompare }, key);
		}
		// Set value to current time if empty and on a date or time field
		if (
			selectedField?.type &&
			('date' == selectedField.type || 'time' == selectedField.type) &&
			'' == rValue &&
			needsValue
		) {
			const currentDateTime = new Date(new Date().toUTCString());
			saveConditionalRule({ value: currentDateTime }, key);
		}

		const renderValueControl = () => {
			if (needsValue) {
				if ('option' == selectedFieldType || 'optionMulti' == selectedFieldType) {
					return (
						<div className="components-base-control">
							<SelectControl
								label={__('Compare Value', '__KADENCE__TEXT__DOMAIN__')}
								options={selectedFieldOptions}
								className="kb-dynamic-select"
								classNamePrefix="kbp"
								value={rValue}
								onChange={(val) => {
									if (!val) {
										saveConditionalRule({ value: '' }, key);
									} else {
										saveConditionalRule({ value: val }, key);
									}
								}}
							/>
						</div>
					);
				} else if ('date' == selectedField?.type) {
					return (
						<div className="components-base-control">
							<DatePicker
								currentDate={rValue}
								onChange={(val) => {
									if (!val) {
										saveConditionalRule({ value: '' }, key);
									} else {
										saveConditionalRule({ value: val }, key);
									}
								}}
							/>
						</div>
					);
				} else if ('time' == selectedField?.type) {
					return (
						<div className="components-base-control kb-time-only">
							<TimePicker
								currentTime={rValue}
								onChange={(val) => {
									if (!val) {
										saveConditionalRule({ value: '' }, key);
									} else {
										saveConditionalRule({ value: val }, key);
									}
								}}
								is12Hour={true}
							/>
						</div>
					);
				} else {
					return (
						<div className="components-base-control">
							<TextControl
								label={__('Compare Value', '__KADENCE__TEXT__DOMAIN__')}
								placeholder={__('Compare to...', '__KADENCE__TEXT__DOMAIN__')}
								value={rValue}
								onChange={(val) => {
									if (!val) {
										saveConditionalRule({ value: '' }, key);
									} else {
										saveConditionalRule({ value: val }, key);
									}
								}}
							/>
						</div>
					);
				}
			}
		};

		rows.push(
			<>
				<div className="kb-field-rule">
					<Button
						label={__('Remove Rule', '__KADENCE__TEXT__DOMAIN__')}
						icon={closeIcon}
						size={'small'}
						// iconSize={18}
						// variant={'secondary'}
						onClick={() => removeConditionalRule(key)}
						className="kb-field-rule-remove"
					/>
					<div className="components-base-control">
						<SelectControl
							label={__('Field', '__KADENCE__TEXT__DOMAIN__')}
							options={currentFieldsSelect}
							className="kb-dynamic-select"
							classNamePrefix="kbp"
							value={undefined !== rField ? rField : ''}
							onChange={(val) => {
								if (!val) {
									saveConditionalRule({ field: '', compare: '', value: '' }, key);
								} else {
									saveConditionalRule({ field: val, compare: '', value: '' }, key);
								}
							}}
						/>
					</div>
					{rField && (
						<div className="components-base-control">
							<SelectControl
								label={__('Compare Type', '__KADENCE__TEXT__DOMAIN__')}
								options={compareOptions[selectedFieldType]}
								className="kb-dynamic-select"
								classNamePrefix="kbp"
								value={rCompare}
								onChange={(val) => {
									if (!val) {
										saveConditionalRule({ compare: '' }, key);
									} else {
										saveConditionalRule({ compare: val }, key);
									}
								}}
							/>
						</div>
					)}
					{renderValueControl()}
					{/* <Button
                        text={'X'}
                        size={'small'}
                        variant={'primary'}
                        onClick={ () => removeConditionalRule( key ) }
                        className='kb-field-rule-remove'
                    /> */}
				</div>
				{z > 1 && (
					<div class="combine">
						<i>{combine ? combine : ''}</i>
					</div>
				)}
			</>
		);
		z--;
	}

	return (
		<div className="kb-field-rules">
			{rows}
			<Button
				text={__('Add Rule', '__KADENCE__TEXT__DOMAIN__')}
				variant="primary"
				icon={plus}
				onClick={addConditionalRule}
				className="kb-field-rule-add"
			/>
		</div>
	);
}

export default FieldMultiRule;

function useFormProp(prop) {
	return useEntityProp('postType', 'kadence_form', prop);
}

function useFormMeta(key) {
	const [meta, setMeta] = useFormProp('meta');

	return [
		meta[key],
		useCallback(
			(newValue) => {
				setMeta({ ...meta, [key]: newValue });
			},
			[key, setMeta]
		),
	];
}
