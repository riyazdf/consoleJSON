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
  if (json instanceof Array) {
    
  } else if (typeof json === 'object') {
    return '{';
  }
  
};

consoleJSON.beginDelimiter = function(json, ruleset) {
  var type = jQuery.type(json);
  if (json !== null) {
    if (json instanceof Array) {
      return '[';
    }
    else if (typeof json === 'object') {
      return '{';
    }
  }
  return null;
};

consoleJSON.endDelimiter = function(json, ruleset) {
  if (json !== null) {
    if (json instanceof Array) {
      return ']';
    }
    else if (typeof json === 'object') {
      return '}';
    }
  }
  return null;
};

consoleJSON.print = function(string) {
  console.log(string);
};

