const fs = require( 'fs' );
const fsExtra = require( 'fs-extra' );
const path = require( 'path' );

const rootDir = path.resolve( __dirname, '..' );
const srcDir = path.join( rootDir, 'src' );
const distDir = path.join( rootDir, 'dist' );
const destinations = [ 'esm', 'cjs' ];

const isJavaScriptFile = ( filePath ) => {
	const ext = path.extname( filePath );
	return ext === '.js' || ext === '.jsx';
};

const copyAssets = ( targetDir ) => {
	fsExtra.copySync( srcDir, targetDir, {
		filter: ( src ) => {
			const stats = fs.statSync( src );
			if ( stats.isDirectory() ) {
				return true;
			}

			return ! isJavaScriptFile( src );
		},
	} );
};

if ( ! fs.existsSync( srcDir ) ) {
	throw new Error( `Source directory not found: ${ srcDir }` );
}

for ( const folder of destinations ) {
	const targetDir = path.join( distDir, folder );
	copyAssets( targetDir );
}
