import {
	BaseInputParams,
	BindingTarget,
	CompositeConstraint,
	createPlugin,
	createValue,
	InputBindingPlugin,
	parseRecord,
	ValueMap,
} from '@tweakpane/core';

import { PluginController, Thumbnail } from './controller.js';

export interface PluginInputParams extends BaseInputParams {
	view: 'thumbnail-list';
	options: Thumbnail[];
	debounceDelay?: number;
}

export const TweakpaneImagePlugin: InputBindingPlugin<
	Thumbnail | null,
	string,
	PluginInputParams
> = createPlugin({
	id: 'thumbnail-list',
	type: 'input',

	accept(exValue: unknown, params: Record<string, unknown>) {
		if (typeof exValue !== 'string') {
			return null;
		}

		const result = parseRecord<PluginInputParams>(params, (p) => ({
			view: p.required.constant('thumbnail-list'),
			options: p.required.array(
				p.required.object({
					value: p.required.string,
					src: p.required.string,
					offset: p.optional.object({
						posX: p.required.number,
						posY: p.required.number,
						width: p.required.number,
						height: p.required.number,
						sizeX: p.required.number,
						sizeY: p.required.number
					})
				})
			),
			noDataText: p.optional.string,
			debounceDelay: p.optional.number
		}));

		if (!result) {
			return null;
		}

		return {
			initialValue: exValue,
			params: result,
		};
	},

	binding: {
		reader(_args) {
			return (exValue: any): Thumbnail | null => {
				return (
					_args.params.options.find((option) => option.value == exValue) || null
				);
			};
		},

		constraint(_args) {
			return new CompositeConstraint([]);
		},

		writer(_args) {
			return (target: BindingTarget, inValue) => {
				target.write(inValue?.value);
			};
		},
	},

	controller(args) {
		return new PluginController(args.document, {
			value: args.value,
			valueOptions: args.params.options,
			textValue: createValue(''),
			debounceDelay: args.params.debounceDelay || 250,
			textProps: ValueMap.fromObject({
				formatter: (val: any) => String(val),
			}),
			viewProps: args.viewProps
		});
	},
});
