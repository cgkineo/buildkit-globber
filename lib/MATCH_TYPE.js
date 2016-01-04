var MATCH_TYPE = module.exports = function(name) {
	var index = MATCH_TYPE.count++;
	var item = new Number(index);
	item.toString = this.toString;
	item.name = name;
	item.index = index;
	MATCH_TYPE[name] = item;
};

MATCH_TYPE.prototype.toString = function() {
	return this.name;
};

MATCH_TYPE.count = 0;
new MATCH_TYPE("NOTMATCHED"); //DON'T INCLUDE (DOESN'T MATCH)
new MATCH_TYPE("DESCEND"); //DESCEND IF NOT AT END OF PATTERN AND MATCHED TO DEPTH
new MATCH_TYPE("NOTEXCLUDED"); //DON'T EXCLUDE (MATCH AGAINST NEGATION ONLY)
new MATCH_TYPE("MATCHED"); //EXACT MATCH
new MATCH_TYPE("MATCHED_DESCEND"); //MATCH WITH FURTHER DESCEND **
