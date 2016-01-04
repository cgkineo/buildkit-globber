var Tree = require("./Tree.js");

var TreeContext = module.exports = function(options) {
	this.files = options.files === undefined ? true : options.files;
	this.dirs = options.dirs === undefined ? true : options.dirs;
	this.cache = options.cache === undefined ? true : options.cache;
	this._cachedTimeStamp = (new Date()).getTime();
};

TreeContext.prototype.recache = function() {
	this._cachedTimeStamp = (new Date()).getTime();
};

TreeContext.prototype.Tree = function(location, relativeTo) {
	return new Tree(location, relativeTo, this);
};
