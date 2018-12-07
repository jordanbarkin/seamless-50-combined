import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MathEditing from './mathediting';
import MathUI from './mathui';

/**
 * The master math plugin. It loads the MathEditing and MathUI components.
 *
 * @extends module:core/plugin~Plugin
 */

export default class Math extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [MathEditing, MathUI];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Math';
	}
}
