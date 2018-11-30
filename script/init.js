DecoupledEditor.create( document.querySelector( '.document-editor__editable' ), {} )
.then( editor => {
    const toolbarContainer = document.querySelector( '.document-editor__toolbar' );
    toolbarContainer.appendChild( editor.ui.view.toolbar.element );
    window.editor = editor;
    })
    .catch( err => {
        console.error( err );
} );