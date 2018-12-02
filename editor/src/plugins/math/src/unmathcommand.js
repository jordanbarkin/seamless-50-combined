/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module math/unmathcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import findMathRange from './findmathrange';

/**
 * The unmath command. It is used by the {@math module:math/math~Math math plugin}.
 *
 * @extends module:core/command~Command
 */
export default class UnmathCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this.editor.model.document.selection.hasAttribute( 'mathHref' );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is collapsed, removes the `mathHref` attribute from each node with the same `mathHref` attribute value.
	 * When the selection is non-collapsed, removes the `mathHref` attribute from each node in selected ranges.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			// Get ranges to unmath.
			const rangesToUnmath = selection.isCollapsed ?
				[ findMathRange( selection.getFirstPosition(), selection.getAttribute( 'mathHref' ) ) ] : selection.getRanges();

			// Remove `mathHref` attribute from specified ranges.
			for ( const range of rangesToUnmath ) {
				writer.removeAttribute( 'mathHref', range );
			}
		} );
	}
}
