"use strict";

var minimatch = require("minimatch");
var Minimatch = minimatch.Minimatch;
var MATCH_TYPE = require("./MATCH_TYPE.js");
var MAX_INT = 4294967295;

class Glob {

	constructor(pattern) {
		this.init(pattern);
	}

	init(pattern) {
		this._patternAtDepth = {};
		this.hasInfiniteDepth = false;
		this.isDescendAll = false;
		this.isNegate = pattern[0] === "!";
		this.patterns = [];
		this.matchAtDepth = [];
		this.maxDepth = MAX_INT;
		
		if (this.isNegate) this.pattern = pattern.slice(1);
		else this.pattern = pattern;
		
		var sections = this.pattern.split("/");
		var currentPattern = [];

		for (var depth = 1, l = sections.length; depth <= l; depth++) {
			var isAtEnd = (depth === sections.length);
			var section = sections[depth-1];
			switch (section) {
			case "**":
				//mark as having infinite depth section
				this.hasInfiniteDepth = true;
				//fall into end check as should always match at end
			case "*":
				if (!isAtEnd) {
					//if not at end and ** or * then don't match at this depth
					this.matchAtDepth.push(false);
					break;
				}
			default:
				//mark point of infinite depth
				if (this.hasInfiniteDepth && this.isDescendAll === false) this.isDescendAll = depth;
				//mark as a matching section of pattern
				this.matchAtDepth.push(true);
			}
			currentPattern.push(section);
			this.patterns.push(currentPattern.join("/"));
		}

		if (!this.hasInfiniteDepth) {
			//record depth of pattern if not infinite
			this.maxDepth = this.patterns.length;
		}
	}

	match(Location) {
	
		var depth = Location.depth;

		var pattern = this._getPatternAtDepth(depth);
		if (pattern === true) return MATCH_TYPE.DESCEND;

		var isMatched = pattern.match(Location.relativeLocation);
		if (isMatched) {
			if (this.isNegate) {
				return MATCH_TYPE.NOTMATCHED;
			} else {
				if (this.isDescendAll !== false && this.isDescendAll > depth) {
					//has reached infinite pattern section
					return MATCH_TYPE.DESCEND;
				} else if (this.hasInfiniteDepth) {
					//is infinite depth always
					return MATCH_TYPE.MATCHED_DESCEND;
				} else if (depth >= this.maxDepth) {
					//is at end of pattern depth
					return MATCH_TYPE.MATCHED;
				} else {
					//not at end of pattern depth
					return MATCH_TYPE.DESCEND;
				}
			}
		} else if (!isMatched) {
			if (this.isNegate) {
				//not excluded
				return MATCH_TYPE.NOTEXCLUDED;
			} else {
				if (this.isDescendAll !== false && this.isDescendAll <= depth) {
					//has reached infinite pattern section
					return MATCH_TYPE.DESCEND;
				} else {
					//not matched at any depth
					return MATCH_TYPE.NOTMATCHED;	
				}
			}
		}
		
	}

	_getPatternAtDepth(depth) {
		//get pattern section from start > depth
		if (this._patternAtDepth[depth]) {
			return this._patternAtDepth[depth];
		}

		var isAtEnd = (depth >= this.matchAtDepth.length);
		var shouldMatchAtDepth = (this.matchAtDepth[depth-1]);

		if (this.hasInfiniteDepth && isAtEnd) {
			return this._patternAtDepth[depth] = new Minimatch(this.pattern, { dot: true });
		} else if (shouldMatchAtDepth) {
			return this._patternAtDepth[depth] = new Minimatch(this.patterns[depth-1], { dot: true });
		}
		
		return this._patternAtDepth[depth] = true;
	}

}

module.exports = Glob;