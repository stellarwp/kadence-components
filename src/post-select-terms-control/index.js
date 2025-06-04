/* global wp */
/**
 * External dependencies
 */
import Select from 'react-select';
import { __ } from '@wordpress/i18n';
import { useState, useRef, useEffect } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch';
import { getBlocksParams, getBlocksParam } from '@kadence/helpers';

export default function KadencePostSelectTerms({ value, onChange, source, isMulti = false, termOnly = false }) {
	const [isLoading, setIsLoading] = useState(true);
	const [terms, setTerms] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const theValue = value;
	const termOnlyValue =
		'array' == typeof value || 'object' == typeof value
			? value.map((option) => {
					const optValWithSource = source + '|' + option.value;
					return { value: optValWithSource, label: option.label };
			  })
			: value;

	useEffect(() => {
		const taxonomies = getBlocksParams('taxonomies', {});
		if (source && typeof taxonomies[source] != 'undefined' && taxonomies[source]) {
			setTerms(Array.from(taxonomies[source]));
			setIsLoading(false);
		} else {
			const options = {
				source: source,
				page: page,
				per_page: 50,
			};
			setIsLoading(true);
			apiFetch({
				path: addQueryArgs(getBlocksParam('termEndpoint'), options),
			})
				.then((taxonomyItems) => {
					if (!taxonomyItems) {
						setTerms([]);
						taxonomies[source] = [];
					} else {
						setTerms(taxonomyItems);
						taxonomies[source] = taxonomyItems;
					}
					setIsLoading(false);
				})
				.catch(() => {
					setIsLoading(false);
					setTerms([]);
					taxonomies[source] = [];
				});
		}
	}, [source]);
	if (isLoading) {
		return <Spinner />;
	}
	const customStyles = {
		menuPortal: (provided) => ({
			...provided,
			zIndex: 99999999,
		}),
	};
	return (
		<div className={'kb-inner-term-select-wrap'}>
			<Select
				options={terms}
				className="kb-dynamic-select"
				classNamePrefix="kbp"
				value={
					isMulti
						? termOnly
							? termOnlyValue
							: value
						: '' !== value
						? terms.filter(({ value }) => value === theValue)
						: ''
				}
				isMulti={isMulti}
				isSearchable={true}
				isClearable={true}
				menuPortalTarget={document.body}
				styles={customStyles}
				maxMenuHeight={200}
				placeholder={__('Select Term', 'kadence-blocks-pro')}
				onChange={(val) => {
					if (!val) {
						onChange('');
					} else if (isMulti) {
						var toReturn = val;
						if (termOnly) {
							toReturn = val.map((option) => {
								const optValTermOnly = option.value.split('|')?.[1];
								return { value: optValTermOnly, label: option.label };
							});
						}
						onChange(toReturn);
					} else {
						if (termOnly) {
							onChange(val.value.split('|')?.[1]);
						}
						onChange(val.value);
					}
				}}
			/>
		</div>
	);
}
