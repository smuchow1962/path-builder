/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Steve Muchow
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict'

module.exports = (function () {
  return {
    parseTree: parseTree,
    generateLines: generateLines
  };

//=========================================================
// exposed functions.
//=========================================================
  function parseTree(inputString) {
    var state = initStateMachine_();
    var root = [];
    var lines = inputString.split("\n");

    // find the indentSpaceSize FIRST. Then pass through again.
    // the first line starting with spaces will define the indent size
    var lastTabNesting = 0;
    var currTabNesting = 0;
    var testString = '';
    lines.some(function (line) {
                 var match = line.match(/^[ \t]+./);
                 if (match !== null) {
                   testString = match[0].slice(0, -1); // if only tabs, then skip
                   var tabcnt = (testString.match(/\t/g) || []).length;
                   // if no tabs and we didn't have a tabbed nesting on the previous
                   // line, then we can assume that this is the spacing
                   if (!tabcnt && !lastTabNesting) {
                     state.establishIndent(testString.length);
                     return true;
                   }
                   // if we have a mix of tabs and spaces, then
                   // prefer any spaces before the first tab, otherwise, grab the next gap
                   // as the preferred one. This may be a string of all spaces too.
                   else if (tabcnt <= testString.length) {
                     lastTabNesting = currTabNesting;
                     currTabNesting = tabcnt; // check for tabs
                     var gaps = testString.match(/[ ]+/);
                     if (testString.charAt(0) == ' ') {
                       // assume the next line is at the same tab level as the previous one
                       state.establishIndent(gaps[0].length / ((lastTabNesting) ? lastTabNesting : 1));
                       return true;
                     }
                     else if (gaps !== null) {
                       state.establishIndent(gaps.pop().length);
                       return true;
                     }
                   }
                 }
                 return false;
               }
    );

    state.verifyTabSpacing();
    constructTree_(state, root, lines);

    return root;
  }

  /*
   {
   prefix : 'c:\',
   separator : '\'
   }
   */
  function generateLines(inputString, options) {
    options = options || {prefix: './', separator: '/'};
    options.prefix = options.prefix || './';
    options.separator = options.separator || '/';

    var root = parseTree(inputString);
    var convertedObjs = [];
    var paths = [];
    root.forEach(function (lineObj) {
      var converted = convertObjToPathObj_(lineObj);
      convertedObjs.push(converted);
      var path = options.prefix + makePath_(converted, convertedObjs, options.separator);
      paths.push(path);
    });

    return paths;
  }

//=========================================================
// support functions.
//=========================================================
  function leftPad(width, string, padding) {
    return (width <= string.length) ? string : leftPad(width, padding + string, padding)
  }

  function initStateMachine_() {
    var state = { // private state machine info
      arrayIndex: 0,    // index into current flat array

      lastDirIndex: -1, // directory info
      lastDirDepth: 0,
      currDirTrail: [],

      fileDirIndex: 0,     // added when first file is indented

      lastLineDepth: 0,
      currLineDepth: 0,
      indentSpaceSize: 0,
      indentString: '',
      primeDirectory: -1,

      verifyTabSpacing: function () {
        if (this.indentSpaceSize == 0) {
          this.establishIndent(2);
        }
      },
      establishIndent: function (indent) {
        this.indentSpaceSize = indent;
        this.indentString = leftPad(indent, "", " ");
      },
      advanceIndex: function () {
        ++this.arrayIndex;
      },
      update: function () {
        this.lastLineDepth = this.currLineDepth;
      },
      reset: function (name) {
//        this.lastLineDepth = this.currLineDepth = 0;
        var str = "---" + this.arrayIndex + "-" + name + " state:" + JSON.stringify(this);
        //console.log(str);
        if (this.primeDirectory == -1 && name.search(/\*/) == -1) {
          this.primeDirectory = this.arrayIndex;
        }
        this.lastLineDepth = this.currLineDepth = 0;
        this.currDirTrail = [];
        this.fileDirIndex = this.arrayIndex;
        this.lastDirIndex = this.arrayIndex;
        this.lastDirDepth = 0;
        this.fileCount = 0;
      },
      setDepth: function (depth, isFile, name) {
        this.currLineDepth = depth;
        this.fileCount += isFile;
        //console.log(this.arrayIndex + "-" + name + " state:" + JSON.stringify(this));
        if (isFile) {
          this.adjustFileState(name);
        }
        else {
          this.fileCount = 0;
          this.adjustDirectoryState(name);
        }
      },
      adjustDirectoryState: function (name) {
        if (this.primeDirectory == -1) {
          this.primeDirectory = this.arrayIndex;
        }
        if (this.lastDirDepth > this.currLineDepth) { // backdent
          var backup = this.primeDirectory;
          while (this.currDirTrail.length > this.currLineDepth) {
            backup = this.currDirTrail.pop();
          }
          this.lastDirDepth = this.currDirTrail.length;
          if (this.lastDirDepth == 0) {
            this.primeDirectory = backup;
          }
        }
        else if (this.lastDirDepth < this.currLineDepth) {
          this.currDirTrail.push(this.lastDirIndex);
          this.currLineDepth = this.lastDirDepth + 1; // normalize outrageous indents
        }
        this.lastDirDepth = this.currDirTrail.length;
        this.lastDirIndex = this.arrayIndex;
      },
      adjustFileState: function (name) {
        // FIRST FILE
        var diff = this.currLineDepth - this.lastDirDepth;
        if (this.fileCount == 1) {
          if (diff > 0) {
            this.currDirTrail.push(this.lastDirIndex);
            this.lastDirDepth++;
          }
          else if (diff < 0) {
            while (diff < 0) {
              this.lastDirIndex = this.currDirTrail.pop();
              diff++;
            }
            this.lastDirDepth = this.currDirTrail.length - 1;
            if (this.lastDirDepth == 0) {
              this.lastDirIndex = this.primeDirectory;
            }
          }
        }
        // SUBSEQUENT FILES
        else {
          while (diff < 0) {
            this.currDirTrail.pop();
            diff++;
          }
          this.lastDirDepth = this.currDirTrail.length;
          if (this.lastDirDepth == 0) {
            this.lastDirIndex = this.primeDirectory;
          }
        }
      },
      makeKey: function () {
        var str = '-1';
        if (this.currDirTrail.length) {
          str = this.currDirTrail.toString();
        }
        str += ',' + this.arrayIndex;
        return str;
      }
    };
    return state;
  }

  function jsonNewObjectToArray_(array, state, name) {
    var key = state.makeKey();
    var newObj = {};
    newObj[key] = name;
    array.push(newObj);
    //console.log(JSON.stringify(newObj));
    return array;
  }

  function constructTree_(state, destArray, lines) {

    lines.forEach(function (line) {
      if (line.length > 0) {
        var match = line.match(/^[ \t]+./);    // find a valid line (whitespace, then a character). Will be null if no
        var isFile = (line.indexOf('*') != -1);  // whitespace. That means beginning of line (topmost dir level).
        if (match !== null) { // found indenting
          state.update();

          line = line.replace(/\t/g, state.indentString); // convert tabs to spaces.
          match = line.match(/^[ ]+./);                   // and count the whitespace
          var name_ = line.trim();                        // get the text item as well

          state.setDepth(Math.floor((match[0].length - 1) / state.indentSpaceSize), isFile, name_);
          jsonNewObjectToArray_(destArray, state, name_);
        }
        else if (isFile) {
          state.setDepth(0, isFile, line);
          jsonNewObjectToArray_(destArray, state, line);
        }
        else if (line.search(/.+/) != -1) { // verify not an empty line
          state.reset(line);
          jsonNewObjectToArray_(destArray, state, line);
        }
        state.advanceIndex();
      }
    });
    //console.log(state.arrayIndex + "-" + "<<<end" + " state:" + JSON.stringify(state));

    return destArray;
  }

  function convertObjToPathObj_(obj) {
    var newObj = {};
    var keys = Object.keys(obj);
    newObj.value = obj[keys[0]];
    newObj.key = keys[0];
    newObj.indices = newObj.key.split(',');
    newObj.idx = newObj.indices.pop();
    return newObj;
  }

  function makePath_(obj, array, separator) {
    //console.log("obj: " + JSON.stringify(obj));
    var str = '';
    if (obj.indices[0] != -1) {
      obj.indices.forEach(function (idx) {
        var strVal = array[idx].value;
        str += strVal + separator;
      });
    }
    if (obj.value.charAt(0) == '*') {
      str += obj.value.substring(1);
    }
    else {
      str += obj.value + separator;
    }
    //console.log(str);
    return str;
  }

})
();
