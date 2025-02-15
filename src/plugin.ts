import {
	BaseInputParams,
	BindingTarget,
	CompositeConstraint,
	createPlugin,
	InputBindingPlugin,
	parseRecord,
} from '@tweakpane/core';

import { PluginController, Thumbnail } from './controller.js';

export interface PluginInputParams extends BaseInputParams {
	view: 'thumbnail-list';
	options: Thumbnail[];
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
				}),
			)
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

				// if (exValue.src !== undefined) {
				// 	return exValue.src === '' ? 'placeholder' : exValue.src;
				// } else {
				// 	return typeof exValue === 'string' ? exValue : exValue;
				// }
			};
		},

		constraint(_args) {
			return new CompositeConstraint([]);
		},

		writer(_args) {
			return (target: BindingTarget, inValue) => {
				target.write(inValue);
			};
		},
	},

	controller(args) {
		return new PluginController(args.document, {
			value: args.value,
			valueOptions: args.params.options,
			viewProps: args.viewProps
		});
	},
});
