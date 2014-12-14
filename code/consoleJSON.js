var consoleJSON = consoleJSON || {};
consoleJSON.Util = consoleJSON.Util || {};

var DELIMITER = "  ";
var LINE_LENGTH = 80;
var CONSOLE_STYLE_SPECIFIER = "%c";
var KEY_ESCAPE_CHAR = "/";
var KEY_SEPARATOR = ".";

consoleJSON.TYPES = {
  FILTER : "filter",
  STYLE : "style",
  FORMAT : "format"
};

consoleJSON.TARGETS = {
  KEY : "key",
  VAL : "val",
  NUM : "number",
  STR : "string",
  BOOL : "boolean",
  NULL : "null",
  UNDEF : "undefined",
  ARR : "array",
  OBJ : "object",
  ALL : "all",
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

consoleJSON.THEMES = {
  DEFAULT: "default",
  NONE: "none"
};

consoleJSON.log = function(json, ruleset) {
  // pretty prints JSON to console according to given ruleset
  // obj is a Javascript object, ruleset is a consoleJSON ruleset
  ruleset = ruleset || new consoleJSON.Ruleset();
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
  // Filter out subtrees of the json, third parameter is optional.
  //var removeRule = consoleJSON.Rule(consoleJSON.TYPES.FILTER, consoleJSON.ATTRS.REMOVE, null);
  // Maybe here need to check to see if remove rule exists already? 
  //ruleset.addGlobalRule(removeRule);
  ruleset = ruleset || new consoleJSON.Ruleset();
  var doFilter = ruleset.getDoFilter();
  ruleset.setDoFilter(true);
  ruleset.addFilterKey(filterKey);
  consoleJSON.log(json, ruleset);
  ruleset.removeFilterKey(filterKey);
  ruleset.setDoFilter(doFilter);
  //ruleset.removeGlobalRule(removeRule);
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
      consoleJSON.print([output[0]], [output[1]], lvl, DELIMITER, LINE_LENGTH);
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
    var ruleList = ruleset.lookupRules(el);
    for (var j = 0; j < ruleList.length; j++) {
      var formatRule = ruleList[j];
      var formatAttr = formatRule.attr;
      switch (formatAttr) {
        case consoleJSON.ATTRS.INDENT_AMT:
          lvl = formatRule.val;
        case consoleJSON.ATTRS.LINE_LEN:
          var lineLen = formatRule.val;
        case consoleJSON.ATTRS.INSERT_NEWLINE:
          var newLine = formatRule.val;
        default:
      }
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
    }
  }
};

