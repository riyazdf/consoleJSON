var consoleJSON = consoleJSON || {};

consoleJSON.log = function(json, ruleset) {
  // pretty prints JSON to console according to given ruleset
  // obj is a Javascript object, ruleset is a consoleJSON ruleset
  var beginD = consoleJSON.beginDelimiter(json, ruleset);
  if (beginD) {
    consoleJSON.print(beginD);
  }
  consoleJSON.traverse(json, ruleset, 1);
  var endD = consoleJSON.endDelimiter(json, ruleset);
  if (endD) {
    consoleJSON.print(endD);
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
      var outputIndented = consoleJSON.outputIndented(output, lvl, "    ");
      consoleJSON.print(json);
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
        var beginDIndented = consoleJSON.outputIndented(beginD, lvl, "    ");
        consoleJSON.print(beginDIndented);

        consoleJSON.traverse(el, ruleset, lvl+1);
        var endD = consoleJSON.endDelimiter(el, ruleset);
        var endDIndented = consoleJSON.outputIndented(endD, lvl, "    ");
        if (i < jsonArray.length-1) {
          endDIndented = endDIndented + ",";
        }
        consoleJSON.print(endDIndented);
        break;
      default:
        var output = consoleJSON.outputPrimitive(el, ruleset);
        var outputIndented = consoleJSON.outputIndented(output, lvl, "    ");
        if (i < jsonArray.length-1) {
          outputIndented = outputIndented + ",";
        }
        consoleJSON.print(outputIndented);
    }
  }
};

consoleJSON.traverseObject = function(jsonObj, ruleset, lvl) {
  var keys = Object.keys(jsonObj);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var keyOutput = consoleJSON.outputIndented(consoleJSON.outputKey(key, ruleset), lvl, "    ");
    var val = jsonObj[key];
    var type = $.type(val);
    switch (type) {
      case 'array':
      case 'object':
        var beginD = consoleJSON.beginDelimiter(val, ruleset);
        consoleJSON.print(keyOutput + ": " + beginD);

        consoleJSON.traverse(val, ruleset, lvl+1);
        var endD = consoleJSON.endDelimiter(val, ruleset);
        var endDIndented = consoleJSON.outputIndented(endD, lvl, "    ");
        if (i < keys.length-1) {
          endDIndented = endDIndented + ",";
        }
        consoleJSON.print(endDIndented);
        break;
      default:
        var output = consoleJSON.outputVal(val, ruleset);
        if (i < keys.length-1) {
          output = output + ",";
        }
        consoleJSON.print(keyOutput + ": " + output);
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

consoleJSON.outputIndented = function(output, lvl, delimiter) {
  return delimiter.repeat(lvl) + output;
};

consoleJSON.print = function(target) {
  console.log(target);
};

String.prototype.repeat = function(num) {
  return new Array(num+1).join(this);
};


