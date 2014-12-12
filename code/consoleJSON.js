var consoleJSON = consoleJSON || {};
consoleJSON.Util = consoleJSON.Util || {};

// TODO: remove this
var ruleset = ruleset || {};

var DELIMITER = "  ";
var LINE_LENGTH = 80;  // TODO: override?
var CONSOLE_STYLE_SPECIFIER = "%c";

consoleJSON.TYPES = {
  FILTER : "filter",
  STYLE : "style",
  FORMAT : "format"
};

consoleJSON.TARGETS = {
  KEY : "key",
  VAL : "val",
  //KEY_AND_VAL : "key_and_val",
  NUM : "num",
  STR : "str",
  BOOL : "bool",
  NULL : "null",
  UNDEF : "undef",
  ARR : "array",
  OBJ : "object",
  UNUSED : "unused"
};

consoleJSON.ATTRS = {
  HIDE : "hide",
  REMOVE : "remove",
  HIGHLIGHT : "highlight",
  FONT_COLOR : "font_color",
  FONT_SIZE : "font_size",
  FONT_STYLE : "font_style",
  FONT_WEIGHT : "font_weight",
  FONT_FAMILY : "font_family",
  LINE_LEN : "line_length",
  INSERT_NEWLINE : "insert_newline",
  INDENT_AMT : "indent_amt"
};

consoleJSON.ATTR_TO_CSS = {};
consoleJSON.ATTR_TO_CSS[consoleJSON.ATTRS.HIGHLIGHT] = "background";
consoleJSON.ATTR_TO_CSS[consoleJSON.ATTRS.FONT_COLOR] = "color";
consoleJSON.ATTR_TO_CSS[consoleJSON.ATTRS.FONT_SIZE] = "font-size";
consoleJSON.ATTR_TO_CSS[consoleJSON.ATTRS.FONT_STYLE] = "font-style";
consoleJSON.ATTR_TO_CSS[consoleJSON.ATTRS.FONT_WEIGHT] = "font-weight";
consoleJSON.ATTR_TO_CSS[consoleJSON.ATTRS.FONT_FAMILY] = "font-family";

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

// TODO: add show hierarchy flag, for now we're just removing instead of hiding
//  afang
consoleJSON.filter = function(json, filterKey, ruleset) {
  // Filter out subtrees of the json
  var removeRule = consoleJSON.Rule(consoleJSON.TYPES.FILTER, consoleJSON.ATTRS.REMOVE, null);
  // Maybe here need to check to see if remove rule exists already? 
  ruleset.addGlobalRule(removeRule);
  ruleset.addFilterKey(filterKey);
  consoleJSON.log(json, ruleset);
  ruleset.removeFilterKey(filterKey);
  ruleset.removeGlobalRule(removeRule);
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
        if (ruleset[consoleJSON.ATTRS.INSERT_NEWLINE]) {
          console.log('\n');
        }
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
    if ((!ruleset.getDoFilter()) || (ruleset.getDoFilter() && $.inArray(key, ruleset.getFilterKeys))) {
      switch (valType) {
        case 'array':
        case 'object':
          consoleJSON.startGroup(keyOutput + ": " + beginD, lvl, DELIMITER);
          var doingFilter = ruleset.getDoFilter();
          if (doingFilter) {
            ruleset.setDoFilter(false);
          }
          
          var beginD = consoleJSON.beginDelimiter(val, ruleset);
          consoleJSON.traverse(val, ruleset, lvl+1);

          rulset.setDoFilter(doingFilter);
          
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
          if (ruleset[consoleJSON.ATTRS.INSERT_NEWLINE]) {
            console.log('\n');
        }
      }
    } else if (valType == 'array' || valType == 'object') {
      consoleJSON.traverse(val, ruleset, lvl);
    }
  }
};

