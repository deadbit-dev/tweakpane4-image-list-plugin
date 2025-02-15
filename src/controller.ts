import { Controller, Value, ViewProps } from '@tweakpane/core';
import { PluginView } from './view.js';

interface Config {
	value: Value<Thumbnail | null>;
	valueOptions: Thumbnail[];
	viewProps: ViewProps;
}

export interface Thumbnail {
	value: string;
	src: string;
}

// const placeholderImage: HTMLImageElement | null = null;

export class PluginController implements Controller<PluginView> {
	public readonly value: Value<Thumbnail | null>;
	public readonly valueOptions: Thumbnail[];
	public readonly view: PluginView;
	public readonly viewProps: ViewProps;

	constructor(doc: Document, config: Config) {
		this.value = config.value;
		this.valueOptions = config.valueOptions;
		this.viewProps = config.viewProps;
		this.view = new PluginView(doc, {
			value: this.value,
			valueOptions: config.valueOptions,
			viewProps: this.viewProps
		});

		this.onDrop = this.onDrop.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);

		this.view.element.addEventListener('drop', this.onDrop);
		this.view.element.addEventListener('dragover', this.onDragOver);
		this.view.element.addEventListener('dragleave', this.onDragLeave);

		this.viewProps.handleDispose(() => {
			this.view.element.removeEventListener('drop', this.onDrop);
			this.view.element.removeEventListener('dragover', this.onDragOver);
			this.view.element.removeEventListener('dragleave', this.onDragLeave);
		});

		this.value.emitter.on('change', () => this.handleValueChange());

		this.handleValueChange();
	}

	private onDrop(event: DragEvent) {
		event.preventDefault();
		const url = this.getUrlFromDrag(event);
		const thumbnail: Thumbnail | null = this.getThumbnailFromUrl(url);
		this.setValue(thumbnail);
		this.view.changeDraggingState(false);
	}

	private getThumbnailFromUrl(url: string): Thumbnail | null {
		if (url == '')
			return null;

		const index = this.valueOptions.findIndex((option) => {
			return option.src == url;
		});

		if (index == -1)
			return null;

		return this.valueOptions[index];
	}

	private getUrlFromDrag(event: DragEvent): string {
		const dataTransfer = event.dataTransfer;
		if (!dataTransfer)
			return ''; // maybe set error img
		return dataTransfer.getData('url');
	}

	private onDragOver(event: DragEvent) {
		event.preventDefault();
		this.view.changeDraggingState(true);

		// if (this.getThumbnailFromUrl(this.getUrlFromDrag(event)) == null) {
		// 	this.view.setDraggingError();
		// }
	}

	private onDragLeave() {
		this.view.changeDraggingState(false);
	}

	private handleImage(data: Thumbnail | null) {
		this.setValue(data);
	}

	private setValue(src: Thumbnail | null) {
		this.value.setRawValue(src);
	}

	private handleValueChange() {
		this.handleImage(this.value.rawValue);
	}
}
