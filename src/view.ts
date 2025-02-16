import { ClassName, TextProps, TextView, Value, View, ViewProps } from '@tweakpane/core';
import { Thumbnail } from './controller.js';

const CHECKER_IMG_SRC = '__checker_img_src__';
const className = ClassName('thumb');

interface Config {
	textView: TextView<string>;
	value: Value<Thumbnail | null>;
	valueOptions: Thumbnail[];
	textProps: TextProps<string>;
	viewProps: ViewProps;
	onTextInput: (event: Event) => void;
	onOptionClick: (option: Thumbnail) => void;
}

// TODO: need refactoring
export class PluginView implements View {
	public readonly element: HTMLElement;
	private doc_: Document;
	private value_: Value<Thumbnail | null>;
	private valueOptions_: Thumbnail[];
	private textView_: TextView<string>;
	private overlayEl_: HTMLElement;
	private selectEl_: HTMLElement;
	private selectThumbEl_: HTMLElement;
	private optionEls_: HTMLElement[] = [];

	constructor(doc: Document, config: Config) {
		this.onSelect_ = this.onSelect_.bind(this);
		this.open = this.open.bind(this);
		this.close = this.close.bind(this);

		this.doc_ = doc;

		this.element = doc.createElement('div');
		this.element.classList.add(className());

		this.selectEl_ = document.createElement('div');
		this.selectEl_.classList.add(className('sopt'));
		this.element.appendChild(this.selectEl_);

		this.selectThumbEl_ = document.createElement('div');
		this.selectThumbEl_.classList.add(className('sthmb'));
		this.selectEl_.appendChild(this.selectThumbEl_);

		this.textView_ = config.textView;
		this.textView_.inputElement.addEventListener(
			'click',
			this.onTextInputClick.bind(this),
		);
		this.textView_.element.classList.add(className('slbl'));
		this.textView_.inputElement.addEventListener('input', config.onTextInput);
		this.selectEl_.appendChild(this.textView_.element);

		this.overlayEl_ = doc.createElement('div');
		this.overlayEl_.classList.add(className('ovl'));
		this.element.appendChild(this.overlayEl_);

		this.selectEl_.addEventListener('click', this.open);

		config.viewProps.bindClassModifiers(this.element);

		this.value_ = config.value;
		this.value_.emitter.on('change', this.onValueChange_.bind(this));
		this.valueOptions_ = config.valueOptions;

		this.init_();
		this.refresh_();

		config.viewProps.handleDispose(() => {
			this.selectEl_.removeEventListener('click', this.open);
			this.doc_.removeEventListener('click', this.close);

			let rowEl;
			while ((rowEl = this.optionEls_.pop())) {
				rowEl.removeEventListener('click', this.onSelect_);
				this.overlayEl_.removeChild(rowEl);
			}
		});
	}

	private init_(): void {
		this.createOptionEl(null);
		for (const thumbnail of this.valueOptions_) {
			this.createOptionEl(thumbnail);
		}
	}

	private createOptionEl(thumbnail: Thumbnail | null) {
		const doc = this.element.ownerDocument;
		const thumbEl = doc.createElement('div');
		thumbEl.classList.add(className('thmb'));
		thumbEl.style.backgroundImage = thumbnail
			? `url(${thumbnail.src})`
			: `url(${CHECKER_IMG_SRC})`;

		const labelEl = doc.createElement('span');
		labelEl.classList.add(className('lbl'));
		labelEl.textContent = thumbnail ? thumbnail.value : 'None';

		const optionEl = doc.createElement('div');
		optionEl.classList.add(className('opt'));
		optionEl.appendChild(thumbEl);
		optionEl.appendChild(labelEl);
		optionEl.setAttribute('data-value', thumbnail ? thumbnail.value : '');
		optionEl.addEventListener('click', this.onSelect_);

		this.optionEls_.push(optionEl);
		this.overlayEl_.appendChild(optionEl);
	}

	/** Updates UI state after a value change. */
	private refresh_(): void {
		const active = this.value_.rawValue;

		if (active) {
			this.selectThumbEl_.style.backgroundImage = `url(${active.src})`;
			this.textView_.inputElement.value = active.value;
		} else {
			this.selectThumbEl_.style.backgroundImage = `url(${CHECKER_IMG_SRC})`;
			this.textView_.inputElement.value = 'No Image';
		}

		const activeValue = active ? active.value : '';
		for (const optionEl of this.optionEls_) {
			if (optionEl.getAttribute('data-value') === activeValue) {
				optionEl.setAttribute('aria-selected', 'true');
			} else {
				optionEl.removeAttribute('aria-selected');
			}
		}
	}

	/** Opens the overlay. */
	public open(event: MouseEvent) {
		this.showOptions();
		event.stopPropagation();
	}

	private showOptions() {
		this.element.classList.add(className('-active'));
		this.doc_.addEventListener('click', this.close);
	}

	/** Closes the overlay. */
	public close() {
		this.element.classList.remove(className('-active'));
		this.doc_.removeEventListener('click', this.close);
		// refrash for update value if no one selected
		this.refresh_();
	}

	/** Selects the thumbnail element clicked. */
	private onSelect_(event: MouseEvent) {
		const optionEl = this.findOptionEl_(event.target as HTMLElement);
		const value = optionEl.getAttribute('data-value');
		const thumbnail = this.valueOptions_.find(
			(option) => option.value === value,
		);
		this.value_.setRawValue(thumbnail || null);
	}

	/** Given a click event somewhere in an option, finds the nearest option element. */
	private findOptionEl_(element: HTMLElement | null): HTMLElement {
		while (element && !element.hasAttribute('data-value')) {
			element = element.parentElement;
		}
		if (!element) throw new Error('Invalid DOM scope');
		return element;
	}

	/** Change handler. */
	private onValueChange_() {
		this.refresh_();
	}

	private onTextInputClick() {
		this.textView_.inputElement.value = '';
		this.updateOptions(this.valueOptions_);
		this.showOptions();
	}

	public updateOptions(options: Thumbnail[]) {
		this.optionEls_.forEach((element) => {
			this.overlayEl_.removeChild(element);
		});
		this.optionEls_ = [];
		this.createOptionEl(null);
		options.forEach((option) => {
			this.createOptionEl(option);
		});
		const active = this.value_.rawValue;
		if (active) {
			for (const optionEl of this.optionEls_) {
				if (optionEl.getAttribute('data-value') !== active.value) {
					continue;
				}
				optionEl.setAttribute('aria-selected', 'true');
				break;
			}
		} else {
			this.optionEls_.find((option) => {
				console.log(option.getAttribute('data-value'));
				return option.getAttribute('data-value') === '';
			})?.setAttribute('aria-selected', 'true');
		}
	}

	public changeDraggingState(state: boolean) {
		if (state) this.element.classList.add(className('dragging_area'));
		else {
			this.element.classList.remove(className('dragging_area'));
			// this.element.classList.remove(className('dragging_area_error'));
		}
	}

	// public setDraggingError() {
	// 	this.element.classList.add(className('dragging_area_error'));
	// }
}
