#!/usr/bin/env node
'use strict';

const { spawnSync } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const { rootDir, getBaseDir, getPackages, toAbsolutePath, clearBaseDirHint } = require( './kadence-packages' );

const cliRoot = parseRootArg( process.argv.slice( 2 ) );
const baseDir = cliRoot ? toAbsolutePath( cliRoot ) : getBaseDir();
const packages = getPackages( baseDir );

packages.forEach( ( pkg ) => {
	console.log( `Unlinking ${ pkg.name } from the plugin` );
	run( 'npm', [ 'unlink', pkg.name ], rootDir, { allowFailure: true } );

	const manifestPath = path.join( pkg.dir, 'package.json' );
	if ( ! fs.existsSync( manifestPath ) ) {
		console.warn( `[skip] ${ pkg.name } source not found at ${ pkg.dir }` );
		return;
	}

	console.log( `Removing global npm link for ${ pkg.name }` );
	run( 'npm', [ 'unlink' ], pkg.dir, { allowFailure: true } );
} );

console.log(
	`Finished unlinking Kadence packages. Run "npm install" to reinstall the registry versions if you need to switch back.`
);

clearBaseDirHint();

function run( cmd, args, cwd, { allowFailure = false, env } = {} ) {
	const mergedEnv = env ? { ...process.env, ...env } : process.env;
	const result = spawnSync( cmd, args, {
		cwd,
		stdio: 'inherit',
		shell: process.platform === 'win32',
		env: mergedEnv,
	} );

	if ( result.status !== 0 && ! allowFailure ) {
		process.exit( result.status );
	}
}

function parseRootArg( args ) {
	for ( let i = 0; i < args.length; i++ ) {
		const arg = args[ i ];
		if (
			arg === '--root' ||
			arg === '--kadence-packages-root' ||
			arg === '--kadence_packages_root' ||
			arg === '-r'
		) {
			const value = args[ i + 1 ];
			if ( ! value ) {
				throw new Error( `${ arg } requires a value` );
			}
			return value;
		}

		if ( arg.startsWith( '--root=' ) ) {
			return arg.split( '=' ).slice( 1 ).join( '=' );
		}
		if ( arg.startsWith( '--kadence-packages-root=' ) ) {
			return arg.split( '=' ).slice( 1 ).join( '=' );
		}
		if ( arg.startsWith( '--kadence_packages_root=' ) ) {
			return arg.split( '=' ).slice( 1 ).join( '=' );
		}
	}

	return null;
}
