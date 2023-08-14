import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { dateI18n, __experimentalGetSettings } from '@wordpress/date';

import './editor.scss';

import {
	KadenceSelectTerms,
} from '@kadence/components';

import {
	Button,
	Modal,
	Flex,
	FlexItem,
	FlexBlock,
	Spinner,
	TextControl,
	Dashicon
} from '@wordpress/components';

function SelectPostsModal( props ) {
	const {
		postSelectEndpoint,
		selectedPosts,
		onSelect,
		postType = '',
		modalTitle = __( 'Select posts', 'kadence-blocks-pro' ),
		buttonLabel = __( 'Select posts', 'kadence-blocks-pro' ),
		categoryRestBase = 'wp/v2/categories'
	} = props;

	const [ isOpen, setIsOpen ] = useState( false );
	const [ currentView, setCurrentView ] = useState( 'browse' );

	const [ isLoading, setIsLoading ] = useState( false );
	const [ isLoadingMeta, setIsLoadingMeta ] = useState( false );
	const [ tmpSelectedPosts, setTmpSelectedPosts ] = useState( selectedPosts );

	const [ page, setPage ] = useState( 1 );
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ filterCategories, setFilterCategories ] = useState( [] );
	const [ filterTags, setFilterTags ] = useState( [] );

	const [ fetchedPosts, setFetchedPosts ] = useState( [] );
	const [ selectedMeda, setSelectedMeta ] = useState( [] );
	const [ hasMorePages, setHasMorePages ] = useState( false );
	const [ showFilters, setShowFilters ] = useState( true );

	const dateFormat = __experimentalGetSettings().formats.date;

	const fetchPosts = ( resetPage ) => {
		if ( isLoading ) {
			return;
		}

		if ( resetPage ) {
			setPage( 1 );
			setShowFilters( false );
		}

		setIsLoading( true );

		const query = {
			page,
			per_page: 26,
		};

		if ( filterCategories.length !== 0 ) {
			query.categories = filterCategories.map( o => o.value );
		}

		if ( filterTags.length !== 0 ) {
			query.tags = filterTags.map( o => o.value );
		}

		if ( searchTerm !== '' ) {
			query.search = searchTerm;
		}

		if( postType !== '' ) {
			query.type = Array.isArray( postType ) ? postType : [ postType ];
		}

		return apiFetch( {
			path  : addQueryArgs( postSelectEndpoint, query ),
			method: 'GET',
			parse : true,
		} ).then( ( response ) => {

			if ( response.length === 26 ) {
				setFetchedPosts( response.slice( 0, -1 ) );
				setHasMorePages( true );
			} else {
				setFetchedPosts( response );
				setHasMorePages( false );
			}

			setIsLoading( false );
		} );

	};

	const fetchSelected = () => {
		if ( isLoadingMeta ) {
			return;
		}

		if ( tmpSelectedPosts.length === 0 ) {
			setSelectedMeta( [] );
			return;
		}

		setIsLoadingMeta( true );

		apiFetch( {
			path  : addQueryArgs( postSelectEndpoint, {
				include : tmpSelectedPosts,
				per_page: tmpSelectedPosts.length,
				context : 'view',
			} ),
			method: 'GET',
		} ).then( ( response ) => {
			setSelectedMeta( response );
			setIsLoadingMeta( false );
		} );

	};

	useEffect( () => {
		fetchPosts( false );
	}, [ page, postType ] );

	useEffect( () => {
		fetchSelected();
	}, [ currentView ] );

	const updateSelected = ( id ) => {
		if ( tmpSelectedPosts.includes( id ) ) {
			const index = tmpSelectedPosts.indexOf( id );
			if ( index > -1 ) {
				tmpSelectedPosts.splice( index, 1 );
				setTmpSelectedPosts( [ ...tmpSelectedPosts ] );
			}
		} else {
			setTmpSelectedPosts( [ ...tmpSelectedPosts, id ] );
		}

		const metaIndex = selectedMeda.findIndex( p => p.id === id );
		if ( metaIndex >= 0 ) {
			const newArray = [ ...selectedMeda ];
			newArray.splice( metaIndex, 1 );

			setSelectedMeta( newArray );
		}
	};

	const moveDown = ( currentIndex, id ) => {
		const newTmpSelected = [ ...tmpSelectedPosts ];
		const temp = newTmpSelected[ currentIndex + 1 ];
		newTmpSelected[ currentIndex + 1 ] = newTmpSelected[ currentIndex ];
		newTmpSelected[ currentIndex ] = temp;
		setTmpSelectedPosts( newTmpSelected );

		const newMetaArray = [ ...selectedMeda ];
		const temp2 = newMetaArray[ currentIndex + 1 ];
		newMetaArray[ currentIndex + 1 ] = newMetaArray[ currentIndex ];
		newMetaArray[ currentIndex ] = temp2;
		setSelectedMeta( newMetaArray );
	}

	const moveUp = ( currentIndex, id ) => {
		const newTmpSelected = [ ...tmpSelectedPosts ];
		const temp = newTmpSelected[ currentIndex - 1 ];
		newTmpSelected[ currentIndex - 1 ] = newTmpSelected[ currentIndex ];
		newTmpSelected[ currentIndex ] = temp;
		setTmpSelectedPosts( newTmpSelected );

		const newMetaArray = [ ...selectedMeda ];
		const temp2 = newMetaArray[ currentIndex - 1 ];
		newMetaArray[ currentIndex - 1 ] = newMetaArray[ currentIndex ];
		newMetaArray[ currentIndex ] = temp2;
		setSelectedMeta( newMetaArray );
	}

	const renderPostRow = ( post, view, currentIndex = 0, totalItems = 0 ) => {
		const canMoveUp = currentIndex > 0;
		const canMoveDown = currentIndex < totalItems - 1;

		return (
			<tr key={post.id} className={tmpSelectedPosts.includes( post.id ) ? 'is-selected' : ''}>
				<td style={{ width: '5px' }}></td>
				<td onClick={ view !== 'selected' ? () => { updateSelected( post.id ); } : () => {} }>
					<h2>{post.title.raw}</h2>
					<strong>Type: </strong> {post.type} <strong>Published: </strong> {dateI18n( dateFormat, post.date_gmt )}
				</td>
				{ view === 'selected' &&
					<td>
						<Button onClick={() => { moveUp( currentIndex, post.id ); }}
								disabled={ ! canMoveUp }
								label={__( 'Move Up', 'kadence-blocks' )}
								showTooltip={true}>
							<Dashicon icon="arrow-up"/>
						</Button>
						<Button onClick={() => { moveDown( currentIndex, post.id ); }}
								label={__( 'Move Down', 'kadence-blocks' )}
								disabled={ ! canMoveDown }
								showTooltip={true}>
							<Dashicon icon="arrow-down"/>
						</Button>
						<Button onClick={() => { updateSelected( post.id ); }}
								label={__( 'Unselect', 'kadence-blocks' )}
								showTooltip={true}>
							<Dashicon icon="no"/>
						</Button>
					</td>
				}
			</tr>
		);
	};

	const renderPagination = () => {
		return (
			<div className={'pagination'}>

				{!showFilters &&
					<Button className={'mobile-toggle'} variant={'primary'} onClick={() => setShowFilters( true )}>{__( 'Show Filters', 'kadence-blocks-pro' )}</Button>
				}

				<Button variant={'secondary'} disabled={page === 1} onClick={() => setPage( ( page - 1 ) )}>
					{__( 'Previous', 'kadence-blocks-pro' )}
				</Button>

				Page {page}

				<Button variant={'secondary'} disabled={!hasMorePages} onClick={() => setPage( ( page + 1 ) )}>
					{__( 'Next', 'kadence-blocks-pro' )}
				</Button>
			</div>
		);
	};

	return (
		<>
			<Button
				isLarge={true}
				isSecondary={true}
				onClick={( e ) => setIsOpen( true )}
			>
				{buttonLabel}
			</Button>

			{isOpen && (
				<Modal
					className={'select-posts-modal'}
					isFullScreen={true}
					focusOnMount //focus on the first element in the modal
					shouldCloseOnEsc
					title={modalTitle}
					onRequestClose={( e ) => {
						setIsOpen( false );
						setTmpSelectedPosts( selectedPosts );
					}}
				>

					<Fragment>
						{( currentView === 'browse' ) && (
							<Flex
								align="start"
								justify="space-between"
								style={{ height: '100%', gap: 0 }}
							>
								{window.innerWidth > 767 || ( showFilters && window.innerWidth < 767 ) ?
									<FlexItem className={'post-filters'}>
										<h4>{__( 'Filter Posts', 'kadence-blocks-pro' )}</h4>

										<TextControl
											label={__( 'Search', 'kadence-blocks-pro' )}
											value={searchTerm}
											onChange={( value ) => setSearchTerm( value )}
										/>

										<KadenceSelectTerms
											placeholder={__( 'Filter by Category', 'kadence-blocks' )}
											restBase={ categoryRestBase }
											fieldId={'tax-select-category'}
											value={filterCategories}
											onChange={( value ) => {
												setFilterCategories( ( value ? value : [] ) );
											}}
										/>

										<br/>

										<KadenceSelectTerms
											placeholder={__( 'Filter by Tag', 'kadence-blocks' )}
											restBase={'wp/v2/tags'}
											fieldId={'tax-select-tags'}
											value={filterTags}
											onChange={( value ) => {
												setFilterTags( ( value ? value : [] ) );
											}}
										/>

										<br/>
										<Button variant={'primary'} onClick={() => {
											fetchPosts();
											setShowFilters( false );
										}}>
											{__( 'Filter Posts', 'kadence-blocks-pro' )}
										</Button>

									</FlexItem> : null}

								{window.innerWidth > 767 || ( !showFilters && window.innerWidth < 767 ) ?
									<FlexBlock style={{ height: '100%', borderTop: '1px solid #ccc' }}>
										{isLoading && (
											<center><Spinner/></center>
										)}

										{!isLoading && fetchedPosts.length > 0 && (
											<>
												{renderPagination()}
												<table width={'100%'} cellspacing={'0'}>
													{fetchedPosts.map( ( post, index ) => (
														renderPostRow( post, currentView )
													) )}
												</table>
											</>
										)}

										{!isLoading && fetchedPosts.length === 0 && (
											<>
												<p>{__( 'No posts found matching filters', 'kadence-blocks-pro' )}</p>

												<Button className={'mobile-toggle'} variant={'primary'} onClick={() => setShowFilters( true )}>{__( 'Show Filters', 'kadence-blocks-pro' )}</Button>
											</>
										)}

									</FlexBlock> : null}
							</Flex>
						)}
						{( currentView === 'selected' ) && (
							<>
								{isLoadingMeta && (
									<center><Spinner/></center>
								)}

								{!isLoadingMeta && selectedMeda.length === 0 && (
									<p>{__( 'No posts have been selected', 'kadence-blocks-pro' )}</p>
								)}

								{!isLoadingMeta && selectedMeda.length > 0 && (
									<table width={'100%'} cellspacing={'0'}>
										{selectedMeda.map( ( post, index ) => (
											renderPostRow( post, currentView, index, selectedMeda.length )
										) )}
									</table>
								)}

							</>
						)}
					</Fragment>

					<div className={'modal-footer'}>
						<Button
							variant={'primary'}
							style={{ marginLeft: '20px' }}
							onClick={() => {
								onSelect( tmpSelectedPosts );
								setIsOpen( false );
							}}
						>{__( 'Select', 'kadence-blocks-pro' )}</Button>

						{currentView === 'browse' ?
							<Button variant={'secondary'} onClick={() => setCurrentView( 'selected' )}>{__( 'View Selected', 'kadence-blocks-pro' )}</Button>
							:
							<Button variant={'secondary'} onClick={() => setCurrentView( 'browse' )}>{__( 'Browse Posts', 'kadence-blocks-pro' )}</Button>
						}
					</div>

				</Modal>
			)}
		</>
	);
}

export default SelectPostsModal;
