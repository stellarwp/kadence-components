module.exports = function ( api ) {
	const env = api.env();
	const isEsm = env === 'esm';

	return {
		presets: [
			[
				'@wordpress/babel-preset-default',
				{
					modules: isEsm ? false : 'commonjs',
					useESModules: isEsm,
				},
			],
		],
	};
};
