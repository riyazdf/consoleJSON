var consoleJSON = consoleJSON || {};
consoleJSON.Util = consoleJSON.Util || {};

// TODO: remove this
//var ruleset = ruleset || {};

var DELIMITER = "  ";
var LINE_LENGTH = 80;
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
  NUM : "number",
  STR : "string",
  BOOL : "boolean",
  NULL : "null",
  UNDEF : "undefined",
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

consoleJSON.BEGIN_DELIM = {};
consoleJSON.BEGIN_DELIM[consoleJSON.TARGETS.ARR] = "[";
consoleJSON.BEGIN_DELIM[consoleJSON.TARGETS.OBJ] = "{";

consoleJSON.END_DELIM = {};
consoleJSON.END_DELIM[consoleJSON.TARGETS.ARR] = "]";
consoleJSON.END_DELIM[consoleJSON.TARGETS.OBJ] = "}";

consoleJSON.SEP = {};
consoleJSON.SEP[consoleJSON.TARGETS.ARR] = ",";
consoleJSON.SEP[consoleJSON.TARGETS.OBJ] = ",";

consoleJSON.KEY_VAL_SEP = {};
consoleJSON.KEY_VAL_SEP[consoleJSON.TARGETS.OBJ] = ": ";

consoleJSON.log = function(json, ruleset) {
  // pretty prints JSON to console according to given ruleset
  // obj is a Javascript object, ruleset is a consoleJSON ruleset
  var beginD = consoleJSON.getDelimiter(json, ruleset, consoleJSON.BEGIN_DELIM);
  if (beginD) {
    consoleJSON.startGroup([beginD[0]], [beginD[1]], 0, DELIMITER, LINE_LENGTH);
  }
  consoleJSON.traverse(json, ruleset, 1);
  var endD = consoleJSON.getDelimiter(json, ruleset, consoleJSON.END_DELIM);
  if (endD) {
    consoleJSON.print([endD[0]], [endD[1]], 0, DELIMITER, LINE_LENGTH);
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
      var output = consoleJSON.outputPrimitive(json, ruleset, null, false);
      if (ruleset[consoleJSON.ATTRS.LINE_LENGTH]) {
        var lineLen = ruleset[consoleJSON.ATTRS.LINE_LENGTH];
      } else {
        var lineLen = LINE_LENGTH;
      }
      consoleJSON.print([output[0]], [output[1]], lvl, DELIMITER, lineLen);
  }
};

consoleJSON.traverseArray = function(jsonArray, ruleset, lvl) {
  // Traverses an array data type (called from traverse)
  // Handles delimiters and groupings, and other printing rules for arrs
  var sep = consoleJSON.getDelimiter(jsonArray, ruleset, consoleJSON.SEP);
  var sepTarget = sep[0];
  var sepStyle = sep[1];
  for (var i = 0; i < jsonArray.length; i++) {
    var el = jsonArray[i];
    var type = $.type(el);
    if (ruleset[consoleJSON.ATTRS.LINE_LENGTH]) {
      var lineLen = ruleset[consoleJSON.ATTRS.LINE_LENGTH];
    } else {
      var lineLen = LINE_LENGTH;
    }
    if (ruleset[consoleJSON.ATTRS.INDENT_AMT]) {
      lvl = ruleset[consoleJSON.ATTRS.INDENT_AMT];
    }
    switch (type) {
      case 'array':
      case 'object':
        var beginD = consoleJSON.getDelimiter(el, ruleset, consoleJSON.BEGIN_DELIM);
        consoleJSON.startGroup([beginD[0]], [beginD[1]], lvl, DELIMITER, lineLen);

        consoleJSON.traverse(el, ruleset, lvl+1);
        
        var endD = consoleJSON.getDelimiter(el, ruleset, consoleJSON.END_DELIM);
        var endDTargets = [endD[0]];
        var endDStyles = [endD[1]];
        if (i < jsonArray.length-1) {
          endDTargets.push(sepTarget);
          endDStyles.push(sepStyle);
        }
        consoleJSON.print(endDTargets, endDStyles, lvl, DELIMITER, lineLen);
        consoleJSON.endGroup();
        break;
      default:
        var output = consoleJSON.outputVal(el, ruleset, null);
        var outputTargets = [output[0]];
        var outputStyles = [output[1]];
        if (i < jsonArray.length-1) {
          outputTargets.push(sepTarget);
          outputStyles.push(sepStyle);
        }
        consoleJSON.print(outputTargets, outputStyles, lvl, DELIMITER, lineLen);
        if (ruleset[consoleJSON.ATTRS.INSERT_NEWLINE]) {
          console.log('\n');
        }
    }
  }
};

