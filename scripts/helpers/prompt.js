'use strict';

const readline = require( 'readline' );

function isInteractive() {
	return process.stdin.isTTY && process.stdout.isTTY;
}

function prompt( question ) {
	return new Promise( ( resolve ) => {
		const rl = readline.createInterface( {
			input: process.stdin,
			output: process.stdout,
		} );

		rl.question( question, ( answer ) => {
			rl.close();
			resolve( answer );
		} );
	} );
}

module.exports = {
	isInteractive,
	prompt,
};
