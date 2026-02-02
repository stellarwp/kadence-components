'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

const rootDir = path.resolve( __dirname, '..' );
const rootHintPath = path.join( rootDir, '.kadence-packages-root' );

const manifests = [
	{ name: '@kadence/components', folder: 'kadence-components' },
	{ name: '@kadence/helpers', folder: 'kadence-helpers' },
	{ name: '@kadence/icons', folder: 'kadence-icons' },
];

const toAbsolutePath = ( input ) => {
	if ( ! input ) {
		return null;
	}

	return path.isAbsolute( input ) ? input : path.resolve( rootDir, input );
};

const getBaseDir = ( override ) => {
	if ( override ) {
		return toAbsolutePath( override );
	}

	if ( process.env.KADENCE_PACKAGES_ROOT ) {
		return toAbsolutePath( process.env.KADENCE_PACKAGES_ROOT );
	}

	const stored = readStoredBaseDir();
	if ( stored ) {
		return toAbsolutePath( stored );
	}

	return toAbsolutePath( 'packages' );
};

const getPackages = ( baseDir ) => {
	const resolvedBaseDir = baseDir ? toAbsolutePath( baseDir ) : getBaseDir();

	return manifests.map( ( pkg ) => ( {
		...pkg,
		dir: path.join( resolvedBaseDir, pkg.folder ),
	} ) );
};

module.exports = {
	rootDir,
	getBaseDir,
	getPackages,
	toAbsolutePath,
	readStoredBaseDir,
	storeBaseDirHint,
	clearBaseDirHint,
};

function readStoredBaseDir() {
	try {
		if ( ! fs.existsSync( rootHintPath ) ) {
			return null;
		}

		const value = fs.readFileSync( rootHintPath, 'utf8' ).trim();
		return value || null;
	} catch ( error ) {
		return null;
	}
}

function storeBaseDirHint( dir ) {
	if ( ! dir ) {
		return;
	}

	const absolute = toAbsolutePath( dir );

	try {
		fs.writeFileSync( rootHintPath, absolute, 'utf8' );
	} catch ( error ) {
		// ignore write errors; linking will still work
	}
}

function clearBaseDirHint() {
	try {
		if ( fs.existsSync( rootHintPath ) ) {
			fs.unlinkSync( rootHintPath );
		}
	} catch ( error ) {
		// ignore removal errors
	}
}
