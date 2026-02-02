/**
 * Webpack plugin to swap a placeholder text domain in compiled assets.
 */
class ReplaceTextDomainPlugin {
	constructor( { placeholder, value, test } = {} ) {
		this.placeholder = placeholder;
		this.value = value;
		this.test = test || /\.js$/;
		this.pluginName = 'ReplaceTextDomainPlugin';
	}

	apply( compiler ) {
		const { Compilation, sources } = compiler.webpack;

		compiler.hooks.thisCompilation.tap( this.pluginName, ( compilation ) => {
			compilation.hooks.processAssets.tap(
				{
					name: this.pluginName,
					stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
				},
				( assets ) => {
					if ( ! this.placeholder || ! this.value ) {
						return;
					}

					Object.keys( assets ).forEach( ( assetName ) => {
						if ( this.test && ! this.test.test( assetName ) ) {
							return;
						}

						const asset = compilation.getAsset( assetName );

						if ( ! asset ) {
							return;
						}

						const originalSource =
							typeof asset.source.source === 'function' ? asset.source.source() : asset.source.toString();

						if ( ! originalSource.includes( this.placeholder ) ) {
							return;
						}

						const updatedSource = originalSource.split( this.placeholder ).join( this.value );

						if ( updatedSource === originalSource ) {
							return;
						}

						compilation.updateAsset( assetName, new sources.RawSource( updatedSource ) );
					} );
				}
			);
		} );
	}
}

module.exports = ReplaceTextDomainPlugin;
