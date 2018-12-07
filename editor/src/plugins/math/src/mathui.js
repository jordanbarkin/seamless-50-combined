import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import Range from '@ckeditor/ckeditor5-engine/src/view/range';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import MathFormView from './ui/mathformview';
import MathActionsView from './ui/mathactionsview';

// import { isMathElement } from './utils';
import mathIcon from '../theme/icons/math.svg';

const mathKeystroke = 'Ctrl+K';

/**
 * The master MathUI file. It adds the toolbar button, the UI tooltip, and support for the Ctrl+K keyboard shortcut.
 * The format of this plugin is adapted from CKEditor's sample plugin tutorial.
 *
 * It uses the
 * {@math module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
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
		this.actionsView = this._createActionsView();

		/**
		 * The form view displayed inside the balloon.
		 *
		 * @member {module:math/ui/mathformview~MathFormView}
		 */
		this.formView = this._createFormView();

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		// Create toolbar buttons and enable the UI.
		this._createToolbarMathButton();
		this._enableUserBalloonInteractions();
	}

	/**
	 * Creates the {@math module:math/ui/mathactionsview~MathActionsView} instance.
	 *
	 * @private
	 * @returns {module:math/ui/mathactionsview~MathActionsView} The math actions view instance.
	 */
	_createActionsView() {

		const editor = this.editor;
		const actionsView = new MathActionsView( editor.locale, this.editor );
		const mathCommand = editor.commands.get( 'insertMath' );

		// Hide the panel after clicking the "Cancel" button.
		this.listenTo( actionsView, 'edit', () => {
			// cancel();

			if ( mathCommand.isEnabled ) {
				this._showUI();
			}
		} );

		// Close the panel on esc key press
		actionsView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		// Open the form view on Ctrl+K
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
	_createFormView() {
		const editor = this.editor;
		const formView = new MathFormView( editor.locale );
		const mathCommand = editor.commands.get( 'insertMath' );

		formView.urlInputView.bind( 'value' ).to( mathCommand, 'value' );

		// Form elements should be read-only when corresponding commands are disabled.
		formView.urlInputView.bind( 'isReadOnly' ).to( mathCommand, 'isEnabled', value => !value );
		formView.saveButtonView.bind( 'isEnabled' ).to( mathCommand );

		// Execute math command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			editor.execute( 'insertMath', formView.urlInputView.inputView.element.value );
			this._removeFormView();
			this._hideUI();
		} );

		// Hide the panel after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._removeFormView();
		} );

		// Close the panel on esc key press when the **form has focus**.
		formView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._removeFormView();
			cancel();
		} );

		return formView;
	}

	// ******************************************************************************************************
	// ******************************************************************************************************
	// ******************************************************************************************************
	// ********** Below this point, HEAVILY copied from CKEditor LinkUI plugin with modifications ***********
	// ******************************************************************************************************
	// ******************************************************************************************************
	// ******************************************************************************************************

	/**
	 * Creates a toolbar Math button. Clicking this button will show
	 * a {@math #_balloon} attached to the selection.
	 *
	 * @private
	 */
	_createToolbarMathButton() {
		const editor = this.editor;
		const mathCommand = editor.commands.get('insertMath');
		const t = editor.t;

		// Handle the `Ctrl+K` keystroke and show the panel.
		editor.keystrokes.set( mathKeystroke, ( keyEvtData, cancel ) => {
			// Prevent focusing the search bar in FF and opening new tab in Edge. #153, #154.
			cancel();

			if ( mathCommand.isEnabled ) {
				this._showUI();
			}
		} );

		editor.ui.componentFactory.add( 'insertMath', locale => {
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
	_addFormView(editing) {
		if ( this._isFormInPanel ) {
			return;
		}

		const editor = this.editor;
		const mathCommand = editor.commands.get( 'insertMath' ); ;

		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		if(editor.focusedMathElement == null) {
			this.formView.urlInputView.inputView.element.value = '';
		}
		else {
			this.formView.urlInputView.inputView.element.value = editor.focusedMathElement.getRawData();
		}
		this.formView.urlInputView.select();
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
		const mathCommand = editor.commands.get( 'insertMath' );
		// editor.update
		if ( !mathCommand.isEnabled ) {
			return;
		}

		this._addActionsView();
		this._addFormView();

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
			}
			else {
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
	return position.getAncestors().find( ancestor => (ancestor.dataNode != null) );
}
