#!/usr/bin/env node
'use strict';

const { spawnSync } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const { rootDir, getBaseDir, getPackages, toAbsolutePath, clearBaseDirHint } = require( '../helpers/kadence-packages' );
const { isInteractive, prompt } = require( '../helpers/prompt' );

const cliRoot = parseRootArg( process.argv.slice( 2 ) );
const baseDir = cliRoot ? toAbsolutePath( cliRoot ) : getBaseDir();
const packageJsonPath = path.join( rootDir, 'package.json' );
const packageJsonBackupPath = path.join( rootDir, '.package.json.unlink-backup' );

backupPackageJson();
unlinkAllPackagesAndPeers(() => {
	restorePackageJson();

	console.log(
		`Finished unlinking Kadence packages.`
	);

	if ( ! isInteractive() ) {
		console.log( 'Run "npm install" to reinstall the registry versions if you need to switch back.' );
		clearBaseDirHint();
		return;
	}

	prompt( 'Do you want to run "npm install" now to restore original packages? (y/N): ' ).then( ( answer ) => {
		if ( answer.trim().toLowerCase() === 'y' ) {
			run( 'npm', [ 'install' ], rootDir );
			console.log( 'npm install completed.' );
		} else {
			console.log( 'You can run "npm install" manually to restore the original packages.' );
		}
		clearBaseDirHint();
	} );
});


function unlinkAllPackagesAndPeers(callback) {
	const packages = getPackages(baseDir);
	const packageNames = packages.map((pkg) => pkg.name);
	const existingPackages = packages.filter((pkg) => fs.existsSync(path.join(pkg.dir, 'package.json')));
	const existingPackageNames = existingPackages.map((pkg) => pkg.name);

	// Unlink main packages from project root
	if (packageNames.length) {
		run('npm', ['unlink', ...packageNames], rootDir, { allowFailure: true });
	}

	// Unlink global links
	if (existingPackageNames.length) {
		console.log(`Removing global npm links for ${existingPackageNames.length} packages`);
		run('npm', ['unlink', '-g', ...existingPackageNames], rootDir, { allowFailure: true });
	} else if (packageNames.length) {
		packageNames.forEach((pkgName) => {
			console.warn(`[skip] ${pkgName} source not found under ${baseDir}`);
		});
	}

	// Unlink peer dependencies from each package
	existingPackages.forEach((pkg) => {
		const manifestPath = path.join(pkg.dir, 'package.json');
		let manifest;
		try {
			manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
		} catch (error) {
			console.warn(`[skip] Could not read package.json for ${pkg.name} at ${pkg.dir}`);
			return;
		}
		const peerDeps = manifest.peerDependencies || {};
		const localPeerDeps = Object.keys(peerDeps).filter(
			(dep) => packageNames.includes(dep) && dep !== pkg.name
		);
		if (localPeerDeps.length) {
			console.log(`Unlinking local Kadence peers from ${pkg.name}: ${localPeerDeps.join(', ')}`);
			run('npm', ['unlink', ...localPeerDeps], pkg.dir, { allowFailure: true });
		}
	});

	if (typeof callback === 'function') {
		callback();
	}
}

function backupPackageJson() {
	if ( ! fs.existsSync( packageJsonPath ) ) {
		return;
	}

	try {
		fs.copyFileSync( packageJsonPath, packageJsonBackupPath );
	} catch ( error ) {
		console.warn( `[warn] Unable to back up package.json: ${ error.message }` );
	}
}

function restorePackageJson() {
	if ( ! fs.existsSync( packageJsonBackupPath ) ) {
		return;
	}

	try {
		fs.copyFileSync( packageJsonBackupPath, packageJsonPath );
		fs.unlinkSync( packageJsonBackupPath );
	} catch ( error ) {
		console.warn( `[warn] Unable to restore package.json: ${ error.message }` );
	}
}

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