consoleJSON.traverseObject = function(jsonObj, ruleset, lvl) {
  // Traverses an object data type (called from traverse)
  // Handles delimiters and groupings, and other printing rules for objs
  var sep = consoleJSON.getDelimiter(jsonObj, ruleset, consoleJSON.SEP);
  var sepTarget = sep[0];
  var sepStyle = sep[1];
  var keyValSep = consoleJSON.getDelimiter(jsonObj, ruleset, consoleJSON.KEY_VAL_SEP);
  var keyValSepTarget = keyValSep[0];
  var keyValSepStyle = keyValSep[1];
  var keys = Object.keys(jsonObj);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var childRuleset = ruleset.inheritedChildRuleset(key);
    var keyOutput = consoleJSON.outputKey(key, childRuleset, key);
    var keyOutputTargets = [keyOutput[0]];
    var keyOutputStyles = [keyOutput[1]];
    var val = jsonObj[key];
    var valType = $.type(val);
    var ruleList = ruleset.lookupRules(key);
    for (var j = 0; j < ruleList.length; j++) {
      var formatRule = ruleList[j];
      var formatAttr = formatRule.attr;
      switch (formatAttr) {
        case consoleJSON.ATTRS.INDENT_AMT:
          lvl = formatRule.val;
        case consoleJSON.ATTRS.LINE_LEN:
          var lineLen = formatRule.val;
        case consoleJSON.ATTRS.INSERT_NEWLINE:
          var newLine = formatRule.val;
        default:
      }
    }
    if ((!ruleset.getDoFilter()) || (ruleset.getDoFilter() && $.inArray(key, ruleset.getFilterKeys()) != -1)) {
      switch (valType) {
        case 'array':
        case 'object':
          var doingFilter = ruleset.getDoFilter();
          //console.log(doingFilter);
          if (doingFilter) {
            ruleset.setDoFilter(false);
          } 
          var beginD = consoleJSON.getDelimiter(val, childRuleset, consoleJSON.BEGIN_DELIM);
          var beginDTargets = keyOutputTargets.concat(keyValSepTarget, beginD[0]);
          var beginDStyles = keyOutputStyles.concat(keyValSepStyle, beginD[1]);
          consoleJSON.startGroup(beginDTargets, beginDStyles, lvl, DELIMITER, lineLen);

          consoleJSON.traverse(val, childRuleset, lvl+1);

          ruleset.setDoFilter(doingFilter);
          var endD = consoleJSON.getDelimiter(val, childRuleset, consoleJSON.END_DELIM);
          var endDTargets = [endD[0]];
          var endDStyles = [endD[1]];
          if (i < keys.length-1) {
            endDTargets.push(sepTarget);
            endDStyles.push(sepStyle);
          }
          consoleJSON.print(endDTargets, endDStyles, lvl, DELIMITER, lineLen);
          consoleJSON.endGroup();
          break;
        default:
          var output = consoleJSON.outputVal(val, childRuleset, key);
          var outputTargets = [output[0]];
          var outputStyles = [output[1]];
          if (i < keys.length-1) {
            outputTargets.push(sepTarget);
            outputStyles.push(sepStyle);
          }
          var outputKeyValTargets = keyOutputTargets.concat(keyValSepTarget, outputTargets);
          var outputKeyValStyles = keyOutputStyles.concat(keyValSepStyle, outputStyles);
          consoleJSON.print(outputKeyValTargets, outputKeyValStyles, lvl, DELIMITER, lineLen);
      }
    } else if (valType == 'array' || valType == 'object') {
      consoleJSON.traverse(val, childRuleset, lvl);
    }
  }
};

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
  var target = json;
  var type = $.type(json);
  switch (type) {
    case consoleJSON.TARGETS.STR:
      if (!isKey) {
        target = '\"' + json + '\"';
      }
      break;
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
consoleJSON.Ruleset = function(theme) {
  // Constructor for Ruleset
  // theme (optional): theme to use - if not specified or null, default theme is used
  this.nestedRulesets = {};  // map from key to Ruleset
  this.globalRules = [];  // list of Rules
  this.filterKeysList = []; // keys to filter, used for filtering
  this.doFilter = false; // a flag to tell the traverser whether or not to do filtering
  
  var themeRules = theme in consoleJSON.THEMES_TO_RULES ? consoleJSON.THEMES_TO_RULES[theme] : consoleJSON.DEFAULT_THEME;
  for (var i = 0; i < themeRules.length; i++) {
    this.addGlobalRule(themeRules[i]);
  }
};

consoleJSON.Ruleset.prototype.addRuleset = function(key, ruleset) {
  // Add a key-specific, nested ruleset to the ruleset.
  // TODO: If ruleset for key already exists, merge existing ruleset with new ruleset? (right now, it overwrites the old one)
  var keys = consoleJSON.Util.parseKey(key);
  var parentRuleset = this.getRuleset(keys.slice(0,-1));
  parentRuleset.nestedRulesets[keys[keys.length-1]] = ruleset;
  return this;
};

consoleJSON.Ruleset.prototype.addRule = function(key, ruleOrParams) {
  // Add a key-specific rule to the ruleset (convenience function).
  // If there's an existing rule for the same key with all fields matching except value, overwrites the existing value.
  // ruleOrParams: consoleJSON.Rule | [type, attr, val, target]
  var rule = $.type(ruleOrParams) == "array" ?
               new consoleJSON.Rule(ruleOrParams[0], ruleOrParams[1], ruleOrParams[2], ruleOrParams[3]) : ruleOrParams;
  var keys = consoleJSON.Util.parseKey(key);
  var targetRuleset = this.getRuleset(keys);
  targetRuleset.addGlobalRule(rule);
  return this;
};

consoleJSON.Ruleset.prototype.addGlobalRule = function(ruleOrParams) {
  // Add a global rule to the ruleset.
  // If there's an existing global rule with all fields matching except value, overwrites the existing value.
  // ruleOrParams: consoleJSON.Rule | [type, attr, val, target]
  var rule = $.type(ruleOrParams) == "array" ?
               new consoleJSON.Rule(ruleOrParams[0], ruleOrParams[1], ruleOrParams[2], ruleOrParams[3]) : ruleOrParams;
  this.globalRules = consoleJSON.Util.addRule(this.globalRules, rule, consoleJSON.Util.rulesEqual);
  return this;
};

consoleJSON.Ruleset.prototype.removeRuleset = function(key) {
  // Remove a key-specific, nested ruleset from the ruleset, if it exists.
  // TODO: clean up empty rulesets?
  var keys = consoleJSON.Util.parseKey(key);
  if (this.rulesetExists(keys)) {
    var parentRuleset = this.getRuleset(keys.slice(0,-1));
    delete parentRuleset.nestedRulesets[keys[keys.length-1]];
  }
  return this;
};

consoleJSON.Ruleset.prototype.removeRule = function(key, ruleOrParams) {
  // Remove a key-specific rule from the ruleset, if it exists (convenience function).
  // TODO: clean up empty rulesets?
  // ruleOrParams: consoleJSON.Rule | [type, attr, val, target]
  var rule = $.type(ruleOrParams) == "array" ?
               new consoleJSON.Rule(ruleOrParams[0], ruleOrParams[1], ruleOrParams[2], ruleOrParams[3]) : ruleOrParams;
  var keys = consoleJSON.Util.parseKey(key);
  if (this.rulesetExists(keys)) {
    var targetRuleset = this.getRuleset(keys);
    targetRuleset.removeGlobalRule(rule);
  }
  return this;
};

consoleJSON.Ruleset.prototype.removeGlobalRule = function(ruleOrParams) {
  // Remove a global rule from the ruleset, if it exists.
  // TODO: clean up empty rulesets?
  // ruleOrParams: consoleJSON.Rule | [type, attr, val, target]
  var rule = $.type(ruleOrParams) == "array" ?
               new consoleJSON.Rule(ruleOrParams[0], ruleOrParams[1], ruleOrParams[2], ruleOrParams[3]) : ruleOrParams;
  this.globalRules = consoleJSON.Util.removeRule(this.globalRules, rule, consoleJSON.Util.rulesEqual);
  return this;
};

consoleJSON.Ruleset.prototype.addFilterKey = function(filterKey) {
  if ($.type(filterKey) == 'array') {
    this.filterKeysList = this.filterKeysList.concat(filterKey);
  } else if ($.type(filterKey) == 'string') {
    this.filterKeysList = this.filterKeysList.concat(filterKey);
  }
};

consoleJSON.Ruleset.prototype.removeFilterKey = function(filterKey) {
  if ($.type(filterKey) == 'array') {
    for (var i = 0; i < filterKey.length; i++) {
      this.filterKeysList = this.filterKeysList.splice($.inArray(filterKey[i], this.filterKeysList), 1);
    }
  } else if ($.type(filterKey) == 'string') {
    this.filterKeysList = this.filterKeysList.splice($.inArray(filterKey, this.filterKeysList), 1);
  }
};

consoleJSON.Ruleset.prototype.getFilterKeys = function() {
  return this.filterKeysList;
};

consoleJSON.Ruleset.prototype.setDoFilter = function(shouldDoFilter) {
  this.doFilter = shouldDoFilter;
  return this.doFilter;
};

consoleJSON.Ruleset.prototype.getDoFilter = function() {
  return this.doFilter;
};

consoleJSON.Ruleset.prototype.inheritedChildRuleset = function(key) {
  // Get a key-specific, nested ruleset from this ruleset, with inheritance.
  var inheritedRuleset = null;
  if (key in this.nestedRulesets) {
    inheritedRuleset = this.nestedRulesets[key].clone();
    for (var i = 0; i < this.globalRules.length; i++) {
      inheritedRuleset.globalRules = consoleJSON.Util.addRuleNoOverwrite(inheritedRuleset.globalRules, this.globalRules[i],
                                                                         consoleJSON.Util.rulesEqual);
    }
  } else {
    inheritedRuleset = this.clone();
    inheritedRuleset.nestedRulesets = {};
  }
  return inheritedRuleset;
};

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
  // then add global rules
  for (var i = 0; i < this.globalRules.length; i++) {
    var rule = this.globalRules[i];
    matchingRules = consoleJSON.Util.addRuleNoOverwrite(matchingRules, rule, consoleJSON.Util.rulesEqual);
  }
  return matchingRules;
};

