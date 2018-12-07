import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import '../theme/math.css';

// Counter for the unique IDs for each math node
var _currentMaxUUID = 0;

// The symbol marking named variables.
const VARIABLE_DELIMITER = '@@'

// The MathNode class is the model for each math element's dataNode objec.
// It contains all of the data and methods necessary for keeping the tree of
// numerical values in the documnent organized.
export default class MathNode {

	constructor(parentElementPointer, name, rawData) {
		this.editor = window.editor;
		this._name = (name ? name : null);
		this._rawData = rawData;
		this._parentElementPointer = parentElementPointer;
		this._UUID = _currentMaxUUID;

		this._computedValue = 0;
		this._renderedValue = 0;
		this._errorState = false;
		this._tokenizedData = [];
		this._dependencies = new Set();
		this._children = new Set();

		this.update(true);

		_currentMaxUUID++;
	}
	// Updates the formula for a node and propagates changes through children.
	updateRawData(newData) {
		this._rawData = newData;
		this.update();

		for(var child of this._children) {
			let childNode = child.dataNode;
			childNode.update();
		}
	}

	// Ensures that the formula stored in _rawValue is reflected in the _computedValue and
	// renderedValue, fields, and pushes the changes to the document model and eventually the DOM.
	update(firstRender) {
		this._errorState = false;
		console.log("updating");
		this._tokenizeData();
		if(!this._errorState) {
			this._computeValue();
		}
		this._render(firstRender);

	}

	// Tokenizes the formula string stored in rawData and builds an array
	// of TokenizedMathFragments that can be processed for computation and rendering.
	_tokenizeData() {
		this._tokenizedData = [];
		this._dependencies = new Set();

		var currentlyOnVar = false;
		let rawDataString = " " + this._rawData + " ";
		var tokenizedString = rawDataString.split(VARIABLE_DELIMITER).reverse();

		if(tokenizedString.length % 2 === 0) {
			throw "mismatched delimiters";
		}

		while(tokenizedString.length > 0) {
			if(currentlyOnVar) {
				var current = new TokenizedMathVariable(tokenizedString.pop());
				this._tokenizedData.push(current);
				var targetedElement = current.getTargetedElement();
				if(targetedElement == null) {
					this.setErrorState(true);
				}
				else {
					this._dependencies.add(targetedElement);
					targetedElement.dataNode.addChild(this.getParentElementPointer());
				}
			}
			if(!currentlyOnVar) {
				this._tokenizedData.push(new TokenizedMathConstant(tokenizedString.pop()));
			}
			currentlyOnVar = !currentlyOnVar;
		}
	}

	// Computes the local value and propagates changes to the node's children.
	_computeValue() {
		this._localEvaluate();
		console.log("computing " + [this._children]);
		for(let element of this._children) {
			console.log("computing " + element);
			element.dataNode._computeValue();
		}
	}


	// Parses the tokenized data into an evaluatable string.
	_localEvaluate() {
		let parsable = "";
		let data = this._tokenizedData;

		for(var i = 0; i < data.length; i++) {
			if(data[i] instanceof TokenizedMathConstant) {
				parsable += data[i].getRawData();
			}
			else {
				let currentElement = data[i].getTargetedElement();
				parsable +=currentElement.dataNode.getComputedValue();
			}
		}

		this._computedValue = this._applyComputation(parsable);
	}

	// Safely evaluates data to fill _computedValue()
	_applyComputation(data) {
		console.log(data);
		try {
			return eval(data);
		}
		catch(err) {
			return "ERROR";
		}
	}

	// Renders _computedValue with
	_render(firstRender) {
		if(this._errorState || this._computedValue == null || isNaN(this._computedValue)) {
			this._errorState = true;
			this._renderedValue = "ERROR";
		}

		else {
			this._renderedValue = this.applyRendering(this._computedValue, null);
		}

		if(!firstRender) {
			let modelElement = this.getParentElementPointer();
			let textElement = modelElement.getChild(0);
			this.editor.model.change( writer => {
				writer.remove(textElement);
				writer.insertText(String(this._renderedValue), modelElement);
			} );
		}
	}

	applyRendering(value, renderFormat) {
		return value; //TODO
	}

	addChild(element) {
		this._children.add(element);
	}


	// Processes the deletion of a node on the model side.
	// Removes the pointers from its dependencies and dependents.
	removeFromTree() {
		editor.mathElements.splice(editor.mathElements.indexOf(this.getParentElementPointer()), 1);
		for(var element of this._children) {
			// element.dataNode._dependencies.delete(this.getParentElementPointer());
			element.dataNode.update();
		}
		for(var element of this._dependencies) {
			element.dataNode._children.delete(this.getParentElementPointer());
		}
	}

	//——————————————————————————-----------

	setErrorState(errorState) {
		this._errorState = errorState;
	}

	getErrorState(errorState) {
		return this._errorState;
	}

	getName() {
		return this._name;
	}

	getRawData() {
		return this._rawData;
	}

	getRenderedValue() {
		return this._renderedValue;
	}

	getComputedValue() {
		return this._computedValue;
	}

	getUUID() {
		return this._UUID;
	}

	getParentElementPointer() {
		return this._parentElementPointer;
	}

	setName(name) {
		this._name = name;
	}

	setParentElementPointer(parentElementPointer) {
		this._parentElementPointer = parentElementPointer;
	}

	_setRawData(rawData) {
		this._rawData = rawData;
	}

	_setRenderedValue(renderedValue) {
		this._renderedValue = renderedValue;
	}

	_setComputedValue(renderedValue) {
		this._computedValue = computedValue;
	}

	_setUUID(UUID) {
		this._UUID = UUID;
	}
}

// -------------------------

// The TokenizedMathFragment class is a parent class
// for the different types of data stores in rawData.
class TokenizedMathFragment {
	constructor(rawData) {
		this._rawData = rawData;
		if (new.target === TokenizedMathFragment) {
			throw new TypeError("Cannot construct TokenizedMathFragment instances directly");
		}
	}

	setRawData(rawData) {
		this._rawData = rawData;
	}

	getRawData() {
		return this._rawData;
	}
}

// A TokenizedMathConstant is a string of computable math with
// no dependencies.
class TokenizedMathConstant extends TokenizedMathFragment{
	constructor(rawData) {
		super(rawData);
	}
}


// A TokenizedMathVariable represents a reference to another
// node in the rawData of a MathNode.
class TokenizedMathVariable extends TokenizedMathFragment{
	constructor(rawData) {
		super(rawData);
		this._targetedElement = null;
		for(var i = 0; i < editor.mathElements.length; i++) {
			let currentElement = editor.mathElements[i];
			if((currentElement.dataNode.getName() === rawData) || (currentElement.dataNode.getUUID() == rawData)) {
				this._targetedElement = currentElement;
				break;
			}
		}
	}

	setTargetedElement(targetedElement) {
		this._targetedElement = targetedElement;
	}

	getTargetedElement() {
		return this._targetedElement;
	}
}