consoleJSON.traverseObject = function(jsonObj, ruleset, lvl) {
  // Traverses an object data type (called from traverse)
  // Handles delimiters and groupings, and other printing rules for objs
//  var ruleset = ruleset || {};
  var sep = consoleJSON.getDelimiter(jsonObj, ruleset, consoleJSON.SEP);
  var sepTarget = sep[0];
  var sepStyle = sep[1];
  var keyValSep = consoleJSON.getDelimiter(jsonObj, ruleset, consoleJSON.KEY_VAL_SEP);
  var keyValSepTarget = keyValSep[0];
  var keyValSepStyle = keyValSep[1];
  var keys = Object.keys(jsonObj);
  if (ruleset[consoleJSON.ATTRS.LINE_LENGTH]) {
    var lineLen = ruleset[consoleJSON.ATTRS.LINE_LENGTH];
  } else {
    var lineLen = LINE_LENGTH;
  }
  if (ruleset[consoleJSON.ATTRS.INDENT_AMT]) {
    lvl = ruleset[consoleJSON.ATTRS.INDENT_AMT];
  } 
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var keyOutput = consoleJSON.outputKey(key, ruleset, key);
    var keyOutputTargets = [keyOutput[0]];
    var keyOutputStyles = [keyOutput[1]];
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
          
          var endD = consoleJSON.getDelimiter(val, ruleset, consoleJSON.END_DELIM);
          var endDTargets = [endD[0]];
          var endDStyles = [endD[1]];
          if (i < keys.length-1) {
            endDTargets.push(sepTarget);
            endDStyles.push(sepStyle);
          }
          consoleJSON.print(endDTargets, endDStyles, lvl, DELIMITER, lineLen);
          if (ruleset[consoleJSON.ATTRS.INSERT_NEWLINE]) {
            console.log('\n');
          }
          consoleJSON.endGroup();
          break;
        default:
          var output = consoleJSON.outputVal(val, ruleset, key);
          var outputTargets = [output[0]];
          var outputStyles = [output[1]];
          if (i < keys.length-1) {
            outputTargets.push(sepTarget);
            outputStyles.push(sepStyle);
          }
          var outputKeyValTargets = keyOutputTargets.concat(keyValSepTarget, outputTargets);
          var outputKeyValStyles = keyOutputStyles.concat(keyValSepStyle, outputStyles);
          consoleJSON.print(outputKeyValTargets, outputKeyValStyles, lvl, DELIMITER, lineLen);
          if (ruleset[consoleJSON.ATTRS.INSERT_NEWLINE]) {
            console.log('\n');
          }
      }
    } else if (valType == 'array' || valType == 'object') {
      consoleJSON.traverse(val, ruleset, lvl);
    }
  }
};

// TODO: passed in ruleset should be for child object/array
consoleJSON.getDelimiter = function(json, ruleset, delimDict) {
  // Function to handle the closing delimiter for arrays, objs, etc.
  var type = $.type(json);
  if (!(type in delimDict)) {
    return null;
  }
  var target = delimDict[type];
  var rules = ruleset.lookupRules(null);
  var matchingRules = consoleJSON.Util.findMatchingStyleRules(rules, json, false)
  var style = consoleJSON.Util.rulesToCSS(matchingRules);
  return [target, style];
};

consoleJSON.outputPrimitive = function(json, ruleset, key, isKey) {
  // Prints a primitive to the output, subject to a ruleset
  var target = null;
  var type = $.type(json);
  switch (type) {
    case consoleJSON.TARGETS.STR:
      target = '\"' + json + '\"';
      break;
    default:
      target = json;
  }
  var rules = ruleset.lookupRules(key);
  var matchingRules = consoleJSON.Util.findMatchingStyleRules(rules, json, isKey)
  var style = consoleJSON.Util.rulesToCSS(matchingRules);
  return [target, style];
};

consoleJSON.outputKey = function(json, ruleset, key) {
  // Prints a key to the output, subject to a ruleset
  return consoleJSON.outputPrimitive(json, ruleset, key, true);
};

consoleJSON.outputVal = function(json, ruleset, key) {
  // Prints a value to the output, subject to a ruleset
  return consoleJSON.outputPrimitive(json, ruleset, key, false);
};

// TODO: this also breaks words apart. fix this
// TODO: ignore %c
consoleJSON.indentWrap = function(target, indentationLvl, delimiter, lineLen) {
  // A function to handle word wrapping in the console output
  var indent = delimiter.repeat(indentationLvl);
  var remainingLen = lineLen - indent.length;
  var result = "";
  var currPos = 0;
  while (currPos+remainingLen < target.length) {
    result += indent + target.substring(currPos,currPos+remainingLen) + "\n";
    currPos += remainingLen;
  }
  result += indent + target.substring(currPos);
  return result;
};

