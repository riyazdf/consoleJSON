var consoleJSON = consoleJSON || {};
consoleJSON.Util = consoleJSON.Util || {};

// TODO: remove this
var ruleset = ruleset || {};

var DELIMITER = "  ";
var LINE_LENGTH = 80;

consoleJSON.TYPES = {
  FILTER : "filter",
  STYLE : "style",
  FORMAT : "format"
};

consoleJSON.TARGETS = {
  KEY : "key",
  VAL : "val",
  KEY_AND_VAL : "key_and_val",
  NUM : "num",
  STR : "str",
  BOOL : "bool",
  NULL : "null",
  UNDEF : "undef",
  UNUSED : "unused"
};

consoleJSON.ATTRS = {
  HIDE : "hide",
  REMOVE : "remove",
  HIGHLIGHT : "highlight",
  FONT_COLOR : "font_color",
  FONT_SIZE : "font_size",
  FONT_STYLE : "font_style",
  FONT_FAMILY : "font_family",
  LINE_LEN : "line_length",
  INSERT_NEWLINE : "insert_newline",
  INDENT_AMT : "indent_amt"
};

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
  // Traverses an array data type (called from traverse)
  // Handles delimiters and groupings, and other printing rules for arrs
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
  // Traverses an object data type (called from traverse)
  // Handles delimiters and groupings, and other printing rules for objs
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
          var filterKeyToPutBack = ruleset['filter'];
          delete ruleset['filter']
          var beginD = consoleJSON.beginDelimiter(val, ruleset);
          consoleJSON.startGroup(keyOutput + ": " + beginD, lvl, DELIMITER);
      
          consoleJSON.traverse(val, ruleset, lvl+1);
          ruleset['filter'] = filterKeyToPutBack;
          
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
  // Function to handle the opening delimiter for arrays, objs, etc.
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
  // Function to handle the closign delimiter for arrays, objs, etc.
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
  // Prints a primitive to the output, subject to a ruleset
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
  // Prints a key to the output, subject to a ruleset
  return consoleJSON.outputPrimitive(json, ruleset);
}

consoleJSON.outputVal = function(json, ruleset) {
  // Prints a value to the output, subjec to a ruleset
  return consoleJSON.outputPrimitive(json, ruleset);
}

// TODO: this also breaks words apart. fix this
consoleJSON.indentWrap = function(target, indentationLvl, delimiter) {
  // A function to handle word wrapping in the console output
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
  // Function to write word-wrapped data to console output
  var output = consoleJSON.indentWrap(target, indentationLvl, delimiter);
  console.log(output);
};

consoleJSON.startGroup = function(target, indentationLvl, delimiter) {
  // Begin a console grouping
  var output = consoleJSON.indentWrap(target, indentationLvl, delimiter);
  console.group(output);
};

consoleJSON.endGroup = function() {
  // Finish a console grouping
  console.groupEnd();
};

// TODO: add show hierarchy flag
consoleJSON.filter = function(json, filterKey) {
  // Filter out subtrees of the json
  ruleset['filter'] = filterKey;
  consoleJSON.log(json, ruleset);
  delete ruleset['filter'];
};


/**
 * BEGIN RULESET & RULES PORTION OF CODE
 */
consoleJSON.Ruleset = function() {
  // Constructor for Ruleset
  this.nestedRulesets = {};  // map from key to Ruleset
  this.keyedRules = {};  // map from key to list of Rules
  this.globalRules = [];  // list of Rules

  // TODO: Initialize default values
};

consoleJSON.Ruleset.prototype.addRuleset = function(key, ruleset) {
  // Add a key-specific, nested ruleset to the ruleset.
  // TODO: If ruleset for key already exists, merge existing ruleset with new ruleset?
  this.nestedRulesets[key] = ruleset;
  return this;
};

consoleJSON.Ruleset.prototype.addKeyedRule = function(key, rule) {
  // Add a key-specific rule to the ruleset.
  // If there's an existing rule for the same key with all fields matching except value, overwrites the existing value.
  this.keyedRules[key] = consoleJSON.Util.addRule(this.keyedRules[key], rule);
  return this;
};

consoleJSON.Ruleset.prototype.addGlobalRule = function(rule) {
  // Add a global rule to the ruleset.
  // If there's an existing global rule with all fields matching except value, overwrites the existing value.
  this.globalRules = consoleJSON.Util.addRule(this.globalRules, rule);
  return this;
};

consoleJSON.Ruleset.prototype.removeRuleset = function(key) {
  // Remove a key-specific, nested ruleset from the ruleset, if it exists.
  delete this.nestedRulesets[key];
  return this;
};

consoleJSON.Ruleset.prototype.removeKeyedRule = function(key, rule) {
  // Remove a key-specific rule from the ruleset, if it exists.
  this.keyedRules[key] = consoleJSON.Util.removeRule(this.keyedRules[key], rule);
  return this;
};

consoleJSON.Ruleset.prototype.removeGlobalRule = function(rule) {
  // Remove a global rule from the ruleset, if it exists.
  this.globalRules = consoleJSON.Util.removeRule(this.globalRules, rule);
  return this;
};

consoleJSON.Rule = function(type, attr, val, target) {
  // Constructor for Rule
  // target is only valid if type == consoleJSON.TYPES.STYLE
  this.type = type;
  this.attr = attr;
  this.val = val;
  this.target = type == consoleJSON.TYPES.STYLE ? target : consoleJSON.TARGET.UNUSED;
};


/**
 * BEGIN UTIL FUNCTIONS PORTION OF CODE
 */
consoleJSON.Util.addRule = function(ruleList, rule) {
  // If there's an existing rule in ruleList with all fields matching the given rule except value, overwrites the existing value.
  // Otherwise, appends rule to ruleList.
  // Returns the modified ruleList.
  var matchFound = false;
  for (var i in ruleList) {
    var existingRule = ruleList[i];
    if (consoleJSON.Util.rulesMatch(existingRule, rule)) {
      existingRule.val = rule.val;
      matchFound = true;
    }
  }
  if (!matchFound) {
    ruleList.push(rule);
  }
  return ruleList;
};

consoleJSON.Util.removeRule = function(ruleList, rule) {
  // If there's an existing rule in ruleList with all fields matching the given rule except value, removes it.
  // Returns the modified ruleList.
  for (var i = 0; i < ruleList.length; i++) {
    var existingRule = ruleList[i];
    if (consoleJSON.Util.rulesMatch(ruleList[i], rule)) {
      ruleList.splice(i,1);
      i--;
    }
  }
  return ruleList;
};

consoleJSON.Util.rulesMatch(rule1, rule2) {
  // Returns whether or not the two rules are the same (with only the attribute value as a possible difference).
  return rule.type == existingRule.type && rule.attr == existingRule.attr &&
    rule.target == existingRule.target;
};

// From http://stackoverflow.com/questions/202605/repeat-string-javascript
String.prototype.repeat = function(num) {
  return new Array(num+1).join(this);
};

