# Seamless 50

**Rapid mathematical text editing for labs, papers, and anything else.**

**Seamless 50** is a rich text editor implemented using the CKEditor framework and wrapped in an ElectronJS application. It adds inline computation to the base CKEditor framework. 

Numbers in Seamless documents are treated as floating cells, which functions similarly to cells in a spreadsheet program. Values in the document can be expressed as functions of other cells. When the value of any number in the document is changed, the values of any other values that depend on it will be updated. A dependency tree keeps track of which cells depend on which, and a recursive update function propagates changes throughout the document whenever values are changed, keeping everything in sync in real time.

## Launching Seamless 50

Since Seamless is built using ElectronJS, it is provided prepackaged into a native MacOS app. Simply launch:
 `seamless-50-combined/release-builds/Seamless-50-darwin-x64/Seamless-50.app` to open the app.

The app will open a demo file by default.

## Building Seamless 50
Building Seamless is a two step process. 

First, the editor component (extended from @ckeditor/ckeditor5-editor-decoupled) needs to be built. This will install dependencies and update the ckeditor.js package in seamless-50-combined/editor/build/ckeditor.js

```bash
# Clone this repository
git clone https://github.com/jordanbarkin/seamless-50-combined
# Go into the repository
cd electron-quick-start
# Go into the editor folder
cd editor
# Install editor dependencies
npm install
# Package editor.
npm run build
```

Next, the Electron environment can be initialized.
```bash
# Return to the repository root
cd ..
# Install editor dependencies
npm install
```

The app can be tested without packaging on any platform
```bash
# Run app
npm start
```

Alternatively, the app can be packaged for MacOS, updating the build in `seamless-50-combined/release-builds/Seamless-50-darwin-x64/Seamless-50.app` 
```bash
# Package app
electron-packager . --overwrite --platform=darwin --arch=x64 --prune=true --out=release-builds
```

## Using Seamless

Seamless has simple functionality. Aside from its single new additional new feature, it is a standard rich text editor, with support for standard formatting, images, tables, and undo-redo provided by CKEditor plugins. 

The app will open a demo file by default.

### Math Nodes

**Seamless's unique feature is its inline computation.**

Math nodes can be identified in the document by a yellow border that appears when hovering the cursor over them. Clicking a math node focuses it, changing the border to blue. 

To insert a new node or edit a focused node, click the **Math** icon at the far right edge of the toolbar or press the keyboard command (**⌘+K**).
This will bring up a UI to either insert a **formula** for a new math node or edit the focused one. Optionally, you can name the formula in the **name** field. Click the checkmark or press **enter** to calculate the value of the new formula and insert it into the document. Press **escape** or click the red X to cancel.

**Defining a formula**
Formulas in math nodes can contain a few types of elements: 

- **Constants:** The simplest type of formula is a constant. (eg. 12.3). Constants do not depend on any other value and require no calculation to render.

- **Simple expressions:** Formulas can also contain math expressions, expressed in simple math notation as expected. Examples:
	- 20 + 50.5
	- (20*(50+25.2)*5)/4

- **References:** Most importantly, formnulas can contain references to other formulas in the document. These are delimited by the **@@** delimiter symbol at both sides.

Example: Consider a document containing the following math nodes (name: formula): 
 - (x: 20)
 - (y: 30)
 - (z: 20 + 20) *evaluates to 40 in the document*

Then, for example, any of the following formula would be valid:
 - (x + y + z) *evaluates to 90 in the document*
 - (x*y + y*z*z) *evaluates to 48600 in the document*
 - (x/(y+z)) *evaluates to 15 in the document*

**Editing an existing node and changing its formula will automatically update the values of any nodes that depend on that node. Changes propagate automatically.**

*Thank you for trying Seamless-50. I look forward to continuing development on the project*

*--Jordan Barkin*










