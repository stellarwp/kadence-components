#!/usr/bin/env node
'use strict';

const { spawnSync } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const readline = require( 'readline' );
const { rootDir, getBaseDir, getPackages, toAbsolutePath, storeBaseDirHint } = require( './kadence-packages' );

( async () => {
	try {
		await main();
	} catch ( error ) {
		console.error( error.message || error );
		process.exit( 1 );
	}
} )();

async function main() {
	const options = parseArgs( process.argv.slice( 2 ) );
	let baseDir = options.root ? toAbsolutePath( options.root ) : getBaseDir();
	let packages = getPackages( baseDir );
	let existingPackages = getExistingPackages( packages );
	const npmEnv = {
		npm_config_legacy_peer_deps: 'true',
	};

	if ( ! existingPackages.length ) {
		if ( options.root ) {
			throw new Error( `No Kadence packages found under ${ baseDir }.` );
		}

		const updatedDir = await maybePromptForBaseDir( baseDir );
		if ( updatedDir ) {
			baseDir = updatedDir;
			packages = getPackages( baseDir );
			existingPackages = getExistingPackages( packages );
		}
	}

	if ( ! existingPackages.length ) {
		console.warn(
			`No Kadence packages were linked. Clone them under ${ baseDir } or set --root / KADENCE_PACKAGES_ROOT before running this command.`
		);
		return;
	}

	storeBaseDirHint( baseDir );

	const linked = [];

	packages.forEach( ( pkg ) => {
		const manifestPath = path.join( pkg.dir, 'package.json' );

		if ( ! fs.existsSync( manifestPath ) ) {
			console.warn( `[skip] ${ pkg.name } not found at ${ pkg.dir }` );
			return;
		}

		if ( shouldInstallDependencies( pkg.dir, options ) ) {
			console.log( `Installing dependencies for ${ pkg.name }` );
			run( 'npm', [ 'install' ], pkg.dir, { env: npmEnv } );
		}

		console.log( `Linking ${ pkg.name } from ${ pkg.dir }` );
		run( 'npm', [ 'link' ], pkg.dir, { env: npmEnv } );
		run( 'npm', [ 'link', pkg.name ], rootDir, { env: npmEnv } );
		linked.push( pkg.name );
	} );

	if ( ! linked.length ) {
		console.warn(
			`No Kadence packages were linked. Clone them under ${ baseDir } or set --root / KADENCE_PACKAGES_ROOT before running this command.`
		);
	} else {
		console.log( `Linked packages: ${ linked.join( ', ' ) }` );
	}
}

function run( cmd, args, cwd, { env, allowFailure = false } = {} ) {
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

function parseArgs( args ) {
	const options = {
		root: null,
		forceInstall: false,
		skipInstall: false,
	};

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
			options.root = value;
			i++;
			continue;
		}

		if ( arg.startsWith( '--root=' ) ) {
			options.root = arg.split( '=' ).slice( 1 ).join( '=' );
			continue;
		}
		if ( arg.startsWith( '--kadence-packages-root=' ) ) {
			options.root = arg.split( '=' ).slice( 1 ).join( '=' );
			continue;
		}
		if ( arg.startsWith( '--kadence_packages_root=' ) ) {
			options.root = arg.split( '=' ).slice( 1 ).join( '=' );
			continue;
		}

		if ( arg === '--force-install' || arg === '--install' ) {
			options.forceInstall = true;
			continue;
		}

		if ( arg === '--skip-install' ) {
			options.skipInstall = true;
			continue;
		}
	}

	return options;
}

function getExistingPackages( packages ) {
	return packages.filter( ( pkg ) => fs.existsSync( path.join( pkg.dir, 'package.json' ) ) );
}

async function maybePromptForBaseDir( currentDir ) {
	if ( ! process.stdin.isTTY || ! process.stdout.isTTY ) {
		return null;
	}

	console.log( `No Kadence packages found under ${ currentDir }.` );

	const answer = await prompt(
		'Enter the directory that contains the Kadence repos (press enter to keep the current location): '
	);
	const value = answer.trim();

	if ( ! value ) {
		return null;
	}

	return toAbsolutePath( value );
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

function shouldInstallDependencies( dir, options ) {
	if ( options.skipInstall ) {
		return false;
	}

	if ( options.forceInstall ) {
		return true;
	}

	const nodeModulesPath = path.join( dir, 'node_modules' );
	return ! fs.existsSync( nodeModulesPath );
}
