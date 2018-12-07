// /**
//  * @module math/mathediting
//  */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver'

import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import MathNode from './mathnode';
import InsertMathCommand from './mathcommand';

const HIGHLIGHT_CLASS = 'ck-math_selected';

export default class MathEditing extends Plugin {

	// Initializes the math engine.
	init() {
		const editor = this.editor;
		const model = editor.model;
		const editingView = editor.editing.view;
		const viewDocument = editingView.document;

		// Defines the schema for a math object in the DOM.
		// Allows elements with <math> tag to exist in model and view.
		editor.model.schema.register( 'math', {
			allowWhere: '$text',
			isObject: true,
			allowAttributes: 'raw'
		} );

		// Allows text inside of math elements.
		editor.model.schema.extend( '$text', {
			allowIn: 'math'
		} );

		// Defines the conversion from math elements in the model to the view (DOM) when editing in the document.
		editor.conversion.for( 'editingDowncast' ).add(
			downcastElementToElement( {
				model: 'math',
				view: ( modelItem, viewWriter ) => {
					const widgetElement = viewWriter.createContainerElement( 'math' );
					return toWidget( widgetElement, viewWriter );
				}
		} ));

		// Defines the conversion from math elements in the model to the view (DOM) for data added to the editor
		// via paste or load.
		editor.conversion.for( 'dataDowncast' ).add(
			downcastElementToElement( {
				model: 'math',
				view: 'math'
		} ));

		// Defines the conversion from math elements in the view (DOM) to the model for data added to the editor
		editor.conversion.for( 'upcast' ).add(
				upcastElementToElement( {
					view: 'math',
					model: 'math'
		} ));

		// Initializes the insertMath command triggerable by the toolbar or the 'Control+K' keyboard shortcut.
		editor.commands.add( 'insertMath', new InsertMathCommand( editor ) );

		// List of all of the mathElements in the tree (for linear traversal for dependency searching by name).
		editor.mathElements = [];

		// Stores the currently selected math element, if any.
		editor.focusedMathElement = null;

		// Updates the value in the editor.focusedMathElement field.
		editor.updateFocusedMathElement = function() {
			editor.focusedMathElement = null;
			let ranges = model.document.selection.getRanges();
			let mathFound = false;
			let mathNode = null;
			// Iterates over every item in the selected area, searching for a
			// math node.
			for(var range of ranges){
				for(var item of range) {
					item = item["item"];
					if(item.name === "math") {
						mathFound = true;
						mathNode = item.dataNode;
						editor.focusedMathElement = mathNode;
					}
				}
			}
		}

		// Master function to add or edit math in the model.
		// Writes to the virtual DOM and creates a dataNode, which is added to the
		// tree.
		editor.insertMath = function(editor, rawData, name) {
			if(!editor.focusedMathElement) {
				editor.model.change( writer => {
					const math = writer.createElement('math');
					math.dataNode = new MathNode(math, name, rawData);
					editor.mathElements.push(math);
					math.dataNode.setParentElementPointer(math);
					writer.insertText(String(math.dataNode.getRenderedValue()), math );
					writer.insert( math, editor.model.document.selection.getFirstPosition());
				} );
			}
			else
				editor.focusedMathElement.updateRawData(rawData);
			}



		// Listens for clicks on nodes.
		editingView.addObserver(ClickObserver);

		// Clicking a node focuses it, assigning it to editor.focusedMathElement.
		this.listenTo( viewDocument, 'click', (event,data) => {
			const target = data.target; // This is the view the user clicked on
			const modelObj = editor.editing.mapper.toModelElement(target);

			console.log("focusing" + modelObj); //this is the element clicked
			try {
				editor.focusedMathElement = modelObj.dataNode;
			}
			catch(err) {
				editor.focusedMathElement = modelObj;
			}
		} );

		// Listens for deletions in the DOM and then calls removeFromTree() on
		// the associated dataNode, completing the process of removing the element.
		editor.model.on( 'deleteContent', ( evt, data ) => {
			let ranges = data[0].getRanges();
			for(var range of ranges){
				for(var item of range) {
					item = item["item"];
					console.log(item);
					if(item.name === "math") {
						item.dataNode.removeFromTree();
					}
				}
			}
		}, { priority: 'highest' } );
	}
}