consoleJSON.Ruleset.prototype.getRuleset = function(keys) {
  // Gets nested ruleset determined by array of keys.
  // Each key represents a node on the path from this ruleset to the desired ruleset; nodes closer to this ruleset are earlier in the array.
  // Generates rulesets if they don't yet exist.
  var currRuleset = this;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!(key in currRuleset.nestedRulesets)) {
      currRuleset.nestedRulesets[key] = new consoleJSON.Ruleset(consoleJSON.THEMES.NONE);
    }
    currRuleset = currRuleset.nestedRulesets[key];
  }
  return currRuleset;
};

consoleJSON.Ruleset.prototype.rulesetExists = function(keys) {
  // Checks if nested ruleset determined by array of keys exists
  // Each key represents a node on the path from this ruleset to the desired ruleset; nodes closer to this ruleset are earlier in the array.
  var currRuleset = this;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!(key in currRuleset.nestedRulesets)) {
      return false;
    }
    currRuleset = currRuleset.nestedRulesets[key];
  }
  return true;
};

consoleJSON.Ruleset.prototype.clone = function() {
  // Returns a clone of this ruleset.
  var clone = new consoleJSON.Ruleset(consoleJSON.THEMES.NONE);
  for (var key in this.nestedRulesets) {
    clone.nestedRulesets[key] = this.nestedRulesets[key].clone();
  }
  for (var i = 0; i < this.globalRules.length; i++) {
    clone.globalRules[i] = this.globalRules[i].clone();
  }
  for (var i = 0; i < this.filterKeysList.length; i++) {
    clone.filterKeysList[i] = this.filterKeysList[i];
  }
  clone.doFilter = this.doFilter;
  return clone;
};

