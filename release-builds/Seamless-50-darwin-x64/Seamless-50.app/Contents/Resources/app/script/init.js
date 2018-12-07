DecoupledEditor.create( document.querySelector( '.document-editor__editable' ), {} )
.then( editor => {
    const toolbarContainer = document.querySelector( '.document-editor__toolbar' );
    toolbarContainer.appendChild( editor.ui.view.toolbar.element );
    window.editor = editor;
 	window.editor.insertMath(editor, "457", "first");
 	window.editor.insertMath(editor, "20 + @@first@@", "second");
    })
    .catch( err => {
        console.error( err );
} );