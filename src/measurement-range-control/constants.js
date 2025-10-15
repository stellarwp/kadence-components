/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';
export const OPTIONS_MAP = [
	{
		value: '0',
		label: __('None', '__KADENCE__TEXT__DOMAIN__'),
		size: 0,
		name: __('None', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'xxs',
		output: 'var(--global-kb-spacing-xxs, 0.5rem)',
		size: 8,
		label: __('XXS', '__KADENCE__TEXT__DOMAIN__'),
		name: __('2X Small', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'xs',
		output: 'var(--global-kb-spacing-xs, 1rem)',
		size: 16,
		label: __('XS', '__KADENCE__TEXT__DOMAIN__'),
		name: __('X Small', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'sm',
		output: 'var(--global-kb-spacing-sm, 1.5rem)',
		size: 24,
		label: __('SM', '__KADENCE__TEXT__DOMAIN__'),
		name: __('Small', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'md',
		output: 'var(--global-kb-spacing-md, 2rem)',
		size: 32,
		label: __('MD', '__KADENCE__TEXT__DOMAIN__'),
		name: __('Medium', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'lg',
		output: 'var(--global-kb-spacing-lg, 3rem)',
		size: 48,
		label: __('LG', '__KADENCE__TEXT__DOMAIN__'),
		name: __('Large', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'xl',
		output: 'var(--global-kb-spacing-xl, 4rem)',
		size: 64,
		label: __('XL', '__KADENCE__TEXT__DOMAIN__'),
		name: __('X Large', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: 'xxl',
		output: 'var(--global-kb-spacing-xxl, 5rem)',
		size: 80,
		label: __('XXL', '__KADENCE__TEXT__DOMAIN__'),
		name: __('2X Large', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: '3xl',
		output: 'var(--global-kb-spacing-3xl, 6.5rem)',
		size: 104,
		label: __('3XL', '__KADENCE__TEXT__DOMAIN__'),
		name: __('3X Large', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: '4xl',
		output: 'var(--global-kb-spacing-4xl, 8rem)',
		size: 128,
		label: __('4XL', '__KADENCE__TEXT__DOMAIN__'),
		name: __('4X Large', '__KADENCE__TEXT__DOMAIN__'),
	},
	{
		value: '5xl',
		output: 'var(--global-kb-spacing-5xl, 10rem)',
		size: 160,
		label: __('5XL', '__KADENCE__TEXT__DOMAIN__'),
		name: __('5X Large', '__KADENCE__TEXT__DOMAIN__'),
	},
];
