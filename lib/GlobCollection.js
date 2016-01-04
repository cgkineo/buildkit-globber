var MATCH_TYPE = require("./MATCH_TYPE.js");
var Glob = require("./Glob.js");

var GlobCollection = module.exports = function(globs) {

	for (var i = 0, l = globs.length; i < l; i++) {
		if (globs[i] instanceof Glob) {
			this.push(globs[i]);
		} else {
			this.push(new Glob(globs[i]));
		}
	}

};

GlobCollection.prototype = [];

GlobCollection.prototype.match = function(Location) {
	//return highest match of glob patterns for location

	var negators = this.getNegators();
	for (var i = 0, l = negators.length; i < l; i++) {
		var Glob = negators[i];
		var matchResult = Glob.match(Location);
		switch (matchResult) {
		case MATCH_TYPE.DESCEND: 
			continue;
		case MATCH_TYPE.NOTMATCHED: 
			return MATCH_TYPE.NOTMATCHED; 
		}
	}

	var nonnegators = this.getNonNegators();
	if (nonnegators.length === 0) {
		return MATCH_TYPE.MATCHED_DESCEND;
	}

	var highestMatch = MATCH_TYPE.NOTMATCHED;

	for (var i = 0, l = nonnegators.length; i < l; i++) {
		var Glob = nonnegators[i];
		var matchResults = Glob.match(Location);
		
		if (matchResults === MATCH_TYPE.NOTMATCHED) continue;

		switch (matchResults) {
		case MATCH_TYPE.MATCHED_DESCEND:
			return matchResults;
		}

		if (matchResults >= highestMatch) {
			highestMatch = matchResults;
		}
	}

	return highestMatch;

};

GlobCollection.prototype.getNegators = function() {
	//get all glob patterns starting with !
	if (!this._negators) {
		this._negators = [];
		for (var i = 0, l = this.length; i < l; i++) {
			var item = this[i];
			if (item.isNegate) this._negators.push(item);
		}
	}
	return this._negators;
};

GlobCollection.prototype.getNonNegators = function() {
	//get all glob patterns not starting with !
	if (!this._nonnegators) {
		this._nonnegators = [];
		for (var i = 0, l = this.length; i < l; i++) {
			var item = this[i];
			if (!item.isNegate) this._nonnegators.push(item);
		}
	}
	return this._nonnegators;
};

GlobCollection.prototype.toArray = function() {
	return [].slice.call(this, 0);
};