consoleJSON.beginDelimiter = function(json, ruleset, key) {
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

consoleJSON.endDelimiter = function(json, ruleset, key) {
  // Function to handle the closing delimiter for arrays, objs, etc.
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

consoleJSON.outputPrimitive = function(json, ruleset, key) {
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

consoleJSON.outputKey = function(json, ruleset, key) {
  // Prints a key to the output, subject to a ruleset
  return consoleJSON.outputPrimitive(json, ruleset, key);
};

consoleJSON.outputVal = function(json, ruleset, key) {
  // Prints a value to the output, subject to a ruleset
  return consoleJSON.outputPrimitive(json, ruleset, key);
};

// TODO: this also breaks words apart. fix this
// TODO: ignore %c
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

consoleJSON.print = function(targets, styles, indentationLvl, delimiter) {
  // Function to write word-wrapped data to console output
  // TODO: fix indentWrap to ignore %c
  //var output = consoleJSON.indentWrap(target, indentationLvl, delimiter);
  console.log.apply(console, consoleJSON.Util.formatForConsole(targets, styles));
};

consoleJSON.startGroup = function(targets, styles, indentationLvl, delimiter) {
  // Begin a console grouping
  // TODO: fix indentWrap to ignore %c
  //var output = consoleJSON.indentWrap(target, indentationLvl, delimiter);
  console.group.apply(console, consoleJSON.Util.formatForConsole(targets, styles));
};

consoleJSON.endGroup = function() {
  // Finish a console grouping
  console.groupEnd();
};


/**
 * BEGIN RULESET & RULES PORTION OF CODE
 */
consoleJSON.Ruleset = function() {
  // Constructor for Ruleset
  this.nestedRulesets = {};  // map from key to Ruleset
  this.globalRules = [];  // list of Rules
  this.filterKeysList = []; // keys to filter, used for filtering
  this.doFilter = false; // a flag to tell the traverser whether or not to do filtering

  // TODO: Initialize default values
};

// TODO: add mechanism for dot notation in keys specified by user (generate internal nested rulesets automatically)

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

consoleJSON.Ruleset.prototype.addFilterKey = function(filterKey) {
  if ($.type(filterKey) == 'array') {
    this.filterKeysList = this.filterKeysList.concat(filterKey);
  } else if ($.type(filterKey) == 'string') {
    this.filterKeysList = this.filterKeysList.concat(filterKey);
  }
}

consoleJSON.Ruleset.prototype.removeFilterKey = function(filterKey) {
  if ($.type(filterKey) == 'array') {
    for (var i = 0; i < filterKey.length; i++) {
      this.filterKeysList = this.filterKeysList.splice($.inArray(filterKey[i], this.filterKeysList), 1);
    }
  } else if ($.type(filterKey) == 'string') {
    this.filterKeysList = this.filterKeysList.splice($.inArray(filterKey, this.filterKeysList), 1);
  }
}

consoleJSON.Ruleset.prototype.getFilterKeys = function() {
  return this.filterKeysList;
}

consoleJSON.Ruleset.prototype.setDoFilter = function(shouldDoFilter) {
  this.doFilter = shouldDoFilter;
  return this.doFilter;
}

consoleJSON.Ruleset.prototype.getDoFilter = function() {
  return this.doFilter;
}


consoleJSON.Ruleset.prototype.lookupRules = function(key) {
  // Finds matching rules in this ruleset for the given key, adhering to precedence for rules that specify the same attribute.
  // key can be either null (global rule) or string-valued (key-specific rules).
  var matchingRules = [];
  if (key !== null) {
    // TODO: look first in key-specific rulesets
  }
  // TODO: add global rules pertaining to target=key/val first
  //       then add global rules pertaining to target=<primitive>/obj/array if no conflicts


  return matchingRules;
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

consoleJSON.Util.addRuleNoOverwrite = function(ruleList, rule) {
  // Appends rule to ruleList only if there's no existing rule in ruleList with all fields matching the given rule except value.
  // Returns the modified ruleList.
  var matchFound = false;
  for (var i in ruleList) {
    if (consoleJSON.Util.rulesMatch(ruleList[i], rule)) {
      matchFound = true;
      break;
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

consoleJSON.Util.findMatchingRules = function(ruleList, type, attr, target) {
  // Returns all rules in ruleList whose fields match all non-null input fields.
  var matchingRules = [];
  for (var i = 0; i < ruleList.length; i++) {
    var existingRule = ruleList[i];
    if ((type === null || existingRule.type == type) &&
        (attr === null || existingRule.attr == attr) &&
        (target === null || existingRule.target == target)) {
      matchingRules.push(existingRule);
    }
  }
  return matchingRules;
};

consoleJSON.Util.rulesMatch = function(rule1, rule2) {
  // Returns whether or not the two rules are the same (with only the attribute value as a possible difference).
  return rule.type == existingRule.type && rule.attr == existingRule.attr &&
    rule.target == existingRule.target;
};

consoleJSON.Util.formatForConsole = function(targets, styles) {
  // Formats the targets and styles into the array expected by console.
  // TODO: replace with indentAndWrap
  // TODO: bug here. delimieter undefined, indentationLvl undefined, targets undefined
  var indent = delimiter.repeat(indentationLvl);
  var targetStr = indent + CONSOLE_STYLE_SPECIFIER + targets.join(CONSOLE_STYLE_SPECIFIER);
  var consoleFormattedArr = [targetStr];
  return consoleFormattedArr.concat(styles);
};

consoleJSON.Util.rulesToCSS = function(ruleList) {
  // Returns a CSS string that contains all styles specified by rules in ruleList.
  var cssStrings = [];
  for (var i = 0; i < ruleList.length; i++) {
    var rule = ruleList[i];
    if (rule.type == consoleJSON.TYPES.STYLE) {
      cssStrings.push(consoleJSON.ATTR_TO_CSS[rule.attr] + ":" + rule.val);
    }
  }
  return cssStrings.join(";");
};

// From http://stackoverflow.com/questions/202605/repeat-string-javascript
String.prototype.repeat = function(num) {
  return new Array(num+1).join(this);
};

