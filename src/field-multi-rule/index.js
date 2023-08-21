/**
 * A component that allows for a sub component to be added multiple times
 * Provides and index property to the sub component so it can save to a array
 */

import { Button } from '@wordpress/components'
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';
import { isEmpty } from 'lodash';

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

    const rows = [];

    // const fields = [].concat.apply( [], kadenceDynamicParams.conditionalFields.map( option => option.options ) );
    const fields = [{label:'Select Field',value:''},{label:'One',value:'one'}, {label:'Two',value:'two'}, {label:'Three',value:'three'}];

    const blankRule = {
        field: '',
        condition: '',
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
                <div className="components-base-control">
                    <span className="kb-dynamic-title kb-dynamic-components-label">{ __( 'Conditional', 'kadence-blocks-pro' ) }</span>
                    <div className="kb-dynamic-select-wrap">
                        <Select
                            options={ fields }
                            className="kb-dynamic-select"
                            classNamePrefix="kbp"
                            value={ ( undefined !== conditionalOptions.rules[key] ? fields.filter( ( { value } ) => value === conditionalOptions.rules[key].field ) : '' ) }
                            isMulti={ false }
                            isSearchable={ true }
                            isClearable={ true }
                            maxMenuHeight={ 200 }
                            placeholder={ __( 'None', 'kadence-blocks-pro' ) }
                            onChange={ ( val ) => {
                                if ( ! val ) {
                                    saveConditionalRule( { field: '' }, key );
                                } else {
                                    saveConditionalRule( { field: val.value }, key );
                                }
                            } }
                        />
                    </div>
                </div>
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