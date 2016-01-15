"use strict";

var Tree = require("./Tree.js");
var uid = 0;

class TreeContext {

	constructor (options) {
		this.init(options);
		this._trees = {};
		this.uid = uid++;
	}

	init(options) {
		options = options || {};
		this.files = options.files === undefined ? true : options.files;
		this.dirs = options.dirs === undefined ? true : options.dirs;
		this.cache = options.cache === undefined ? true : options.cache;
		this._cachedTimeStamp = (new Date()).getTime();
	}

	clearCache() {
		this._cachedTimeStamp = (new Date()).getTime();
	}

	Tree(location, relativeTo) {
		if (this._trees[location+relativeTo]) {
			return this._trees[location+relativeTo];
		} else {
			return new Tree(location, relativeTo, this);
		}
	}
	
}

module.exports = TreeContext;