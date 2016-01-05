"use strict";

var Tree = require("./Tree.js");

class TreeContext {

	constructor (options) {
		this.init(options);
	}

	init(options) {
		this.files = options.files === undefined ? true : options.files;
		this.dirs = options.dirs === undefined ? true : options.dirs;
		this.cache = options.cache === undefined ? true : options.cache;
		this._cachedTimeStamp = (new Date()).getTime();
	}

	recache() {
		this._cachedTimeStamp = (new Date()).getTime();
	}

	Tree(location, relativeTo) {
		return new Tree(location, relativeTo, this);
	}
	
}

module.exports = TreeContext;