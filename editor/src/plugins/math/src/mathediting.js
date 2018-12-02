/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module math/mathediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	downcastAttributeToElement
} from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import MathCommand from './mathcommand';
import UnmathCommand from './unmathcommand';
import { createMathElement, ensureSafeUrl } from './utils';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import findMathRange from './findmathrange';
import '../theme/math.css';

const HIGHLIGHT_CLASS = 'ck-math_selected';

/**
 * The math engine feature.
 *
 * It introduces the `mathHref="url"` attribute in the model which renders to the view as a `<a href="url">` element
 * as well as `'math'` and `'unmath'` commands.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MathEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow math attribute on all inline nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'mathHref' } );

		editor.conversion.for( 'dataDowncast' )
			.add( downcastAttributeToElement( { model: 'mathHref', view: createMathElement } ) );

		editor.conversion.for( 'editingDowncast' )
			.add( downcastAttributeToElement( { model: 'mathHref', view: ( href, writer ) => {
				return createMathElement( ensureSafeUrl( href ), writer );
			} } ) );

		editor.conversion.for( 'upcast' )
			.add( upcastElementToAttribute( {
				view: {
					name: 'math',
					attributes: {
						href: true
					}
				},
				model: {
					key: 'mathHref',
					value: viewElement => viewElement.getAttribute( 'href' )
				}
			} ) );

		// window.editor = editor;

        // const model = editor.model;

        // model.schema.register( 'mathHref', {
        //     inheritAllFrom: '$block',
        //     isObject: true
        // } );

        // editor.conversion.for( 'dataDowncast' )
        //     .add( downcastElementToElement( {
        //         model: 'mathHref',
        //         view: ( modelItem, writer ) => {
        //             return writer.createContainerElement( 'div', { class: 'widget' } );
        //         }
        //     } ) );

        // editor.conversion.for( 'editingDowncast' )
        //     .add( downcastElementToElement( {
        //         model: 'mathHref',
        //         view: ( modelItem, writer ) => {
        //             const div = writer.createContainerElement( 'div', { class: 'widget' } );

        //             return toWidget( div, writer, { label: 'widget label' } );
        //         }
        //     } ) );

        // editor.conversion.for( 'upcast' )
        //     .add( upcastElementToElement( {
        //         view: {
        //             name: 'div',
        //             class: 'widget'
        //         },
        //         model: 'mathHref'
        //     } ) );

		// Create mathing commands.
		editor.commands.add( 'math', new MathCommand( editor ) );
		editor.commands.add( 'unmath', new UnmathCommand( editor ) );

		// Enable two-step caret movement for `mathHref` attribute.
		bindTwoStepCaretToAttribute( editor.editing.view, editor.model, this, 'mathHref' );

		// Setup highlight over selected math.
		this._setupMathHighlight();
	}

	/**
	 * Adds a visual highlight style to a math in which the selection is anchored.
	 * Together with two-step caret movement, they indicate that the user is typing inside the math.
	 *
	 * Highlight is turned on by adding `.ck-math_selected` class to the math in the view:
	 *
	 * * the class is removed before conversion has started, as callbacks added with `'highest'` priority
	 * to {@math module:engine/conversion/downcastdispatcher~DowncastDispatcher} events,
	 * * the class is added in the view post fixer, after other changes in the model tree were converted to the view.
	 *
	 * This way, adding and removing highlight does not interfere with conversion.
	 *
	 * @private
	 */
	_setupMathHighlight() {
		const editor = this.editor;
		const view = editor.editing.view;
		const highlightedMaths = new Set();

		// Adding the class.
		view.document.registerPostFixer( writer => {
			const selection = editor.model.document.selection;

			if ( selection.hasAttribute( 'mathHref' ) ) {
				const modelRange = findMathRange( selection.getFirstPosition(), selection.getAttribute( 'mathHref' ) );
				const viewRange = editor.editing.mapper.toViewRange( modelRange );

				// There might be multiple `a` elements in the `viewRange`, for example, when the `a` element is
				// broken by a UIElement.
				for ( const item of viewRange.getItems() ) {
					if ( item.is( 'math' ) ) {
						writer.addClass( HIGHLIGHT_CLASS, item );
						highlightedMaths.add( item );
					}
				}
			}
		} );

		// Removing the class.
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			// Make sure the highlight is removed on every possible event, before conversion is started.
			dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'selection', removeHighlight, { priority: 'highest' } );

			function removeHighlight() {
				view.change( writer => {
					for ( const item of highlightedMaths.values() ) {
						writer.removeClass( HIGHLIGHT_CLASS, item );
						highlightedMaths.delete( item );
					}
				} );
			}
		} );
	}
}
