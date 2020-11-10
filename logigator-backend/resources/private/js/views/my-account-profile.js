function imageChangeHandling() {

	let node;
	let cropper;

	document.addEventListener('popup-opened', e => {
		const popupNode = e.detail.querySelector('.partial-change-image-popup');
		if (!popupNode) {
			return;
		}
		if (!node) {
			node = popupNode;
			setup();
		}
	});

	function setup() {
		const fileInput = Bem.element(node, 'file');
		const uploadContainer = Bem.element(node, 'upload-container');

		uploadContainer.addEventListener('click', () => fileInput.click());
		uploadContainer.addEventListener('dragstart', evt => dragEvent(evt, true));
		uploadContainer.addEventListener('dragenter', evt => dragEvent(evt, true));
		uploadContainer.addEventListener('dragover', evt => dragEvent(evt, true));
		uploadContainer.addEventListener('dragend', evt => dragEvent(evt, false));
		uploadContainer.addEventListener('dragexit', evt => dragEvent(evt, false));
		uploadContainer.addEventListener('dragleave', evt => dragEvent(evt, false));
		uploadContainer.addEventListener('drop', event => {
			event.preventDefault();
			event.stopPropagation();
			Bem.setState(uploadContainer, 'dragging', false);
			if (event.dataTransfer.files) {
				replaceImage(event.dataTransfer.files[0]);
			}
		});
		fileInput.addEventListener('change', event => {
			if (event.target.files && event.target.files.length > 0) {
				replaceImage(event.target.files[0]);
			}
		});

		function dragEvent(evt, state) {
			evt.preventDefault();
			evt.stopPropagation();
			Bem.setState(uploadContainer, 'dragging', state);
		}

		// eslint-disable-next-line no-undef
		cropper = new Cropper(Bem.element(node, 'img'), {
			aspectRatio: 1
		});
	}

	function replaceImage(file) {
		const fileReader = new FileReader();
		fileReader.readAsDataURL(file);
		fileReader.onload = readEvent => {
			cropper.replace(readEvent.target.result);
		};
	}

}
imageChangeHandling();