consoleJSON.print = function(targets, styles, indentationLvl, delimiter, lineLen) {
  // Function to write word-wrapped data to console output
  // TODO: fix indentWrap to ignore %c
  //var output = consoleJSON.indentWrap(target, indentationLvl, delimiter);
  console.log.apply(console, consoleJSON.Util.formatForConsole(targets, styles, indentationLvl, lineLen));
};

consoleJSON.startGroup = function(targets, styles, indentationLvl, delimiter, lineLen) {
  // Begin a console grouping
  // TODO: fix indentWrap to ignore %c
  //var output = consoleJSON.indentWrap(target, indentationLvl, delimiter);
  
  // default style for group start is bold; undo this
  for (var i = 0; i < styles.length; i++) {
    var css = styles[i];
    if (css.indexOf(consoleJSON.ATTR_TO_CSS[consoleJSON.ATTRS.FONT_WEIGHT]) == -1) {
      styles[i] = css + ";" + consoleJSON.ATTR_TO_CSS[consoleJSON.ATTRS.FONT_WEIGHT] + ":" + "normal";
    }
  }
  console.group.apply(console, consoleJSON.Util.formatForConsole(targets, styles, indentationLvl, lineLen));
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
  // Add a key-specific rule to the ruleset (convenience function).
  // If there's an existing rule for the same key with all fields matching except value, overwrites the existing value.
  this.nestedRulesets[key] = this.nestedRulesets[key] || new consoleJSON.Ruleset();
  this.nestedRulesets[key].addGlobalRule(rule);
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
  // TODO: clean up empty rulesets
  delete this.nestedRulesets[key];
  return this;
};

consoleJSON.Ruleset.prototype.removeKeyedRule = function(key, rule) {
  // Remove a key-specific rule from the ruleset, if it exists (convenience function).
  // TODO: clean up empty rulesets
  if (key in this.nestedRulesets) {
    this.nestedRulesets[key].removeGlobalRule(rule);
  }
  return this;
};

consoleJSON.Ruleset.prototype.removeGlobalRule = function(rule) {
  // Remove a global rule from the ruleset, if it exists.
  // TODO: clean up empty rulesets
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
    // look first in key-specific rulesets
    if (key in this.nestedRulesets) {
      matchingRules = matchingRules.concat(this.nestedRulesets[key].globalRules);
    }
  }
  // add global rules pertaining to target=key/val,
  // then add global rules pertaining to target=<primitive>/obj/array if no conflicts
  for (var i = 0; i < this.globalRules.length; i++) {
    var rule = this.globalRules[i];
    if (rule.target == consoleJSON.TARGETS.KEY || rule.target == consoleJSON.TARGETS.VAL) {
      matchingRules = consoleJSON.Util.addRuleNoOverwrite(matchingRules, rule);
    }
  }
  for (var i = 0; i < this.globalRules.length; i++) {
    var rule = this.globalRules[i];
    if (rule.target != consoleJSON.TARGETS.KEY && rule.target != consoleJSON.TARGETS.VAL) {
      matchingRules = consoleJSON.Util.addRuleNoOverwrite(matchingRules, rule);
    }
  }
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

consoleJSON.Util.findMatchingStyleRules = function(ruleList, json, isKey) {
  // Returns all matching style rules for json in ruleList, where isKey determines if the json represents a key or a value.
  var type = $.type(json);
  var typeInObj = isKey ? consoleJSON.TARGETS.KEY : consoleJSON.TARGETS.VAL;
  var matchingRules = consoleJSON.Util.findMatchingRules(ruleList, consoleJSON.TYPES.STYLE, null, typeInObj);
  var matchingTypeRules = consoleJSON.Util.findMatchingRules(ruleList, consoleJSON.TYPES.STYLE, null, type);
  for (var i = 0; i < matchingTypeRules.length; i++) {
    matchingRules = consoleJSON.Util.addRuleNoOverwrite(matchingRules, matchingTypeRules[i]);
  }
  return matchingRules;
};

consoleJSON.Util.rulesMatch = function(rule1, rule2) {
  // Returns whether or not the two rules are the same (with only the attribute value as a possible difference).
  return rule1.type == rule2.type && rule1.attr == rule2.attr && rule1.target == rule2.target;
};

consoleJSON.Util.formatForConsole = function(targets, styles, indentationLvl, lineLen) {
  // Formats the targets and styles into the array expected by console.
  // TODO: replace with indentAndWrap, handle indentationLvl, lineLen
  var indent = DELIMITER.repeat(indentationLvl);
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

