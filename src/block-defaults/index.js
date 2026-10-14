import { createInterpolateElement, useEffect, useState } from '@wordpress/element';
import { useSelect, useDispatch, select, dispatch } from '@wordpress/data';
import KadencePanelBody from '../panel-body/index.js';
import { __, sprintf } from '@wordpress/i18n';
import { getBlockType } from '@wordpress/blocks';
import { addQueryArgs } from '@wordpress/url';
import { omit, head, get, isEqual } from 'lodash';
import { store as noticesStore } from '@wordpress/notices';
import { Button, Modal, __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { SafeParseJSON, getTransferableAttributes } from '@kadence/helpers';
/**
 * The data store kadence-blocks registers in the Site Editor to open the Kadence
 * panel. Looked up by name, so this package doesn't depend on kadence-blocks code.
 */
const SITE_STYLES_STORE = 'kadence/site-styles';

/**
 * @param {string} blockName Block name, e.g. `kadence/singlebtn`.
 * @return {boolean} Whether site-level styles replace Block Defaults for the block: the
 * Kadence theme runs in FSE mode and kadence-blocks lists the block.
 */
function usesSiteStyles(blockName) {
	const params = typeof kadence_blocks_params === 'undefined' ? {} : kadence_blocks_params;

	return !!params.isFseMode && Array.isArray(params.siteStylesBlocks) && params.siteStylesBlocks.includes(blockName);
}

/**
 * Block Defaults for a block whose site-level styles are set in the Kadence panel:
 * a button that opens the panel in the Site Editor, a note elsewhere.
 *
 * @param {object} props           Component props.
 * @param {string} props.blockSlug Block name, e.g. `kadence/singlebtn`.
 * @return {Element} The panel.
 */
function SiteStylesPointer({ blockSlug }) {
	// kadence-blocks registers this store only where it mounts the panel: the Site Editor in FSE mode.
	const canOpenPanel = !!select(SITE_STYLES_STORE);
	const blockTitle = getBlockType(blockSlug)?.title || blockSlug;
	// Relative to wp-admin, where both editors run. The block name is encoded once more inside `section`, as core does.
	const stylesUrl = addQueryArgs('site-editor.php', {
		p: '/styles',
		section: '/blocks/' + encodeURIComponent(blockSlug),
	});

	return (
		<KadencePanelBody
			title={__('Block Defaults', '__KADENCE__TEXT__DOMAIN__')}
			initialOpen={false}
			panelName={`kb-${blockSlug}-defaults`}
		>
			{canOpenPanel
				? sprintf(
						/* translators: %1$s: block title, e.g. Single Button. */
						__(
							'Site styles replace Block Defaults for %1$s. They apply to every %1$s on the site, except where a block has its own setting.',
							'__KADENCE__TEXT__DOMAIN__'
						),
						blockTitle
				  )
				: createInterpolateElement(
						sprintf(
							/* translators: %1$s: block title, e.g. Single Button. */
							__(
								'Site styles replace Block Defaults for %1$s. You can change them in the Site Editor, under <a>Styles > Blocks > %1$s</a>.',
								'__KADENCE__TEXT__DOMAIN__'
							),
							blockTitle
						),
						{ a: <a href={stylesUrl} /> }
				  )}
			{canOpenPanel && (
				<>
					<br />
					<br />
					<Button variant="secondary" onClick={() => dispatch(SITE_STYLES_STORE).openSiteStyles(blockSlug)}>
						{__('Edit site styles', '__KADENCE__TEXT__DOMAIN__')}
					</Button>
				</>
			)}
		</KadencePanelBody>
	);
}

/**
 * Display Kadence Block Default settings -- intended for use in Inspector Controls.
 *
 * @param {object} attributes Block attributes.
 * @param {object} defaultAttributes The blocks default attributs for comparison on what is new.
 * @param {string} blockSlug Block slug.
 * @param {object} attributeNamePair Key value pair of attribute name and attribute label.
 * @param {array} excludedAttrs Keys to exclude from saved block defaults. An array of strings.
 * @param {array} preventMultiple Keys that should not have more than one subitem. An array of strings.
 *
 * @public
 */
export default function KadenceBlockDefaults(props) {
	const [user, setUser] = useState(kadence_blocks_params.userrole ? kadence_blocks_params.userrole : 'admin');
	if (user !== 'admin') {
		return null;
	}

	if (usesSiteStyles(props.blockSlug)) {
		return <SiteStylesPointer blockSlug={props.blockSlug} />;
	}

	return <BlockDefaultsPanel {...props} />;
}

/**
 * The Save / Modify / Reset Block Defaults panel. Kept apart from KadenceBlockDefaults so
 * its hooks always run in the same order, whichever panel that component returns.
 *
 * @param {object} props Same as KadenceBlockDefaults.
 */
function BlockDefaultsPanel({
	attributes,
	defaultAttributes = {},
	blockSlug,
	excludedAttrs = [],
	preventMultiple = [],
}) {
	const {createErrorNotice, createSuccessNotice} = useDispatch(noticesStore);

	const [isOpenResetConfirm, setIsOpenResetConfirm] = useState(false);
	const [isOpenSaveConfirm, setIsOpenSaveConfirm] = useState(false);
	const [isOpenModify, setIsOpenModify] = useState(false);

	const currentDefaults = SafeParseJSON(get(kadence_blocks_params, ['configuration'], {}), true);
	const currentBlockDefaults = get(currentDefaults, blockSlug, {});

	const [tmpDefaults, setTmpDefaults] = useState(currentBlockDefaults);
	const hasConfig = Object.keys(currentBlockDefaults).length !== 0;

	const calculate = () => {
		//grab all block attributes, minus the exclusions
		return getTransferableAttributes(attributes, defaultAttributes, excludedAttrs, preventMultiple);
	};

	const reset = () => {
		let config = kadence_blocks_params.configuration
			? SafeParseJSON(kadence_blocks_params.configuration, true)
			: {};
		config = omit(config, blockSlug);

		apiFetch({
			path: '/wp/v2/settings',
			method: 'POST',
			data: { kadence_blocks_config_blocks: JSON.stringify(config)},
		} ).then( () => {
			createSuccessNotice(__('Block default saved', '__KADENCE__TEXT__DOMAIN__'), {
                type: 'snackbar',
            })
            setIsOpenResetConfirm(false);
            kadence_blocks_params.configuration = JSON.stringify(config);
            setTmpDefaults({});
		});

    }

    const saveAll = () => {

        const newConfig = calculate();

        const config = (kadence_blocks_params.configuration ? SafeParseJSON(kadence_blocks_params.configuration, true) : {});
        config[blockSlug] = newConfig;
		apiFetch( {
			path: '/wp/v2/settings',
			method: 'POST',
			data: { kadence_blocks_config_blocks: JSON.stringify(config)},
		} ).then( () => {
			createSuccessNotice(__('Block default saved', '__KADENCE__TEXT__DOMAIN__'), {
				type: 'snackbar',
			});
			setIsOpenResetConfirm(false);
			kadence_blocks_params.configuration = JSON.stringify(config);
			setTmpDefaults({});
		});
	};

	const saveModified = () => {
		const config = kadence_blocks_params.configuration
			? SafeParseJSON(kadence_blocks_params.configuration, true)
			: {};
		config[blockSlug] = tmpDefaults;
		apiFetch({
			path: '/wp/v2/settings',
			method: 'POST',
			data: { kadence_blocks_config_blocks: JSON.stringify(config)},
		} ).then( () => {
			createSuccessNotice(__('Block default saved', '__KADENCE__TEXT__DOMAIN__'), {
				type: 'snackbar',
			});
			kadence_blocks_params.configuration = JSON.stringify(config);
		});
	};

	return (
		<>
			<KadencePanelBody
				title={__('Block Defaults', '__KADENCE__TEXT__DOMAIN__')}
				initialOpen={false}
				panelName={`kb-${blockSlug}-defaults`}
			>
				{__(
					'This will set the current block attributes as the default styles for this block type.',
					'__KADENCE__TEXT__DOMAIN__'
				)}
				&nbsp;
				{__('This will not modify any blocks that have already been created.', '__KADENCE__TEXT__DOMAIN__')}&nbsp;
				{__('Block content is not included.', '__KADENCE__TEXT__DOMAIN__')}&nbsp;
				<br />
				<br />
				<Button isPrimary={true} onClick={() => setIsOpenSaveConfirm(true)}>
					{__(' Save as default', '__KADENCE__TEXT__DOMAIN__')}
				</Button>
				{hasConfig && (
					<>
						<br />
						<br />

						<a href={'#'} onClick={() => setIsOpenModify(true)}>
							{__('Modify attributes', '__KADENCE__TEXT__DOMAIN__')}
						</a>

						<a
							href={'#'}
							style={{ color: 'red', float: 'right' }}
							onClick={() => setIsOpenResetConfirm(true)}
						>
							{__('Reset defaults', '__KADENCE__TEXT__DOMAIN__')}
						</a>
					</>
				)}
			</KadencePanelBody>

			<ConfirmDialog
				isOpen={isOpenResetConfirm}
				onConfirm={() => reset()}
				onCancel={() => setIsOpenResetConfirm(false)}
			>
				{__("Are you sure you'd like to reset this blocks default attributes?", '__KADENCE__TEXT__DOMAIN__')}
			</ConfirmDialog>

			<ConfirmDialog
				isOpen={isOpenSaveConfirm}
				onConfirm={() => saveAll()}
				onCancel={() => setIsOpenSaveConfirm(false)}
			>
				{__("Are you sure you'd like to save this as the blocks default attributes?", '__KADENCE__TEXT__DOMAIN__')}
			</ConfirmDialog>

			{isOpenModify ? (
				<Modal
					className="kt-block-defaults-modal"
					title={__('Modify Block Defaults', '__KADENCE__TEXT__DOMAIN__')}
					onRequestClose={() => {
						setTmpDefaults(currentBlockDefaults);
						setIsOpenModify(false);
					}}
				>
					{Object.keys(tmpDefaults).map((key, i) => {
						return (
							<>
								<div key={i} style={{ marginBottom: '10px' }}>
									<Button onClick={() => setTmpDefaults(omit(tmpDefaults, key))}>
										<span className="dashicons dashicons-trash"></span>
									</Button>
									<span style={{ verticalAlign: 'super' }}>{key}</span>
								</div>
							</>
						);
					})}

					<div className="kb-modal-footer">
						<Button
							className="kt-defaults-save"
							isDestructive
							disabled={false}
							onClick={() => {
								setTmpDefaults(currentBlockDefaults);
								setIsOpenModify(false);
							}}
						>
							{__('Cancel', '__KADENCE__TEXT__DOMAIN__')}
						</Button>

						<Button
							className="kt-defaults-save"
							isPrimary
							onClick={() => {
								saveModified();
								setIsOpenModify(false);
							}}
						>
							{__('Save', '__KADENCE__TEXT__DOMAIN__')}
						</Button>
					</div>
				</Modal>
			) : null}
		</>
	);
}