consoleJSON.Rule = function(type, attr, val, target) {
  // Constructor for Rule
  // target is only valid if type == consoleJSON.TYPES.STYLE
  this.type = type;
  this.attr = attr;
  this.val = val;
  this.target = type == consoleJSON.TYPES.STYLE ? target : consoleJSON.TARGETS.UNUSED;
};

consoleJSON.Rule.prototype.clone = function() {
  return new consoleJSON.Rule(this.type, this.attr, this.val, this.target);
};

/**
 * BUILTIN THEMES
 */
consoleJSON.DEFAULT_THEME = [
  new consoleJSON.Rule(consoleJSON.TYPES.STYLE,consoleJSON.ATTRS.FONT_WEIGHT,"bold","key"),
  new consoleJSON.Rule(consoleJSON.TYPES.STYLE,consoleJSON.ATTRS.FONT_COLOR,"black","key"),
  new consoleJSON.Rule(consoleJSON.TYPES.STYLE,consoleJSON.ATTRS.FONT_COLOR,"#606aa1","string"),
  new consoleJSON.Rule(consoleJSON.TYPES.STYLE,consoleJSON.ATTRS.FONT_COLOR,"#4ea1df","number"),
  new consoleJSON.Rule(consoleJSON.TYPES.STYLE,consoleJSON.ATTRS.FONT_COLOR,"#da564a","boolean"),
  new consoleJSON.Rule(consoleJSON.TYPES.STYLE,consoleJSON.ATTRS.FONT_SIZE,"12px","all"),
  new consoleJSON.Rule(consoleJSON.TYPES.STYLE,consoleJSON.ATTRS.FONT_FAMILY,"Verdana, Geneva, sans-serif","all"),
  new consoleJSON.Rule(consoleJSON.TYPES.FORMAT,consoleJSON.ATTRS.LINE_LEN,LINE_LENGTH),
  new consoleJSON.Rule(consoleJSON.TYPES.FORMAT,consoleJSON.ATTRS.INSERT_NEWLINE,true),
  new consoleJSON.Rule(consoleJSON.TYPES.FORMAT,consoleJSON.ATTRS.INDENT_AMT,DELIMITER.length)
];
consoleJSON.NO_THEME = [];

consoleJSON.THEMES_TO_RULES = {};
consoleJSON.THEMES_TO_RULES[consoleJSON.THEMES.DEFAULT] = consoleJSON.DEFAULT_THEME;
consoleJSON.THEMES_TO_RULES[consoleJSON.THEMES.NONE] = consoleJSON.NO_THEME;


/**
 * BEGIN UTIL FUNCTIONS PORTION OF CODE
 */
