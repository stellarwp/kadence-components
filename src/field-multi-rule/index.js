/**
 * A component that allows for a sub component to be added multiple times
 * Provides and index property to the sub component so it can save to a array
 */

import { Button, TextControl, SelectControl, DatePicker, TimePicker, DateTimePicker } from '@wordpress/components'
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isEmpty, get } from 'lodash';
import {
	useEntityBlockEditor,
	useEntityProp,
} from '@wordpress/core-data';

import { getBlockByUniqueID } from '@kadence/helpers'

function FieldMultiRule ( {
    props,
    setAttributes,
} ) {
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


    const { attributes, attributes:{ kadenceFieldConditional } } = props;

    const conditionalOptions = ( kadenceFieldConditional && kadenceFieldConditional.conditionalData ? kadenceFieldConditional.conditionalData : defaultOptions );

	const [ currentFields ] = useFormMeta( '_kad_form_fields' );

    let currentFieldsSelect = [];
    if ( currentFields ) {
        currentFieldsSelect = currentFields.reduce(function(result, item) {
            if ( 'undefined' != typeof( item.uniqueID ) && item.uniqueID != attributes.uniqueID ) {
                result.push({label: item.label, value: item.uniqueID});
            }
            return result;
        }, []);
    }

    const formId = currentFields?.[0]?.postId;

    const [ blocks ] = useEntityBlockEditor(
        'postType',
        'kadence_form',
        formId,
    );
    const formInnerBlocks = get( blocks, [ 0, 'innerBlocks' ], [] );

    currentFieldsSelect.unshift({label: 'Select Field', value: ''});

    const rows = [];

    const numberTypes = ['number', 'date', 'time']
    const optionTypes = ['select', 'checkbox', 'radio', 'accept']
    const fillTypes = ['file']

    const compareOptions = {
        'text': [
            { value: 'not_empty', label: __( 'Not Empty', 'kadence-blocks-pro' ) },
            { value: 'is_empty', label: __( 'Empty', 'kadence-blocks-pro' ) },
            { value: 'equals', label: '=' },
            { value: 'not_equals', label: '!=' },
            { value: 'contains', label: __( 'Contains', 'kadence-blocks-pro' ) },
            { value: 'doesnotcontain', label: __( 'Does Not Contain', 'kadence-blocks-pro' ) },
            { value: 'beginswith', label: __( 'Begins With', 'kadence-blocks-pro' ) },
            { value: 'doesnotbeginwith', label: __( 'Does Not Begin With', 'kadence-blocks-pro' ) },
            { value: 'endswith', label: __( 'Ends With', 'kadence-blocks-pro' ) },
            { value: 'doesnotendwith', label: __( 'Does Not End With', 'kadence-blocks-pro' ) },
        ],
        'number': [
            { value: 'not_empty', label: __( 'Not Empty', 'kadence-blocks-pro' ) },
            { value: 'is_empty', label: __( 'Empty', 'kadence-blocks-pro' ) },
            { value: 'equals', label: '=' },
            { value: 'not_equals', label: '!=' },
            { value: 'equals_or_greater', label: '>=' },
            { value: 'equals_or_less', label: '<=' },
            { value: 'greater', label: '>' },
            { value: 'less', label: '<' },
        ],
        'option': [
            { value: 'equals', label: '=' },
            { value: 'not_equals', label: '!=' },
        ],
        'fill': [
            { value: 'not_empty', label: __( 'Not Empty', 'kadence-blocks-pro' ) },
            { value: 'is_empty', label: __( 'Empty', 'kadence-blocks-pro' ) },
        ],
    }

    const blankRule = {
        field: '',
        compare: '',
        value: ''
    }

    const saveConditionalRule = ( value, key ) => {
        let options = kadenceFieldConditional;
        if ( isEmpty( options.conditionalData.rules[key] )  ) {
            options.conditionalData.rules[key] = blankRule;
        }
        options.conditionalData.rules[key] = { ...options.conditionalData.rules[key], ...value };

        options = JSON.parse( JSON.stringify( options ) );
        setAttributes( {
            kadenceFieldConditional: options,
        } );
    };

    const addConditionalRule = () => {
        const key = Math.random().toString(16).slice(2); //random id
        let options = kadenceFieldConditional;
        options.conditionalData.rules[key] = blankRule;

        options = JSON.parse( JSON.stringify( options ) );
        setAttributes( {
            kadenceFieldConditional: options,
        } );
    }

    const removeConditionalRule = ( key ) => {
        let options = kadenceFieldConditional;
        delete options.conditionalData.rules[key];

        options = JSON.parse( JSON.stringify( options ) );
        setAttributes( {
            kadenceFieldConditional: options,
        } );
    }

    const getOptionFieldOptions = ( selectedField ) => {
        let options = [];
        if ( 'accept' == selectedField?.type ) {
            options = [,
                {
                    label: 'not checked',
                    value: ''
                },
                {
                    label: 'checked',
                    value: 'accept'
                }
            ]
        } else {
            const block = getBlockByUniqueID(formInnerBlocks, selectedField?.uniqueID)
            options = block?.attributes?.options;
            options.unshift({label: 'Select Option', value: ''});
        }
        return options;
    }

    for (const [key, value] of Object.entries(conditionalOptions.rules)) {
        const selectedField = conditionalOptions.rules[key].field ? currentFields.find(e => e.uniqueID === conditionalOptions.rules[key].field) : {};
        let selectedFieldType = 'text';
        let selectedFieldOptions = [];
        
        if ( numberTypes.includes( selectedField?.type ) ) {
            selectedFieldType = 'number';
        }
        if ( optionTypes.includes( selectedField?.type ) ) {
            selectedFieldType = 'option';
        }
        if ( fillTypes.includes( selectedField?.type ) ) {
            selectedFieldType = 'fill';
        }

        if ( 'option' == selectedFieldType ) {
            selectedFieldOptions = getOptionFieldOptions( selectedField );
        }

        const rField = conditionalOptions.rules[key].field;
        const rCompare = conditionalOptions.rules[key].compare;
        const rValue = conditionalOptions.rules[key].value;
        const defaultCompare = compareOptions[selectedFieldType][0].value;
        const needsValue = ! ( 'not_empty' == rCompare || 'is_empty' == rCompare || '' == rCompare );

        // Set compare to default based on field type, it should only be empty if we haven't selected a field yet.
        if ( selectedField?.type && '' == rCompare ) {
            saveConditionalRule( { compare: defaultCompare }, key );
        }
        // Set value to current time if empty and on a date or time field
        if ( ( selectedField?.type && ('date' == selectedField.type || 'time' == selectedField.type ) ) && '' == rValue && needsValue) {
			const currentDateTime = new Date(new Date().toUTCString());
            saveConditionalRule( { value: currentDateTime }, key );
        }

        const renderValueControl = () => {
            if ( needsValue ) {
                if ( 'option' == selectedFieldType ) {
                    return (
                        <div className="components-base-control">
                            <SelectControl
                                label={ __( 'Compare Value', 'kadence-blocks-pro' ) }
                                options={ selectedFieldOptions }
                                className="kb-dynamic-select"
                                classNamePrefix="kbp"
                                value={rValue}
                                onChange={ ( val ) => {
                                    if ( ! val ) {
                                        saveConditionalRule( { value: '' }, key );
                                    } else {
                                        saveConditionalRule( { value: val }, key );
                                    }
                                } }
                            />
                        </div>
                    );
                } else if ( 'date' == selectedField?.type ) {
                    return (
                        <div className="components-base-control">
                            <DatePicker
                                currentDate={rValue}
                                onChange={ ( val ) => {
                                    if ( ! val ) {
                                        saveConditionalRule( { value: '' }, key );
                                    } else {
                                        saveConditionalRule( { value: val }, key );
                                    }
                                } }
                            />
                        </div>
                    );
                } else if ( 'time' == selectedField?.type ) {
                    return (
                        <div className="components-base-control kb-time-only">
                            <TimePicker
                                currentTime={rValue}
                                onChange={ ( val ) => {
                                    if ( ! val ) {
                                        saveConditionalRule( { value: '' }, key );
                                    } else {
                                        saveConditionalRule( { value: val }, key );
                                    }
                                } }
                                is12Hour={ true }
                            />
                        </div>
                    );
                } else {
                    return (
                        <div className="components-base-control">
                            <TextControl
                                label={__( 'Compare Value', 'kadence-blocks' )}
                                placeholder={__( 'Compare to...', 'kadence-blocks' )}
                                value={rValue}
                                onChange={ ( val ) => {
                                    if ( ! val ) {
                                        saveConditionalRule( { value: '' }, key );
                                    } else {
                                        saveConditionalRule( { value: val }, key );
                                    }
                                } }
                            />
                        </div>
                    )
                }
            }
        }

        rows.push(
            <div className='kb-field-rule'>
                <div className="components-base-control">
                    <SelectControl
                        label={ __( 'Field', 'kadence-blocks-pro' ) }
                        options={ currentFieldsSelect }
                        className="kb-dynamic-select"
                        classNamePrefix="kbp"
                        value={ ( undefined !== rField ? rField : '' ) }
                        onChange={ ( val ) => {
                            if ( ! val ) {
                                saveConditionalRule( { field: '', compare: '', value: '' }, key );
                            } else {
                                saveConditionalRule( { field: val, compare: '', value: '' }, key );
                            }
                        } }
                    />
                </div>
				{ rField && (
                    <div className="components-base-control">
                        <SelectControl
                            label={ __( 'Compare Type', 'kadence-blocks-pro' ) }
                            options={ compareOptions[selectedFieldType] }
                            className="kb-dynamic-select"
                            classNamePrefix="kbp"
                            value={ rCompare }
                            onChange={ ( val ) => {
                                if ( ! val ) {
                                    saveConditionalRule( { compare: '' }, key );
                                } else {
                                    saveConditionalRule( { compare: val }, key );
                                }
                            } }
                        />
                    </div>
                ) }
                {renderValueControl()}
                <Button
                    text={'Remove Rule'}
                    size={'small'}
                    variant={'primary'}
                    onClick={ () => removeConditionalRule( key ) }
                    className='kb-field-rule-remove'
                />
            </div>
        );
    }

    return (
        <div className='kb-field-rules'>
            {rows}
            <Button
                text={'Add Rule'}
                size={'small'}
                variant={'primary'}
                onClick={ addConditionalRule }
                className='kb-field-rule-add'
            />
        </div>
    )
}

export default FieldMultiRule;

function useFormProp( prop ) {
	return useEntityProp( 'postType', 'kadence_form', prop );
}

function useFormMeta( key ) {
	const [ meta, setMeta ] = useFormProp( 'meta' );

	return [
		meta[ key ],
		useCallback(
			( newValue ) => {
				setMeta( { ...meta, [ key ]: newValue } );
			},
			[ key, setMeta ],
		),
	];
}