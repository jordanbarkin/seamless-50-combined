# Seamless 50

**Rapid mathematical text editing for labs, papers, and anything else.**

##  Overview

Seamless is implemented using the open-source CKEditor framework and wrapped in an ElectronJS application. The Electron instance renders a single page, `html.js`, which contains an instance of the text editor itself. The editor is built using the rich text editor framework [CKEditor 5](https://ckeditor.com/docs/ckeditor5/latest/framework/index.html). 

CKEditor `builds` are created by combining an editor `base` with a series of `plugins`. The base provides a bare-bones virtual DOM model and render engine, and every additional feature is its own, self-contained plugin. CKEditor provides plugins adding most standard text editor functionality as modules hosted on [npm](https://www.npmjs.com). The plugins are listed as dependencies in the `/editor/package.json` and loaded in `/editor/src/ckeditor.js`.

To create Seamless, I wrote a new plugin for CKEditor and integrated it into a custom `build`. The source files for my plugin are in `/editor/src/plugins/math`, and the editor build is stored in `/editor/build/ckeditor.js`, and initialized by `/script/init.js`.

 
### Directory Tree
<pre>
Seamless-50 
├── DESIGN.md
├── README.md
├── <b>editor</b> — <i>Contains the CKEDitor source and build with Seamless added.</i>
│   ├── LICENSE.md
│   ├── build
│   │   └── <b>ckeditor.js</b> — <i>The CKEditor build generated by 'npm run build'</i>
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── <b>ckeditor.js</b> — <i>The root of the editor instance.</i>
│   │   └── plugins
│   │       └── math
│   │           ├── src
│   │           │   ├── <b>math.js</b> — <i>A "glue" plugin: combines all of the math source into one module</i>
│   │           │   ├── <b>mathcommand.js</b> — <i>Handles execution of math insertion.</i>
│   │           │   ├── <b>mathediting.js</b> — <i>The editing engine component.</i>
│   │           │   ├── <b>mathnode.js</b> — <i>The mathNode model class.</i>
│   │           │   ├── <b>mathui.js</b> — <i>Initializes and maintains the form and action UI</i>
│   │           │   └── ui
│   │           │       ├── <b>mathactionsview.js</b> — <i>Defines the edit UI overlay.</i>
│   │           │       └── <b>mathformview.js</b> — <i>Defines the insert UI overlay.</i>
│   │           └── <b>theme</b> — <i>Contains CKEditor CSS, modified to fit the electron app.</i>
│   │               ├── icons
│   │               │   └── math.svg
│   │               ├── math.css
│   │               ├── mathactions.css
│   │               └── mathform.css
│   └── webpack.config.js
├── <b>index.html</b> — <i>The root page rendered by Electron.</i>
├── <b>main.js</b> — <i>The electron app root.</i>
├── package.json
├── release-builds
│   └── <b>Seamless-50-darwin-x64</b> — <i>The MacOS app built by electron-packager.</i>
├── renderer.js
└── script
    └── <b>init.js</b> — <i>Creates the editor instance and attaches it to index.html.</i>
</pre>

## Math Plugin Implementation Details
### Structure and Schema
The CKEditor document model consists of two synchronized components: 
- The `Model` class defines a virtual DOM, which stores the document semantically in a tree of `Node` objects
- The `View` class defines a second DOM, this time containing HTML that is rendered in the browser.

The two trees are synchronized using a series of `UpcastConverter` and `DowncastConverter` objects, which specify how data input into the DOM can be converted to model `Node` objects by predefined `Schema` objects.

#### Engine
Core engine support (schema, upcasting, downcasting) for math data is added in the `/editor/src/plugins/math/mathediting.js` class. New schema is registered to the model, and converters are added. In addition, methods to insert, edit, and focus math nodes are defined and added to the editor.

Finally, event handlers for deleting math and clicking on math nodes are added.

The `InsertMathCommand` class defined in `/editor/src/plugins/math/mathcommand.js` handles the insertion of new data into the model and is initialized in the MathEditing class. 

#### Math Node
The `/editor/src/plugins/math/mathnode.js` file contains the definition for the `MathNode` class. Each math element added to the model has a `MathNode` property called `dataNode`. 

The basic properties of a `MathNode` are: `_name`, `_rawData`, `_computedValue`, and `_UUID`. In addition, each  node contains a `_tokenizedData` field, which maintains a parsable tokenization of `_rawData` in the form of an array of `_TokenizedMathFragment` objects, which is defined later in the file. 

To maintain the relational tree between nodes, each `_MathNode` has two Sets: `_dependencies`, which contains all of the nodes upon which the node is dependent, and `_children`, which contains the nodes dependent on the node.

The tree structure is self maintained; the `update()` `_computeValue()`, `_localEvaluate()`, and `_applyComputation()` methods ensure that both arrays stay updated when the `_removeFromTree()` and `updateRawData()` methods are invoked by events. 

#### User Interface

The user interface is defined as a separate plugin in `/editor/src/plugins/math/mathui.js` It initialized the two views in `/editor/src/plugins/math/ui/` and shows and hides them in response to events from the user or the engine.

#### Wrapping Things Up
The engine and user interface classes are combined into a single `exported` module in `/editor/src/plugins/math/math.js`, which is then included in the build by the '/editor/src/ckeditor.js' file. When `npm run build` is executed, Webpack adds all of the components of the math plugin to `/editor/build/ckeditor.js`, and the plugin becomes active in the Electron app. 



