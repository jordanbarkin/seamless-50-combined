/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module math/mathui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import Range from '@ckeditor/ckeditor5-engine/src/view/range';
import { isMathElement } from './utils';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import MathFormView from './ui/mathformview';
import MathActionsView from './ui/mathactionsview';

import mathIcon from '../theme/icons/math.svg';

const mathKeystroke = 'Ctrl+K';

/**
 * The math UI plugin. It introduces the `'math'` and `'unmath'` buttons and support for the <kbd>Ctrl+K</kbd> keystroke.
 *
 * It uses the
 * {@math module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MathUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.editing.view.addObserver( ClickObserver );

		/**
		 * The actions view displayed inside of the balloon.
		 *
		 * @member {module:math/ui/mathactionsview~MathActionsView}
		 */
		// this.actionsView = this._createActionsView();

		/**
		 * The form view displayed inside the balloon.
		 *
		 * @member {module:math/ui/mathformview~MathFormView}
		 */
		// this.formView = this._createFormView();

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		// this._balloon = editor.plugins.get( ContextualBalloon );

		// Create toolbar buttons.
		// this._createToolbarMathButton();

		// Attach lifecycle actions to the the balloon.
		// this._enableUserBalloonInteractions();
	}

	/**
	 * Creates the {@math module:math/ui/mathactionsview~MathActionsView} instance.
	 *
	 * @private
	 * @returns {module:math/ui/mathactionsview~MathActionsView} The math actions view instance.
	 */
	_createActionsView() {
		const editor = this.editor;
		const actionsView = new MathActionsView( editor.locale );
		const mathCommand = editor.commands.get( 'math' );
		// const unmathCommand = editor.commands.get( 'unmath' );

		// actionsView.bind('value' ).to( mathCommand, 'value' );
		// actionsView.editButtonView.bind( 'isEnabled' ).to( mathCommand );
		// actionsView.unmathButtonView.bind( 'isEnabled' ).to( unmathCommand );

		// Execute unmath command after clicking on the "Edit" button.
		// this.listenTo( actionsView, 'edit', () => {
		// 	this._addFormView();
		// } );

		// // Execute unmath command after clicking on the "Unmath" button.
		// this.listenTo( actionsView, 'unmath', () => {
		// 	editor.execute( 'unmath' );
		// 	this._hideUI();
		// } );

		// Close the panel on esc key press when the **actions have focus**.
		actionsView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		// Open the form view on Ctrl+K when the **actions have focus**..
		actionsView.keystrokes.set( mathKeystroke, ( data, cancel ) => {
			this._addFormView();
			cancel();
		} );

		return actionsView;
	}

	/**
	 * Creates the {@math module:math/ui/mathformview~MathFormView} instance.
	 *
	 * @private
	 * @returns {module:math/ui/mathformview~MathFormView} The math form instance.
	 */
	// _createFormView() {
	// 	const editor = this.editor;
	// 	const formView = new MathFormView( editor.locale );
	// 	const mathCommand = editor.commands.get( 'math' );

	// 	formView.urlInputView.bind( 'value' ).to( mathCommand, 'value' );

	// 	// Form elements should be read-only when corresponding commands are disabled.
	// 	formView.urlInputView.bind( 'isReadOnly' ).to( mathCommand, 'isEnabled', value => !value );
	// 	formView.saveButtonView.bind( 'isEnabled' ).to( mathCommand );

	// 	// Execute math command after clicking the "Save" button.
	// 	this.listenTo( formView, 'submit', () => {
	// 		editor.execute( 'math', formView.urlInputView.inputView.element.value );
	// 		this._removeFormView();
	// 	} );

	// 	// Hide the panel after clicking the "Cancel" button.
	// 	this.listenTo( formView, 'cancel', () => {
	// 		this._removeFormView();
	// 	} );

	// 	// Close the panel on esc key press when the **form has focus**.
	// 	formView.keystrokes.set( 'Esc', ( data, cancel ) => {
	// 		this._removeFormView();
	// 		cancel();
	// 	} );

	// 	return formView;
	// }

	/**
	 * Creates a toolbar Math button. Clicking this button will show
	 * a {@math #_balloon} attached to the selection.
	 *
	 * @private
	 */
	_createToolbarMathButton() {
		const editor = this.editor;
		const mathCommand = editor.commands.get( 'math' );
		const t = editor.t;

		// Handle the `Ctrl+K` keystroke and show the panel.
		editor.keystrokes.set( mathKeystroke, ( keyEvtData, cancel ) => {
			// Prevent focusing the search bar in FF and opening new tab in Edge. #153, #154.
			cancel();

			if ( mathCommand.isEnabled ) {
				this._showUI();
			}
		} );

		editor.ui.componentFactory.add( 'math', locale => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = t( 'Math' );
			button.icon = mathIcon;
			button.keystroke = mathKeystroke;
			button.tooltip = true;

			// Bind button to the command.
			button.bind( 'isOn', 'isEnabled' ).to( mathCommand, 'value', 'isEnabled' );

			// Show the panel on button click.
			this.listenTo( button, 'execute', () => this._showUI() );

			return button;
		} );
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@math #formView} is visible or not.
	 *
	 * @private
	 */
	_enableUserBalloonInteractions() {
		const viewDocument = this.editor.editing.view.document;

		// Handle click on view document and show panel when selection is placed inside the math element.
		// Keep panel open until selection will be inside the same math element.
		this.listenTo( viewDocument, 'click', () => {
			const parentMath = this._getSelectedMathElement();

			if ( parentMath ) {
				// Then show panel but keep focus inside editor editable.
				this._showUI();
			}
		} );

		// Focus the form if the balloon is visible and the Tab key has been pressed.
		this.editor.keystrokes.set( 'Tab', ( data, cancel ) => {
			if ( this._areActionsVisible && !this.actionsView.focusTracker.isFocused ) {
				this.actionsView.focus();
				cancel();
			}
		}, {
			// Use the high priority because the math UI navigation is more important
			// than other feature's actions, e.g. list indentation.
			// https://github.com/ckeditor/ckeditor5-math/issues/146
			priority: 'high'
		} );

		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._isUIVisible ) {
				this._hideUI();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.formView,
			activator: () => this._isUIVisible,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideUI()
		} );
	}

	/**
	 * Adds the {@math #actionsView} to the {@math #_balloon}.
	 *
	 * @protected
	 */
	_addActionsView() {
		if ( this._areActionsInPanel ) {
			return;
		}

		this._balloon.add( {
			view: this.actionsView,
			position: this._getBalloonPositionData()
		} );
	}

	/**
	 * Adds the {@math #formView} to the {@math #_balloon}.
	 *
	 * @protected
	 */
	_addFormView() {
		if ( this._isFormInPanel ) {
			return;
		}

		const editor = this.editor;
		const mathCommand = editor.commands.get( 'math' );

		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		this.formView.urlInputView.select();

		// Make sure that each time the panel shows up, the URL field remains in sync with the value of
		// the command. If the user typed in the input, then canceled the balloon (`urlInputView#value` stays
		// unaltered) and re-opened it without changing the value of the math command (e.g. because they
		// clicked the same math), they would see the old value instead of the actual value of the command.
		// https://github.com/ckeditor/ckeditor5-math/issues/78
		// https://github.com/ckeditor/ckeditor5-math/issues/123
		this.formView.urlInputView.inputView.element.value = mathCommand.value || '';
	}

	/**
	 * Removes the {@math #formView} from the {@math #_balloon}.
	 *
	 * @protected
	 */
	_removeFormView() {
		if ( this._isFormInPanel ) {
			this._balloon.remove( this.formView );

			// Because the form has an input which has focus, the focus must be brought back
			// to the editor. Otherwise, it would be lost.
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Shows the right kind of the UI for current state of the command. It's either
	 * {@math #formView} or {@math #actionsView}.
	 *
	 * @private
	 */
	_showUI() {
		const editor = this.editor;
		const mathCommand = editor.commands.get( 'math' );

		if ( !mathCommand.isEnabled ) {
			return;
		}

		// When there's no math under the selection, go straight to the editing UI.
		if ( !this._getSelectedMathElement() ) {
			this._addActionsView();
			this._addFormView();
		}
		// If theres a math under the selection...
		else {
			// Go to the editing UI if actions are already visible.
			if ( this._areActionsVisible ) {
				this._addFormView();
			}
			// Otherwise display just the actions UI.
			else {
				this._addActionsView();
			}
		}

		// Begin responding to ui#update once the UI is added.
		this._startUpdatingUI();
	}

	/**
	 * Removes the {@math #formView} from the {@math #_balloon}.
	 *
	 * See {@math #_addFormView}, {@math #_addActionsView}.
	 *
	 * @protected
	 */
	_hideUI() {
		if ( !this._isUIInPanel ) {
			return;
		}

		const editor = this.editor;

		this.stopListening( editor.ui, 'update' );

		// Remove form first because it's on top of the stack.
		this._removeFormView();

		// Then remove the actions view because it's beneath the form.
		this._balloon.remove( this.actionsView );

		// Make sure the focus always gets back to the editable.
		editor.editing.view.focus();
	}

	/**
	 * Makes the UI react to the {@math module:core/editor/editorui~EditorUI#event:update} event to
	 * reposition itself when the editor ui should be refreshed.
	 *
	 * See: {@math #_hideUI} to learn when the UI stops reacting to the `update` event.
	 *
	 * @protected
	 */
	_startUpdatingUI() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		let prevSelectedMath = this._getSelectedMathElement();
		let prevSelectionParent = getSelectionParent();

		this.listenTo( editor.ui, 'update', () => {
			const selectedMath = this._getSelectedMathElement();
			const selectionParent = getSelectionParent();

			// Hide the panel if:
			//
			// * the selection went out of the EXISTING math element. E.g. user moved the caret out
			//   of the math,
			// * the selection went to a different parent when creating a NEW math. E.g. someone
			//   else modified the document.
			// * the selection has expanded (e.g. displaying math actions then pressing SHIFT+Right arrow).
			//
			// Note: #_getSelectedMathElement will return a math for a non-collapsed selection only
			// when fully selected.
			if ( ( prevSelectedMath && !selectedMath ) ||
				( !prevSelectedMath && selectionParent !== prevSelectionParent ) ) {
				this._hideUI();
			}
			// Update the position of the panel when:
			//  * the selection remains in the original math element,
			//  * there was no math element in the first place, i.e. creating a new math
			else {
				// If still in a math element, simply update the position of the balloon.
				// If there was no math (e.g. inserting one), the balloon must be moved
				// to the new position in the editing view (a new native DOM range).
				this._balloon.updatePosition( this._getBalloonPositionData() );
			}

			prevSelectedMath = selectedMath;
			prevSelectionParent = selectionParent;
		} );

		function getSelectionParent() {
			return viewDocument.selection.focus.getAncestors()
				.reverse()
				.find( node => node.is( 'element' ) );
		}
	}

	/**
	 * Returns true when {@math #formView} is in the {@math #_balloon}.
	 *
	 * @readonly
	 * @protected
	 * @type {Boolean}
	 */
	get _isFormInPanel() {
		return this._balloon.hasView( this.formView );
	}

	/**
	 * Returns true when {@math #actionsView} is in the {@math #_balloon}.
	 *
	 * @readonly
	 * @protected
	 * @type {Boolean}
	 */
	get _areActionsInPanel() {
		return this._balloon.hasView( this.actionsView );
	}

	/**
	 * Returns true when {@math #actionsView} is in the {@math #_balloon} and it is
	 * currently visible.
	 *
	 * @readonly
	 * @protected
	 * @type {Boolean}
	 */
	get _areActionsVisible() {
		return this._balloon.visibleView === this.actionsView;
	}

	/**
	 * Returns true when {@math #actionsView} or {@math #formView} is in the {@math #_balloon}.
	 *
	 * @readonly
	 * @protected
	 * @type {Boolean}
	 */
	get _isUIInPanel() {
		return this._isFormInPanel || this._areActionsInPanel;
	}

	/**
	 * Returns true when {@math #actionsView} or {@math #formView} is in the {@math #_balloon} and it is
	 * currently visible.
	 *
	 * @readonly
	 * @protected
	 * @type {Boolean}
	 */
	get _isUIVisible() {
		const visibleView = this._balloon.visibleView;

		return visibleView == this.formView || this._areActionsVisible;
	}

	/**
	 * Returns positioning options for the {@math #_balloon}. They control the way the balloon is attached
	 * to the target element or selection.
	 *
	 * If the selection is collapsed and inside a math element, the panel will be attached to the
	 * entire math element. Otherwise, it will be attached to the selection.
	 *
	 * @private
	 * @returns {module:utils/dom/position~Options}
	 */
	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		const targetMath = this._getSelectedMathElement();

		const target = targetMath ?
			// When selection is inside math element, then attach panel to this element.
			view.domConverter.mapViewToDom( targetMath ) :
			// Otherwise attach panel to the selection.
			view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );

		return { target };
	}

	/**
	 * Returns the math {@math module:engine/view/attributeelement~AttributeElement} under
	 * the {@math module:engine/view/document~Document editing view's} selection or `null`
	 * if there is none.
	 *
	 * **Note**: For a non–collapsed selection the math element is only returned when **fully**
	 * selected and the **only** element within the selection boundaries.
	 *
	 * @private
	 * @returns {module:engine/view/attributeelement~AttributeElement|null}
	 */
	_getSelectedMathElement() {
		const selection = this.editor.editing.view.document.selection;

		if ( selection.isCollapsed ) {
			return findMathElementAncestor( selection.getFirstPosition() );
		} else {
			// The range for fully selected math is usually anchored in adjacent text nodes.
			// Trim it to get closer to the actual math element.
			const range = selection.getFirstRange().getTrimmed();
			const startMath = findMathElementAncestor( range.start );
			const endMath = findMathElementAncestor( range.end );

			if ( !startMath || startMath != endMath ) {
				return null;
			}

			// Check if the math element is fully selected.
			if ( Range.createIn( startMath ).getTrimmed().isEqual( range ) ) {
				return startMath;
			} else {
				return null;
			}
		}
	}
}

// Returns a math element if there's one among the ancestors of the provided `Position`.
//
// @private
// @param {module:engine/view/position~Position} View position to analyze.
// @returns {module:engine/view/attributeelement~AttributeElement|null} Math element at the position or null.
function findMathElementAncestor( position ) {
	return position.getAncestors().find( ancestor => isMathElement( ancestor ) );
}
