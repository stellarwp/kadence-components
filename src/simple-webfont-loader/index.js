/* global frames */
import { Component } from '@wordpress/element';
import PropTypes from 'prop-types';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { fontRequests } from './font-request';

const statuses = {
	inactive: 'inactive',
	active: 'active',
	loading: 'loading',
};

const noop = () => {};

/**
 * Loads exactly the fonts its props name, into the editor canvas, and nothing else.
 *
 * Takes a block's `typography` attribute directly, which is what every caller of the
 * `KadenceWebfontLoader` export passes — it previously read only `config`, so those callers loaded
 * nothing at all and their blocks rendered in a fallback face. `config` still works for the callers
 * that use it.
 *
 * Callers mount this in their block output rather than behind a selection check, so every instance
 * on the page loads its own font on first paint instead of only once someone clicks into it.
 */
class SimpleWebfontLoader extends Component {
	constructor() {
		super(...arguments);
		this.state = { status: undefined };
		// Mounted-ness and the set of already-appended stylesheets are instance fields, not state.
		// `componentDidMount` sets the flag and loads in the same synchronous pass, so a `setState`
		// here would still read false when `loadFonts()` checked it — which is why this loaded
		// nothing on mount even once its props were read correctly. `linkElements` doubles as the
		// dedupe index for the same reason: it updates when the link is appended, whereas a state
		// Set updated in `onload` would let a second pass append the same stylesheet again.
		this.mounted = false;
		this.linkElements = new Map();
	}

	loadFonts() {
		if (!this.mounted) {
			return;
		}

		fontRequests(this.props).forEach(({ key, url }) => {
			if (this.linkElements.has(key)) {
				return;
			}

			this.setState({ status: statuses.loading });

			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = url;

			link.onload = () => this.setState({ status: statuses.active });
			link.onerror = () => this.setState({ status: statuses.inactive });

			// The canvas is its own document once the editor is iframed, and a stylesheet appended to
			// the outer one styles nothing the user can see.
			const context = frames['editor-canvas']?.document || document;
			context.head.appendChild(link);

			this.linkElements.set(key, link);
		});
	}

	/**
	 * Drop every appended stylesheet, so the next load pass re-requests what the props now name.
	 *
	 * @return {void}
	 */
	unloadFonts() {
		this.linkElements.forEach((link) => link?.parentNode?.removeChild(link));
		this.linkElements.clear();
	}

	componentDidMount() {
		this.mounted = true;
		this.setState({ device: this.props.getPreviewDevice });
		this.loadFonts();
	}

	componentDidUpdate(prevProps, prevState) {
		const { onStatus, config, typography, getPreviewDevice } = this.props;

		if (prevState.status !== this.state.status) {
			onStatus(this.state.status);
		}

		if (this.state.device !== getPreviewDevice) {
			// The canvas is re-framed per device, so the stylesheets land in a document that is no
			// longer on screen — re-append them into the new one.
			this.unloadFonts();
			this.setState({ device: getPreviewDevice });
			this.loadFonts();
		} else if (prevProps.config !== config || prevProps.typography !== typography) {
			this.loadFonts();
		}
	}

	componentWillUnmount() {
		this.mounted = false;
		this.unloadFonts();
	}

	render() {
		const { children } = this.props;
		return children || null;
	}
}

SimpleWebfontLoader.propTypes = {
	// Either shape loads a font; see `font-request.js`. Neither is required on its own, and `config`
	// was declared required while every `typography` caller omitted it — a warning on the correct
	// usage and none on the broken one.
	typography: PropTypes.array,
	config: PropTypes.object,
	children: PropTypes.element,
	onStatus: PropTypes.func.isRequired,
};

SimpleWebfontLoader.defaultProps = {
	onStatus: noop,
};

export default compose([
	withSelect((select) => {
		return {
			getPreviewDevice: select('kadenceblocks/data').getPreviewDeviceType(),
		};
	}),
])(SimpleWebfontLoader);
