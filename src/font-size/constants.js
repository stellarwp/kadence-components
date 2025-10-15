/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';
export const OPTIONS_MAP = [
	{
		value: 'sm',
		output: 'var(--global-kb-font-size-sm, 0.9rem)',
		size: 14,
		label: __('SM', '__KADENCE__TEXT__DOMAIN__'),
		name: __('Small', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'md',
		output: 'var(--global-kb-font-size-md, 1.2rem)',
		size: 32,
		label: __('MD', '__KADENCE__TEXT__DOMAIN__'),
		name: __('Medium', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'lg',
		output: 'var(--global-kb-font-size-lg, 3rem)',
		size: 48,
		label: __('LG', '__KADENCE__TEXT__DOMAIN__'),
		name: __('Large', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'xl',
		output: 'var(--global-kb-font-size-xl, 4rem)',
		size: 64,
		label: __('XL', '__KADENCE__TEXT__DOMAIN__'),
		name: __('X Large', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'xxl',
		output: 'var(--global-kb-font-size-xxl, 5rem)',
		size: 80,
		label: __('XXL', '__KADENCE__TEXT__DOMAIN__'),
		name: __('2X Large', '__KADENCE__TEXT__DOMAIN__'),
	},
];
