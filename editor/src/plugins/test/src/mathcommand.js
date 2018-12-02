/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module math/mathcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import findMathRange from './findmathrange';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';

/**
 * The math command. It is used by the {@math module:math/math~Math math feature}.
 *
 * @extends module:core/command~Command
 */
export default class MathCommand extends Command {
	/**
	 * The value of the `'mathHref'` attribute if the start of the selection is located in a node with this attribute.
	 *
	 * @observable
	 * @readonly
	 * @member {Object|undefined} #value
	 */

	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = "temp" // doc.selection.getAttribute( 'raw' );
		this.isEnabled = true // model.schema.checkAttributeInSelection( doc.selection, 'mathHref' );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is non-collapsed, the `mathHref` attribute will be applied to nodes inside the selection, but only to
	 * those nodes where the `mathHref` attribute is allowed (disallowed nodes will be omitted).
	 *
	 * When the selection is collapsed and is not inside the text with the `mathHref` attribute, the
	 * new {@math module:engine/model/text~Text Text node} with the `mathHref` attribute will be inserted in place of caret, but
	 * only if such element is allowed in this place. The `_data` of the inserted text will equal the `href` parameter.
	 * The selection will be updated to wrap the just inserted text node.
	 *
	 * When the selection is collapsed and inside the text with the `mathHref` attribute, the attribute value will be updated.
	 *
	 * @fires execute
	 * @param {String} href Math destination.
	 */
	execute(math, raw) {
		this.editor.insertMath(this.editor, math, raw)
	}
		// const model = this.editor.model;
		// const selection = model.document.selection;

		// model.change( writer => {
			// If selection is collapsed then update selected math or insert new one at the place of caret.
			// if ( selection.isCollapsed ) {
			// 	const position = selection.getFirstPosition();

				// When selection is inside text with `mathHref` attribute.
				// if ( selection.hasAttribute( 'mathHref' ) ) {
				// 	// Then update `mathHref` value.
				// 	const mathRange = findMathRange( selection.getFirstPosition(), selection.getAttribute( 'mathHref' ) );

				// 	writer.setAttribute( 'mathHref', href, mathRange );

				// 	// Create new range wrapping changed math.
				// 	writer.setSelection( mathRange );
				// }
				// If not then insert text node with `mathHref` attribute in place of caret.
				// However, since selection in collapsed, attribute value will be used as data for text node.
			// 	// So, if `href` is empty, do not create text node.
			// 	else if ( href !== '' ) {
			// 		const attributes = toMap( selection.getAttributes() );

			// 		attributes.set( 'mathHref', href );

			// 		const node = writer.createText( href, attributes );

			// 		writer.insert( node, position );

			// 		// Create new range wrapping created node.
			// 		writer.setSelection( Range.createOn( node ) );
			// // 	}
			// } 
			// else {
			// 	// If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
			// 	// omitting nodes where `mathHref` attribute is disallowed.
			// 	const ranges = model.schema.getValidRanges( selection.getRanges(), 'mathHref' );

			// 	for ( const range of ranges ) {
			// 		writer.setAttribute( 'mathHref', href, range );
			// 	}
			// }
		// } );
	// }
}
