# Tweakpane image list plugin

Image list input plugin for [Tweakpane][tweakpane].

## Features

## Installation

You can install [this package][npm-link] via NPM:

```sh
npm i tweakpane4-image-list-plugin
```

## Usage

You can use this plugin using these parameters:

## Example

```js
import {Pane} from 'tweakpane';
import * as TweakpaneImagePlugin from 'tweakpane4-image-list-plugin';

const pane = new Pane();
pane.registerPlugin(TweakpaneImagePlugin);

const params = {
	image: 'img_1',
};

pane.addBinding(params, 'image', {
	view: 'thumbnail-list',
	options: [
		{ value: 'img_1', src: 'https://images.freeimages.com/image/previews/b48/nature-stroke-png-design-5690476.png?fmt=webp&w=500' },
		{ value: 'img_2', src: 'https://images.freeimages.com/image/previews/50b/japanese-bonsai-nature-hand-png-5692400.png?fmt=webp&w=500' }
	]
});
```

[tweakpane]: https://github.com/cocopon/tweakpane/
