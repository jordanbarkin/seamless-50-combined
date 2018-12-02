// /**
//  * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
//  * For licensing, see LICENSE.md.
//  */

// /**
//  * @module math/mathediting
//  */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastAttributeToElement,  downcastAttributeToAttribute} from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute, upcastAttributeToAttribute} from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import MathCommand from './mathcommand';
import UnmathCommand from './unmathcommand';
import { createMathElement, ensureSafeUrl } from './utils';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import findMathRange from './findmathrange';
import '../theme/math.css';

import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import MathNode from './mathnode';

const HIGHLIGHT_CLASS = 'ck-math_selected';

export default class MathEditing extends Plugin {

	init() {
   		const editor = this.editor;
		editor.model.schema.register( 'math', {
				allowWhere: '$text',
				isObject: true,
				allowAttributes: 'raw'
			} );
		
		 	editor.model.schema.extend( '$text', {
				allowIn: 'math'
			} );

		 	editor.conversion.for( 'editingDowncast' ).add(
				downcastElementToElement( {
					model: 'math',
					view: ( modelItem, viewWriter ) => {
						const widgetElement = viewWriter.createContainerElement( 'math' );
 						return toWidget( widgetElement, viewWriter );
				}
			} ));

		 	editor.conversion.for( 'dataDowncast' )
		 	.add(
				downcastElementToElement( {
					model: 'math',
					view: 'math'
				} ));

		 	editor.conversion.for( 'upcast' ).add(
				upcastElementToElement( {
					view: 'math',
					model: 'math'
				} ));
    
	editor.mathElements = [];
 
    editor.insertMath = function(editor, rawData, name) {
		editor.model.change( writer => {
			const math = writer.createElement('math');
			math.dataNode = new MathNode(name, rawData);
			editor.mathElements.push(math);
			writer.insertText(String(math.dataNode.getRenderedValue()), math );
 			writer.insert( math, editor.model.document.selection.getFirstPosition());
		} );
	}

    editor.renderMathFromDataNode = function(dataNode) {
		editor.model.change( writer => {
			const math = writer.createElement('math');
			math.dataNode = dataNode;
			editor.mathElements.push(math);
			writer.insertText(String(math.dataNode.getRenderedValue()), math);
 			writer.insert(math, editor.model.document.selection.getFirstPosition());
		} );
	}	

    editor.renderMathFromElement = function(element) {
		editor.model.change( writer => {
			const math = element;
			editor.mathElements.push(math);
			writer.insertText(String(math.dataNode.getRenderedValue()), math);
 			writer.insert(math, editor.model.document.selection.getFirstPosition());
		} );
	}	

 }
}
