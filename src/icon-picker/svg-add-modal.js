import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { Button, Modal, TextareaControl, DropZone, FormFileUpload, TextControl } from '@wordpress/components';
import { has, get } from 'lodash';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

export default function SvgAddModal({ isOpen, setIsOpen, callback }) {
	const [uploadView, setUploadView] = useState('upload');
	const [pastedSVG, setPastedSVG] = useState('');
	const [error, setError] = useState('');
	const [file, setFile] = useState(null);
	const [title, setTitle] = useState('');
	const { createSuccessNotice } = useDispatch(noticesStore);

	function parseAndUpload() {
		const fileread = new FileReader();
		const source = file !== null ? 'upload' : 'paste';

		let fileBlob;
		if (source === 'upload') {
			if (!file || file.length === 0) {
				setError(__('No file selected', 'kadence-blocks'));
				return;
			}
			fileBlob = file[0];

			// Check MIME type
			if (fileBlob.type !== 'image/svg+xml') {
				setError(__('The selected file is not an SVG', 'kadence-blocks'));
				return;
			}
		} else {
			if (!pastedSVG.trim()) {
				setError(__('No SVG content pasted', 'kadence-blocks'));
				return;
			}
			fileBlob = new Blob([pastedSVG], { type: 'image/svg+xml' });
		}

		fileread.onload = function (e) {
			const fileContent = e.target.result;

			if (fileContent !== '') {
				apiFetch({
					path: '/kb-custom-svg/v1/manage',
					data: { file: fileContent, title: title },
					method: 'POST',
				}).then((response) => {
					if (has(response, 'value') && has(response, 'label')) {
						createSuccessNotice(__('SVG Saved.', 'kadence-blocks'), {
							type: 'snackbar',
						});
						callback();
						setIsOpen(false);
					} else if (has(response, 'error') && has(response, 'message')) {
						setError(response.message);
					} else {
						setError(__('An error occurred when uploading your file', 'kadence-blocks'));
					}
				});
			}
		};

		fileread.readAsText(fileBlob);
	}

	return (
		<>
			{isOpen && (
				<Modal
					title={__('Add an SVG')}
					className={'upload-svg-modal'}
					size={'medium'}
					onRequestClose={() => setIsOpen(false)}
				>
					<div className={'modal-body'}>
						<div className={'security-notice'}>
							<h4>{__('Important: SVG Safety', 'kadence-blocks')}</h4>
							<p>
								{__(
									'SVGs can contain malicious code. For your security, we suggest sanitizing your files before uploading.',
									'kadence-blocks'
								)}
								&nbsp;
								<a href={'https://www.kadencewp.com/help-center/?post_type=docs&p=8510'}>
									{__(
										'Learn more about SVG security and supported SVG formatting.',
										'kadence-blocks'
									)}
								</a>
							</p>
						</div>

						{error !== '' && <div className={'error-message'}>{error}</div>}

						{uploadView === 'upload' && (
							<div className={'drag-drop-container'}>
								<TextControl
									placeholder={__('Title your SVG', 'kadence-blocks')}
									value={title}
									onChange={(value) => setTitle(value)}
								/>
								<FormFileUpload
									accept="image/svg+xml"
									onChange={(event) => {
										setFile(event.currentTarget.files);
										if (title === '') {
											setTitle(
												get(event.currentTarget.files, ['0', 'name'], '').replace('.svg', '')
											);
										}
									}}
									render={({ openFileDialog }) => (
										<div
											onClick={openFileDialog}
											className={'drag-drop-target'}
											style={{ position: 'relative' }}
										>
											<DropZone
												label={__('Upload SVG', 'kadence-blocks')}
												onFilesDrop={(file) => {
													setFile(file);
													if (title === '') {
														setTitle(get(file, ['0', 'name'], '').replace('.svg', ''));
													}
												}}
											/>
											{file === null || file.length === 0 ? (
												<>
													<h3>{__('Select a file or drop it here', 'kadence-blocks')}</h3>
													<p>{__('SVG dimensions: 24px by 24px', 'kadence-blocks')}</p>
												</>
											) : (
												<>
													<h3>{__('File Selected', 'kadence-blocks')}</h3>
													<p>{get(file, ['0', 'name'], '')}</p>
												</>
											)}

											<Button isPrimary={true}>
												{file === null
													? __('Select a file', 'kadence-blocks')
													: __('Change file', 'kadence-blocks')}
											</Button>
										</div>
									)}
								/>

								<Button
									type={'link'}
									onClick={() => {
										setUploadView('paste');
										setFile(null);
									}}
								>
									{__('Paste an SVG', 'kadence-blocks')}
								</Button>
							</div>
						)}

						{uploadView === 'paste' && (
							<div className={'paste-container'}>
								<h3>{__('Paste your SVG', 'kadence-blocks')}</h3>
								<TextControl
									placeholder={__('Title your SVG', 'kadence-blocks')}
									value={title}
									onChange={(value) => setTitle(value)}
								/>
								<TextareaControl value={pastedSVG} onChange={(value) => setPastedSVG(value)} />

								<Button
									type={'link'}
									onClick={() => {
										setUploadView('upload');
										setPastedSVG('');
									}}
								>
									{__('Upload an SVG', 'kadence-blocks')}
								</Button>
							</div>
						)}
					</div>

					<div className={'footer'}>
						<Button isSecondary={true} onClick={() => setIsOpen(false)}>
							{__('Cancel', 'kadence-blocks')}
						</Button>

						<Button
							isPrimary={true}
							onClick={() => {
								parseAndUpload();
							}}
						>
							{__('Add', 'kadence-blocks')}
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
}
