var consoleJSON = consoleJSON || {};
var ruleset = ruleset || {};

var DELIMITER = "  ";
var LINE_LENGTH = 80;

consoleJSON.log = function(json, ruleset) {
  // pretty prints JSON to console according to given ruleset
  // obj is a Javascript object, ruleset is a consoleJSON ruleset
  var beginD = consoleJSON.beginDelimiter(json, ruleset);
  if (beginD) {
    consoleJSON.startGroup(beginD, 0, DELIMITER);
  }
  consoleJSON.traverse(json, ruleset, 1);
  var endD = consoleJSON.endDelimiter(json, ruleset);
  if (endD) {
    consoleJSON.print(endD, 0, DELIMITER);
    consoleJSON.endGroup();
  }
  //console.log(json);
};

consoleJSON.traverse = function(json, ruleset, lvl) {
  // traverses the json tree
  // lvl is the depth of the current node (for indentation) 
  var type = $.type(json);
  switch (type) {
    case 'array':
      consoleJSON.traverseArray(json, ruleset, lvl);
      break;
    case 'object':
      consoleJSON.traverseObject(json, ruleset, lvl);
      break;
    default:
      var output = consoleJSON.outputPrimitive(json, ruleset);
      consoleJSON.print(output, lvl, DELIMITER);
  }
};

consoleJSON.traverseArray = function(jsonArray, ruleset, lvl) {
  for (var i = 0; i < jsonArray.length; i++) {
    el = jsonArray[i];
    var type = $.type(el);
    switch (type) {
      case 'array':
      case 'object':
        var beginD = consoleJSON.beginDelimiter(el, ruleset);
        consoleJSON.startGroup(beginD, lvl, DELIMITER);

        consoleJSON.traverse(el, ruleset, lvl+1);
        
        var endD = consoleJSON.endDelimiter(el, ruleset);
        if (i < jsonArray.length-1) {
          endD = endD + ",";
        }
        consoleJSON.print(endD, lvl, DELIMITER);
        consoleJSON.endGroup();
        break;
      default:
        var output = consoleJSON.outputPrimitive(el, ruleset);
        if (i < jsonArray.length-1) {
          output = output + ",";
        }
        consoleJSON.print(output, lvl, DELIMITER);
    }
  }
};

consoleJSON.traverseObject = function(jsonObj, ruleset, lvl) {
  var ruleset = ruleset || {};
  var keys = Object.keys(jsonObj);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var keyOutput = consoleJSON.outputKey(key, ruleset);
    var val = jsonObj[key];
    var valType = $.type(val);
    if (!('filter' in ruleset) || ('filter' in ruleset && key == ruleset['filter'])) {
      switch (valType) {
        case 'array':
        case 'object':
          delete ruleset['filter']
          var beginD = consoleJSON.beginDelimiter(val, ruleset);
          consoleJSON.startGroup(keyOutput + ": " + beginD, lvl, DELIMITER);
      
          consoleJSON.traverse(val, ruleset, lvl+1);
          
          var endD = consoleJSON.endDelimiter(val, ruleset);
          if (i < keys.length-1) {
            endD = endD + ",";
          }
          consoleJSON.print(endD, lvl , DELIMITER);
          consoleJSON.endGroup();
          break;
        default:
          var output = consoleJSON.outputVal(val, ruleset);
          if (i < keys.length-1) {
            output = output + ",";
          }
          consoleJSON.print(keyOutput + ": " + output, lvl, DELIMITER);
      }
    } else if (valType == 'array' || valType == 'object') {
      consoleJSON.traverse(val, ruleset, lvl);
    }
  }
};

consoleJSON.beginDelimiter = function(json, ruleset) {
  var type = $.type(json);
  switch (type) {
    case 'array':
      return '[';
      break;
    case 'object':
      return '{';
      break;
    default:
      return null;
  }
};

consoleJSON.endDelimiter = function(json, ruleset) {
  var type = $.type(json);
  switch (type) {
    case 'array':
      return ']';
      break;
    case 'object':
      return '}';
      break;
    default:
      return null;
  }
};

consoleJSON.outputPrimitive = function(json, ruleset) {
  var type = $.type(json);
  switch (type) {
    case 'string':
      return '\"' + json + '\"';
      break;
    default:
      return json;
  } 
};

consoleJSON.outputKey = function(json, ruleset) {
  return consoleJSON.outputPrimitive(json, ruleset);
}

consoleJSON.outputVal = function(json, ruleset) {
  return consoleJSON.outputPrimitive(json, ruleset);
}

// TODO: this also breaks words apart. fix this
consoleJSON.indentWrap = function(target, indentationLvl, delimiter) {
  var indent = delimiter.repeat(indentationLvl);
  var remainingLen = LINE_LENGTH - indent.length;
  var result = "";
  var currPos = 0;
  while (currPos+remainingLen < target.length) {
    result += indent + target.substring(currPos,currPos+remainingLen) + "\n";
    currPos += remainingLen;
  }
  result += indent + target.substring(currPos);
  return result;
};

consoleJSON.print = function(target, indentationLvl, delimiter) {
  var output = consoleJSON.indentWrap(target, indentationLvl, delimiter);
  console.log(output);
};

consoleJSON.startGroup = function(target, indentationLvl, delimiter) {
  var output = consoleJSON.indentWrap(target, indentationLvl, delimiter);
  console.group(output);
};

consoleJSON.endGroup = function() {
  console.groupEnd();
};

consoleJSON.filter = function(json, filterKey) {
  ruleset['filter'] = filterKey;
  consoleJSON.log(json, ruleset);
  delete ruleset['filter'];
}
// From http://stackoverflow.com/questions/202605/repeat-string-javascript
String.prototype.repeat = function(num) {
  return new Array(num+1).join(this);
};


