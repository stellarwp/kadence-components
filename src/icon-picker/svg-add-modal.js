import { __ } from '@wordpress/i18n';
import { useState, useCallback } from '@wordpress/element';
import { Button, Modal, TextareaControl, DropZone, FormFileUpload, TextControl, TabPanel } from '@wordpress/components';
import { has, get, debounce } from 'lodash';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import SvgSearchModal from './svg-search-modal';
import { compareVersions } from '@kadence/helpers';

export default function SvgAddModal( { isOpen, setIsOpen, callback, proVersion } ) {
	const [ uploadView, setUploadView ] = useState( 'upload' );
	const [ pastedSVG, setPastedSVG ] = useState( '' );
	const [ error, setError ] = useState( '' );
	const [ file, setFile ] = useState( null );
	const [ title, setTitle ] = useState( '' );
	const { createSuccessNotice } = useDispatch( noticesStore );
	const supportsSearchTab = compareVersions(proVersion, '2.7.0') >= 0;

	function parseAndUpload() {
		const fileread = new FileReader();
		const source = file !== null ? 'upload' : 'paste';

		let fileBlob;
		if ( source === 'upload' ) {
			if ( !file || file.length === 0 ) {
				setError( __( 'No file selected', '__KADENCE__TEXT__DOMAIN__' ) );
				return;
			}
			fileBlob = file[ 0 ];

			// Check MIME type
			if ( fileBlob.type !== 'image/svg+xml' ) {
				setError( __( 'The selected file is not an SVG', '__KADENCE__TEXT__DOMAIN__' ) );
				return;
			}
		} else {
			if ( !pastedSVG.trim() ) {
				setError( __( 'No SVG content pasted', '__KADENCE__TEXT__DOMAIN__' ) );
				return;
			}
			fileBlob = new Blob( [ pastedSVG ], { type: 'image/svg+xml' } );
		}

		fileread.onload = function( e ) {
			const fileContent = e.target.result;

			if ( fileContent !== '' ) {
				apiFetch( {
					path  : '/kb-custom-svg/v1/manage',
					data  : { file: fileContent, title: title },
					method: 'POST',
				} ).then( ( response ) => {
					if ( has( response, 'value' ) && has( response, 'label' ) ) {
						createSuccessNotice( __( 'SVG Saved.', '__KADENCE__TEXT__DOMAIN__' ), {
							type: 'snackbar',
						} );
						callback( response.value );
						setIsOpen( false );
					} else if ( has( response, 'error' ) && has( response, 'message' ) ) {
						setError( response.message );
					} else {
						setError( __( 'An error occurred when uploading your file', '__KADENCE__TEXT__DOMAIN__' ) );
					}
				} );
			}
		};

		fileread.readAsText( fileBlob );
	}

	return (
		<>
			{isOpen && (
				<Modal
					title={__( 'Add a Custom Icon ', '__KADENCE__TEXT__DOMAIN__' )}
					className={'upload-svg-modal'}
					size={'medium'}
					onRequestClose={() => setIsOpen( false )}
				>
					<TabPanel
						className="kb-icon-block__add-icon-modal-tabs"
						activeClass="active-tab"
						tabs={ [
							{
								name: 'upload',
								title: 'Upload',
								className: 'tab-one',
							},
							// Conditionally render the "Search" tab if supported
							...(supportsSearchTab
								? [
									{
										name: 'search',
										title: 'Search',
										className: 'tab-two',
									},
								]
								: []),
						] }
					>
						{ ( tab ) => (
							<div className={'modal-body'}>
								{ tab.name === 'upload' && (
									<>
										<div className={'security-notice'}>
											<h4>{__( 'Important: SVG Safety', '__KADENCE__TEXT__DOMAIN__' )}</h4>
											<p>
												{__(
													'SVGs can contain malicious code. For your security, we suggest sanitizing your files before uploading.',
													'__KADENCE__TEXT__DOMAIN__',
												)}
												&nbsp;
												<a href={'https://www.kadencewp.com/help-center/?post_type=docs&p=8510'}>
													{__( 'Learn more about SVG security and supported SVG formatting.', '__KADENCE__TEXT__DOMAIN__' )}
												</a>
											</p>
										</div>

										{error !== '' && <div className={'error-message'}>{error}</div>}

										{uploadView === 'upload' && (
											<div className={'drag-drop-container'}>
												<TextControl
													placeholder={__( 'Title your SVG', '__KADENCE__TEXT__DOMAIN__' )}
													value={title}
													onChange={( value ) => setTitle( value )}
												/>
												<FormFileUpload
													accept="image/svg+xml"
													onChange={( event ) => {
														setFile( event.currentTarget.files );
														if ( title === '' ) {
															setTitle(
																get( event.currentTarget.files, [ '0', 'name' ], '' ).replace(
																	'.svg',
																	'',
																),
															);
														}
													}}
													render={( { openFileDialog } ) => (
														<div
															onClick={openFileDialog}
															className={'drag-drop-target'}
															style={{ position: 'relative' }}
														>
															<DropZone
																label={__( 'Upload SVG', '__KADENCE__TEXT__DOMAIN__' )}
																onFilesDrop={( file ) => {
																	setFile( file );
																	if ( title === '' ) {
																		setTitle(
																			get( file, [ '0', 'name' ], '' ).replace( '.svg', '' ),
																		);
																	}
																}}
															/>
															{file === null || file.length === 0 ? (
																<>
																	<h3>{__( 'Select a file or drop it here', '__KADENCE__TEXT__DOMAIN__' )}</h3>
																	<p>{__( 'SVG dimensions: 24px by 24px', '__KADENCE__TEXT__DOMAIN__' )}</p>
																</>
															) : (
																<>
																	<h3>{__( 'File Selected', '__KADENCE__TEXT__DOMAIN__' )}</h3>
																	<p>{get( file, [ '0', 'name' ], '' )}</p>
																</>
															)}

															<Button isPrimary={true}>
																{file === null
																	? __( 'Select a file', '__KADENCE__TEXT__DOMAIN__' )
																	: __( 'Change file', '__KADENCE__TEXT__DOMAIN__' )}
															</Button>
														</div>
													)}
												/>

												<Button
													type={'link'}
													onClick={() => {
														setUploadView( 'paste' );
														setFile( null );
													}}
												>
													{__( 'Paste an SVG', '__KADENCE__TEXT__DOMAIN__' )}
												</Button>
											</div>
										)}

										{uploadView === 'paste' && (
											<div className={'paste-container'}>
												<h3>{__( 'Paste your SVG', '__KADENCE__TEXT__DOMAIN__' )}</h3>
												<TextControl
													placeholder={__( 'Title your SVG', '__KADENCE__TEXT__DOMAIN__' )}
													value={title}
													onChange={( value ) => setTitle( value )}
												/>
												<TextareaControl value={pastedSVG} onChange={( value ) => setPastedSVG( value )}/>

												<Button
													type={'link'}
													onClick={() => {
														setUploadView( 'upload' );
														setPastedSVG( '' );
													}}
												>
													{__( 'Upload an SVG', '__KADENCE__TEXT__DOMAIN__' )}
												</Button>
											</div>
										)}
										<div className={'footer'}>
											<Button isSecondary={true} onClick={() => setIsOpen( false )}>
												{__( 'Cancel', '__KADENCE__TEXT__DOMAIN__' )}
											</Button>

											<Button
												isPrimary={true}
												onClick={() => {
													parseAndUpload();
												}}
											>
												{__( 'Add', '__KADENCE__TEXT__DOMAIN__' )}
											</Button>
										</div>

									</>
								)}
								{ tab.name === 'search' && supportsSearchTab && (
									<SvgSearchModal isOpen={isOpen} setIsOpen={setIsOpen} callback={callback}></SvgSearchModal>
								)}
							</div>
						)}
					</TabPanel>
				</Modal>
			)}
		</>
	);
}
