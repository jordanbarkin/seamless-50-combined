/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module math/math
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MathEditing from './mathediting';
import MathUI from './mathui';

/**
 * The math plugin.
 *
 * This is a "glue" plugin which loads the {@math module:math/mathediting~MathEditing math editing feature}
 * and {@math module:math/mathui~MathUI math UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Math extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ MathEditing, /*MathUI*/ ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Math';
	}
}


