var consoleJSON = consoleJSON || {};

consoleJSON.log = function(json, ruleset) {
  // pretty prints JSON to console according to given ruleset
  // obj is a Javascript object, ruleset is a consoleJSON ruleset
  console.traverse(json, ruleset, 0);
  //console.log(json);
};

consoleJSON.traverse = function(json, ruleset, lvl) {
  // traverses the json tree
  // lvl is the depth of the current node (for indentation)
  consoleJSON.printBegin(json, ruleset, lvl);

  consoleJSON.printEnd(json, ruleset, lvl);
};

consoleJSON.printBegin = function(json, ruleset, lvl) {
};

consoleJSON.printEnd = function(json, ruleset, lvl) {
};
