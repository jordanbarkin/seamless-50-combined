/**
 * @module math/mathcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';

/**
 * The math command called be the toolbar button, or whenever else
 *	the process of inserting math is initiated.
 *
 * @extends module:core/command~Command
 */
export default class InsertMathCommand extends Command {

	init() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = doc.selection.getSelectedElement().dataNode.getRawData();

	}

	// Executes the command, inserting math into the document with optional name parameter.
	execute(rawData, name) {
		this.editor.updateFocusedMathElement();
		const currentNode = this.editor.focusedMathElement;



		this.editor.insertMath(this.editor, rawData, name);

		if(currentNode != null) {
			this.set('name', currentNode.getName());
			this.set('string', "Name: " + currentNode.getName() + " —— ID: " + currentNode.getUUID());
		}
	}

}
