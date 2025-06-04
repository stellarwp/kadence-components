/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment, Component } from '@wordpress/element';
import { BaseControl, Button, ExternalLink } from '@wordpress/components';
import { safeDecodeURI, filterURLForDisplay } from '@wordpress/url';
import { keyboardReturn, cancelCircleFilled, edit } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';
import { getBlocksParams, getBlocksParam } from '@kadence/helpers';

/**
 * Internal dependencies
 */
import DynamicExternalLinkControl from '../dynamic-external-link-control';

/**
 * Build the typography controls
 * @returns {object} typography settings.
 */
class URLExtenalInputControl extends Component {
	constructor() {
		super(...arguments);
		this.state = {
			isEditing: false,
			urlInput: null,
		};
	}
	render() {
		const { label, onChange, value, allowClear = true, dynamicAttribute = '' } = this.props;
		const { isEditing, urlInput } = this.state;

		const onSubmitLinkChange = (url) => {
			onChange(url);
		};
		const onEditLinkChange = (event) => {
			this.setState({ urlInput: event.target.value });
		};
		const linkEditorValue = urlInput !== null ? urlInput : value;
		return (
			<div
				className={`components-base-control kb-side-link-external kb-side-link-control${
					dynamicAttribute && getBlocksParam('dynamic_enabled') ? ' has-dynamic-support' : ''
				}`}
			>
				{label && <label className="components-base-control__label">{label}</label>}
				<div className="kb-side-link-control-inner-row">
					{value && !isEditing && (
						<div className={'kb-search-selection-name'}>
							{applyFilters(
								'kadence.linkDisplay',
								<Fragment>
									<div
										className={
											'block-editor-url-popover__link-viewer block-editor-format-toolbar__link-container-content'
										}
									>
										{!value ? (
											<span></span>
										) : (
											<ExternalLink href={value}>
												{filterURLForDisplay(safeDecodeURI(value))}
											</ExternalLink>
										)}
										<Button
											icon={edit}
											label={__('Edit', 'kadence-blocks-pro')}
											onClick={() => {
												this.setState({ isEditing: true });
											}}
										/>
									</div>
								</Fragment>,
								this.props.attributes,
								dynamicAttribute,
								undefined,
								this.props.context
							)}
						</div>
					)}
					{(!value || isEditing) && (
						<BaseControl className={'kb-search-selection-name'}>
							<div className="kb-search-url-input">
								<input
									value={linkEditorValue}
									className={`kb-external-link-input${
										allowClear && value ? ' link-input-has-clear' : ''
									}`}
									type={'text'}
									placeholder={__('Paste or type URL', 'kadence-blocks-pro')}
									onChange={(event) => onEditLinkChange(event)}
								/>
							</div>
							{allowClear && value && (
								<Button
									className="kb-search-url-clear"
									icon={cancelCircleFilled}
									label={__('Clear', 'kadence-blocks-pro')}
									onClick={() => {
										onSubmitLinkChange('');
										this.setState({
											isEditing: false,
										});
									}}
								/>
							)}
							<Button
								className="kb-search-url-submit"
								icon={keyboardReturn}
								label={__('Submit', 'kadence-blocks-pro')}
								onClick={() => {
									onSubmitLinkChange(linkEditorValue);
									this.setState({
										isEditing: false,
										urlInput: null,
									});
								}}
							/>
						</BaseControl>
					)}
					{dynamicAttribute && dynamicEnabled && <DynamicExternalLinkControl {...this.props} />}
				</div>
			</div>
		);
	}
}
export default URLExtenalInputControl;
