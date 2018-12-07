/**
 * Adapted from the linkActionsView CKEditor class:
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 */

/**
 * @module math/ui/mathactionsview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import pencilIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';

import '../../theme/mathactions.css';

/**
 * The math actions view class. This view displays math preview, allows
 * editing the math.
 *
 * @extends module:ui/view~View
 */
export default class MathActionsView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, editor ) {
		super( locale );
		const t = locale.t;
		this.editor = editor;
		// Initializes view handler and creates a button to initialize editing
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		// creates a button to handle editing.
		this.editButtonView = this._createButton( t('Edit math'), pencilIcon, 'edit' );

		this.previewButtonView = this._createPreviewButton();

		/**
		 * A collection of views which can be focused in the view.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._focusables = new ViewCollection();

		/**
		 * Helps cycling over {@math #_focusables} in the view.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-math-actions',
				],

				// https://github.com/ckeditor/ckeditor5-math/issues/90
				tabindex: '-1'
			},

			children: [
				this.previewButtonView,
				this.editButtonView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		const childViews = [
			this.previewButtonView,
			this.editButtonView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
	}

	/**
	 * Focuses the fist {@math #_focusables} in the actions.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * Creates a button view.
	 *
	 * @private
	 * @param {String} label The button label.
	 * @param {String} icon The button's icon.
	 * @param {String} [eventName] An event name that the `ButtonView#execute` event will be delegated to.
	 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
	 */
	_createButton( label, icon, eventName ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.delegate( 'execute' ).to( this, eventName );

		return button;
	}


	_createPreviewButton() {
		const button = new ButtonView( this.locale );
		const bind = this.bindTemplate;
		const t = this.t;
		const command = this.editor.commands.get( 'insertMath' );
		const editor = this.editor;

		button.set( {
			withText: true,
		} );

		button.extendTemplate( {
			attributes: {
				class: [
					'ck',
					'ck-link-actions__preview'
				],
				// href: bind.to( 'href', href => href && ensureSafeUrl( href ) ),
				target: '_blank'
			}
		} );

		button.bind( 'label' ).to( command, 'string' );
		button.template.tag = 'div';
		button.template.eventListeners = {};

		return button;
	}
}
