"use strict";

var MATCH_TYPE = require("./MATCH_TYPE.js");
var Glob = require("./Glob.js");

class GlobCollection extends Array {

	constructor(globs) {
		super();
		this.init.apply(this, arguments);
	}

	init(globs) {
		if (arguments.length > 0) {
			globs = [];
			for (var i = 0, l = arguments.length; i < l; i++) {
				if (arguments[i] instanceof GlobCollection) {
					globs = globs.concat(arguments[i].toArray());
				} else if (arguments[i] instanceof Array) {
					globs = globs.concat(arguments[i]);
				} else if (arguments[i] instanceof Glob) {
					globs.push(arguments[i]);
				} else if (typeof arguments[i] === "string") {
					globs.push(arguments[i]);
				}
			}
		}
		if (typeof globs === "string") globs = [globs];
		for (var i = 0, l = globs.length; i < l; i++) {
			if (globs[i] instanceof Glob) {
				this.push(globs[i]);
			} else if (typeof globs[i] === "string") {
				this.push(new Glob(globs[i]));
			}
		}
	}

	match(Location) {
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

	}

	filter(Locations) {
		var results = [];
		for (var i = 0, l = Locations.length; i < l; i++) {
			var matchResult = this.match(Locations[i]);
			switch (matchResult) {
			case MATCH_TYPE.MATCHED_DESCEND:
			case MATCH_TYPE.MATCHED:
				results.push(Locations[i]);
			}
		}
		return results;
	}

	getNegators() {
		//get all glob patterns starting with !
		if (!this._negators) {
			this._negators = [];
			for (var i = 0, l = this.length; i < l; i++) {
				var item = this[i];
				if (item.isNegate) this._negators.push(item);
			}
		}
		return this._negators;
	}

	getNonNegators() {
		//get all glob patterns not starting with !
		if (!this._nonnegators) {
			this._nonnegators = [];
			for (var i = 0, l = this.length; i < l; i++) {
				var item = this[i];
				if (!item.isNegate) this._nonnegators.push(item);
			}
		}
		return this._nonnegators;
	}

	toArray() {
		return [].slice.call(this, 0);
	}
}

module.exports = GlobCollection;