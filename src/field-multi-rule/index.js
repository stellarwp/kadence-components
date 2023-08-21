/**
 * A component that allows for a sub component to be added multiple times
 * Provides and index property to the sub component so it can save to a array
 */

import { Button, TextControl, SelectControl } from '@wordpress/components'
import { useCallback } from '@wordpress/element';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import { isEmpty } from 'lodash';
import {
	useEntityProp,
} from '@wordpress/core-data';

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
    currentFieldsSelect.unshift({label: 'Select Field', value: ''});

    const rows = [];

    const compareOptions = [
        { value: 'not_empty', label: __( 'Not Empty', 'kadence-blocks-pro' ) },
        { value: 'is_empty', label: __( 'Empty', 'kadence-blocks-pro' ) },
        { value: 'equals', label: '=' },
        { value: 'not_equals', label: '!=' },
        { value: 'equals_or_greater', label: '>=' },
        { value: 'equals_or_less', label: '<=' },
        { value: 'greater', label: '>' },
        { value: 'less', label: '<' },
        { value: 'contains', label: __( 'Contains', 'kadence-blocks-pro' ) },
        { value: 'doesnotcontain', label: __( 'Does Not Contain', 'kadence-blocks-pro' ) },
        { value: 'beginswith', label: __( 'Begins With', 'kadence-blocks-pro' ) },
        { value: 'doesnotbeginwith', label: __( 'Does Not Begin With', 'kadence-blocks-pro' ) },
        { value: 'endswith', label: __( 'Ends With', 'kadence-blocks-pro' ) },
        { value: 'doesnotendwith', label: __( 'Does Not End With', 'kadence-blocks-pro' ) },
    ];

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

    for (const [key, value] of Object.entries(conditionalOptions.rules)) {
        rows.push(
            <Fragment>
                <span className="kb-dynamic-title kb-dynamic-components-label">{ __( 'Conditional', 'kadence-blocks-pro' ) }</span>
                <div className="components-base-control">
                    <SelectControl
                        label={ __( 'Field', 'kadence-blocks-pro' ) }
                        options={ currentFieldsSelect }
                        className="kb-dynamic-select"
                        classNamePrefix="kbp"
                        value={ ( undefined !== conditionalOptions.rules[key].field ? conditionalOptions.rules[key].field : '' ) }
                        onChange={ ( val ) => {
                            if ( ! val ) {
                                saveConditionalRule( { field: '' }, key );
                            } else {
                                saveConditionalRule( { field: val }, key );
                            }
                        } }
                    />
                </div>
				{ conditionalOptions.rules[key].field && (
                    <div className="components-base-control">
                        <SelectControl
                            label={ __( 'Compare Type', 'kadence-blocks-pro' ) }
                            options={ compareOptions }
                            className="kb-dynamic-select"
                            classNamePrefix="kbp"
                            value={ ( undefined !== conditionalOptions.rules[key].compare ? conditionalOptions.rules[key].compare : 'not_empty' ) }
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
				{ conditionalOptions.rules[key].compare && (
                    <div className="components-base-control">
                        <TextControl
                            label={__( 'Value', 'kadence-blocks' )}
                            placeholder={__( 'Compare to...', 'kadence-blocks' )}
                            value={conditionalOptions.rules[key].value}
                            onChange={ ( val ) => {
                                if ( ! val ) {
                                    saveConditionalRule( { value: '' }, key );
                                } else {
                                    saveConditionalRule( { value: val }, key );
                                }
                            } }
                        />
                    </div>
                ) }
                <Button
                    text={'Remove Rule'}
                    size={'small'}
                    variant={'primary'}
                    onClick={ () => removeConditionalRule( key ) }
                />
            </Fragment>
        );
    }

    return (
        <Fragment>
            {rows}
            <Button
                text={'Add Rule'}
                size={'small'}
                variant={'primary'}
                onClick={ addConditionalRule }
            />
        </Fragment>
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