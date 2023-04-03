/**
 * WordPress dependencies
 */
 import { __ } from '@wordpress/i18n';
 import {
	useState,
	useRef,
	useEffect,
	useMemo,
 } from '@wordpress/element';
 import {
	Panel,
	ToggleControl,
	Button,
} from '@wordpress/components';
import {
	useBlockDisplayInformation,
	store as blockEditorStore,
	BlockIcon,
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
/**
 * Import Css
 */
import './editor.scss';

export default function PanelButton( { 
	clientId, 
	onClick,
	label, 
	icon = false
} ) {
	return (
		<div
			className="kadence-blocks-panel-button"
		>
			<Button
				className="kadence-blocks-panel-button__button"
				onClick={ () => onClick() }
				icon={ icon }
			>
				{ label }
			</Button>
		</div>
	);
}