// /**
//  * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
//  * For licensing, see LICENSE.md.
//  */

// /**
//  * @module math/mathediting
//  */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastAttributeToElement,  downcastAttributeToAttribute} from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute, upcastAttributeToAttribute} from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import MathCommand from './mathcommand';
import UnmathCommand from './unmathcommand';
import { createMathElement, ensureSafeUrl } from './utils';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import findMathRange from './findmathrange';
import '../theme/math.css';

import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

var _currentMaxUUID = 0;
const VARIABLE_DELIMITER = '@@'

export default class MathNode {
  constructor(name, rawData) {
    this.editor = window.editor;    
    this._name = (name ? name : null);
    this._rawData = rawData;
    this._computedValue = 0;
    this._renderedValue = this._computedValue;
    this._UUID = _currentMaxUUID;
    this._tokenizedData = [];
    this._dependencies = new Set();

    this._tokenizeData();
    this._computeValue();

    _currentMaxUUID++;
  }

  _tokenizeData() {
    this._tokenizedData = [];
    this._dependencies = new Set();

    var currentlyOnVar = this._rawData.substring(0,2) === VARIABLE_DELIMITER;
    let rawDataString = " " + this._rawData + " ";
    var tokenizedString = rawDataString.split(VARIABLE_DELIMITER).reverse();
    
    if(tokenizedString.length % 2 === 0) {
      throw "mismatched delimiters";
    }
    
    while(tokenizedString.length > 0) {
      if(currentlyOnVar) {
        var current = new TokenizedMathVariable(tokenizedString.pop());
        this._tokenizedData.push(current);
        this._dependencies.add(current.getTargetedElement());
      }
      if(!currentlyOnVar) {
        this._tokenizedData.push(new TokenizedMathConstant(tokenizedString.pop()));
      }
      currentlyOnVar = !currentlyOnVar;
    }
        // this._tokenizedData = this._tokenizedData.reverse();
  }
  
  _computeValue() {
    for(i in this._dependencies) {
      this._dependencies._computeValue();
    }
    
    this._localEvaluate();
  }
  
  
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
    this._renderedValue = this._computedValue;
  }

  
  _applyComputation(data) {
    console.log(data);
    return eval(data);
  }

  updateRawData(newData) {
    this._rawData = newData;
    this._tokenizeData();
    this._computeValue();
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
  
  setName(name) {
    this._name = name;
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

// MathNode.currentUUID = 0;

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

class TokenizedMathConstant extends TokenizedMathFragment{
  constructor(rawData) {
    super(rawData);
  }
}

class TokenizedMathVariable extends TokenizedMathFragment{
  constructor(rawData) {
    super(rawData);
    this._targetedElement = null;
    for(var i = 0; i < editor.mathElements.length; i++) {
      let currentElement = editor.mathElements[i];
      if((currentElement.dataNode.getName() === rawData || currentElement.dataNode.getUUID() === rawData)) {
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
