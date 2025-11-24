/**
 * Db Entry Controls
 *
 */

/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import KadencePanelBody from '../../../panel-body';

/**
 * Build the Measure controls
 * @returns {object} Measure settings.
 */
function DbEntryOptions({ settings, save }) {
	return (
		<KadencePanelBody
			title={__('Database Entry Settings', 'kadence-blocks')}
			initialOpen={false}
			panelName={'kb-db-entry-settings'}
		>
			<ToggleControl
				label={__('Save User IP Address', 'kadence-blocks')}
				help={__('Saves the entrants IP address with the form data', 'kadence-blocks')}
				checked={undefined !== settings?.userIP ? settings.userIP : true}
				onChange={(value) => save({ userIP: value })}
			/>
			<ToggleControl
				label={__('Save User Device', 'kadence-blocks')}
				help={__('Saves the entrants device with form data', 'kadence-blocks')}
				checked={undefined !== settings?.userDevice ? settings.userDevice : true}
				onChange={(value) => save({ userDevice: value })}
			/>
		</KadencePanelBody>
	);
}

export default DbEntryOptions;
