/**
 * External Dependencies
 */
import debounce from 'lodash/debounce';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, withFilters, Popover, ExternalLink } from '@wordpress/components';
import { createRef, Fragment, Component } from '@wordpress/element';

/**
 * Internal Dependencies
 */
import { dynamicIcon } from '@kadence/icons';
/**
 * Build the Dynamic Link controls
 */
class DynamicExternalLinkControl extends Component {
	constructor() {
		super(...arguments);

		this.toggle = this.toggle.bind(this);
		this.state = {
			open: false,
		};
		this.popRef = createRef();
		this.debouncedToggle = debounce(this.toggle.bind(this), 100);
	}
	toggle() {
		this.setState({ open: !this.state.open });
	}
	render() {
		const { open } = this.state;
		return (
			<Fragment>
				<Button
					className="kb-dynamic-url-sidebar"
					icon={dynamicIcon}
					onClick={() => this.debouncedToggle()}
					isPressed={false}
					aria-haspopup="true"
					aria-expanded={open}
					label={__('Dynamic Link', '__KADENCE__TEXT__DOMAIN__')}
					showTooltip={true}
				/>
				{open && (
					<Popover
						className="kb-dynamic-popover"
						position="bottom left"
						onClick={() => {}}
						expandOnMobile={true}
						onClose={() => this.debouncedToggle()}
						ref={this.popRef}
					>
						<div className="kb-dynamic-popover-inner-wrap">
							<div className="kb-pro-notice">
								<h2>{__('Dynamic URL', '__KADENCE__TEXT__DOMAIN__')} </h2>
								<p>
									{__(
										'Create dynamic sites by populating urls from various sources.',
										'__KADENCE__TEXT__DOMAIN__'
									)}{' '}
								</p>
								<ExternalLink
									href={
										'https://www.kadencewp.com/kadence-blocks/pro/?utm_source=in-app&utm_medium=kadence-blocks&utm_campaign=dynamic-content'
									}
								>
									{__('Upgrade to Pro', '__KADENCE__TEXT__DOMAIN__')}
								</ExternalLink>
							</div>
						</div>
					</Popover>
				)}
			</Fragment>
		);
	}
}
export default withFilters('kadence.URLInputExternalDynamicControl')(DynamicExternalLinkControl);