consoleJSON.Util.addRule = function(ruleList, rule, isMatchFn) {
  // If there's an existing rule in ruleList with all fields matching the given rule except value, overwrites the existing value.
  // Otherwise, appends rule to ruleList.
  // Returns the modified ruleList.
  var matchFound = false;
  for (var i in ruleList) {
    var existingRule = ruleList[i];
    if (isMatchFn(existingRule, rule)) {
      ruleList.splice(i, 1, rule);
      matchFound = true;
    }
  }
  if (!matchFound) {
    ruleList.push(rule);
  }
  return ruleList;
};

consoleJSON.Util.addRuleNoOverwrite = function(ruleList, rule, isMatchFn) {
  // Appends rule to ruleList only if there's no existing rule in ruleList with all fields matching the given rule except value.
  // Returns the modified ruleList.
  var matchFound = false;
  for (var i in ruleList) {
    if (isMatchFn(ruleList[i], rule)) {
      matchFound = true;
      break;
    }
  }
  if (!matchFound) {
    ruleList.push(rule);
  }
  return ruleList;
};

consoleJSON.Util.removeRule = function(ruleList, rule, isMatchFn) {
  // If there's an existing rule in ruleList with all fields matching the given rule except value, removes it.
  // Returns the modified ruleList.
  for (var i = 0; i < ruleList.length; i++) {
    var existingRule = ruleList[i];
    if (isMatchFn(ruleList[i], rule)) {
      ruleList.splice(i, 1);
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
  // first add rules pertaining to target=key/val,
  // then add rules pertaining to target=<primitive>/obj/array if no conflicts,
  // then add rules pertaining to target=all if no conflicts
  var type = $.type(json);
  var typeInJson = isKey ? consoleJSON.TARGETS.KEY : consoleJSON.TARGETS.VAL;
  var matchingRules = consoleJSON.Util.findMatchingRules(ruleList, consoleJSON.TYPES.STYLE, null, typeInJson);
  var matchingTypeRules = consoleJSON.Util.findMatchingRules(ruleList, consoleJSON.TYPES.STYLE, null, type);
  for (var i = 0; i < matchingTypeRules.length; i++) {
    matchingRules = consoleJSON.Util.addRuleNoOverwrite(matchingRules, matchingTypeRules[i], consoleJSON.Util.rulesTypeAttrEqual);
  }
  var matchingAllRules = consoleJSON.Util.findMatchingRules(ruleList, consoleJSON.TYPES.STYLE, null, consoleJSON.TARGETS.ALL);
  for (var i = 0; i < matchingAllRules.length; i++) {
    matchingRules = consoleJSON.Util.addRuleNoOverwrite(matchingRules, matchingAllRules[i], consoleJSON.Util.rulesTypeAttrEqual);
  }
  //console.log(matchingRules);
  return matchingRules;
};

consoleJSON.Util.rulesEqual = function(rule1, rule2) {
  // Returns whether or not the two rules are the same (with only the attribute value as a possible difference).
  return rule1.type == rule2.type && rule1.attr == rule2.attr && rule1.target == rule2.target;
};

consoleJSON.Util.rulesTypeAttrEqual = function(rule1, rule2) {
  // Returns whether or not the two rules are the same (with only the attribute value, targets as possible differences).
  return rule1.type == rule2.type && rule1.attr == rule2.attr;
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

consoleJSON.Util.parseKey = function(key) {
  // Returns an array of keys, each of which was separated by a dot in the input string
  // Escape character, immediately followed by a dot, means that the key has a dot in it.
  // ex with / as escape: "a/.b.c.d//.e.f" returns ['a.b','c','d/.e','f']
  var keys = [];
  var currKey = "";
  for (var i = 0; i < key.length; i++) {
    var currChar = key[i];
    switch (currChar) {
      case KEY_ESCAPE_CHAR:
        if (key[i+1] == KEY_SEPARATOR) {
          currKey += KEY_SEPARATOR;
          i++;
        } else {
          currKey += currChar;
        }
        break;
      case KEY_SEPARATOR:
        keys.push(currKey);
        currKey = "";
        break;
      default:
        currKey += currChar;
    }
  }
  keys.push(currKey);
  return keys;
};

// From http://stackoverflow.com/questions/202605/repeat-string-javascript
String.prototype.repeat = function(num) {
  return new Array(num+1).join(this);
};

