/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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

import { ensureSafeUrl } from '../utils';

import unmathIcon from '../../theme/icons/unmath.svg';
import pencilIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';
import '../../theme/mathactions.css';

/**
 * The math actions view class. This view displays math preview, allows
 * unmathing or editing the math.
 *
 * @extends module:ui/view~View
 */
export default class MathActionsView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const t = locale.t;

		/**
		 * Tracks information about DOM focus in the actions.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@math module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * The raw preview view.
		 *
		 * @member {module:ui/view~View}
		 */
		this.previewButtonView = this._createPreviewButton();

		/**
		 * The unmath button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.unmathButtonView = this._createButton( t( 'Unmath' ), unmathIcon, 'unmath' );

		/**
		 * The edit math button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.editButtonView = this._createButton( t( 'Edit math' ), pencilIcon, 'edit' );

		/**
		 * Value of the "raw" attribute of the math to use in the {@math #previewButtonView}.
		 *
		 * @observable
		 * @member {String}
		 */
		this.set( 'raw' );

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
				this.editButtonView,
				this.unmathButtonView
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
			this.editButtonView,
			this.unmathButtonView
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

	/**
	 * Creates a math raw preview button.
	 *
	 * @private
	 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
	 */
	_createPreviewButton() {
		const button = new ButtonView( this.locale );
		const bind = this.bindTemplate;
		const t = this.t;

		button.set( {
			withText: true,
			tooltip: t( 'Open math in new tab' )
		} );

		button.extendTemplate( {
			attributes: {
				class: [
					'ck',
					'ck-math-actions__preview'
				],
				raw: bind.to( 'raw', raw => raw && ensureSafeUrl( raw ) ),
				target: '_blank'
			}
		} );

		button.bind( 'label' ).to( this, 'raw', raw => {
			return raw || t( 'This math has no URL' );
		} );

		button.bind( 'isEnabled' ).to( this, 'raw', raw => !!raw );

		button.template.tag = 'a';
		button.template.eventListeners = {};

		return button;
	}
}

/**
 * Fired when the {@math #editButtonView} is clicked.
 *
 * @event edit
 */

/**
 * Fired when the {@math #unmathButtonView} is clicked.
 *
 * @event unmath
 */
