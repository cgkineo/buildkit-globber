"use strict";

var path = require("path");
var fs = require("fs");
var GlobCollection = require("./GlobCollection.js");
var MATCH_TYPE = require("./MATCH_TYPE.js");
var Location = require("./Location.js");
var Watch = require("./Watch.js");

class Tree {

	constructor(location, relativeTo, TreeContext) {
		if (!(location instanceof Location)) this.Location = new Location(location, relativeTo);
		this._isPopulated = false;
		this._populatedTimeStamp = 0;

		this.dirs = [];
		this.files = [];
		this.TreeContext = TreeContext || {};

		if (this.TreeContext.dirs === undefined) this.TreeContext.dirs = true;
		if (this.TreeContext.files === undefined) this.TreeContext.files = true;
		if (this.TreeContext.cache === undefined) this.TreeContext.cache = true;
		if (this.TreeContext.cache && !this.TreeContext._cachedTimeStamp) this.TreeContext._cachedTimeStamp = (new Date()).getTime();
	}

	watchGlobs(globCollection) {
		if (!(globCollection instanceof GlobCollection)) {
			var globs = [];
			for (var i = 0, l = arguments.length; i < l; i++) {
				if (arguments[i] instanceof GlobCollection) {
					globs = globs.concat(arguments[i].toArray());
				} else {
					globs = globs.concat(arguments[i]);
				}
			}
			globCollection = new GlobCollection(globs);
		}

		this._populate(this);

		return new Watch(this, globCollection);
	}

	mapGlobs(globCollection) {
		if (!(globCollection instanceof GlobCollection)) {
			var globs = [];
			for (var i = 0, l = arguments.length; i < l; i++) {
				if (arguments[i] instanceof GlobCollection) {
					globs = globs.concat(arguments[i].toArray());
				} else {
					globs = globs.concat(arguments[i]);
				}
			}
			globCollection = new GlobCollection(globs);
		}

		this._populate(this);

		var matches = {
			files: [],
			dirs: []
		};

		if (this.TreeContext.files) {
			for (var i = 0, l = this.files.length; i < l; i++) {
				var file = this.files[i];
				var matchResult = globCollection.match(file);
				switch (matchResult) {
				case MATCH_TYPE.MATCHED: case MATCH_TYPE.MATCHED_DESCEND:
					matches.files.push(file.clone());
					break;
				}
			}
		}

		for (var i = 0, l = this.dirs.length; i < l; i++) {
			var dir = this.dirs[i];
			var matchResult = globCollection.match(dir.Location);
			switch (matchResult) {
			case MATCH_TYPE.MATCHED_DESCEND:
				if (this.TreeContext.dirs) {
					matches.dirs.push(dir.Location.clone());
				}
			case MATCH_TYPE.DESCEND:
				var descendMatches = dir.mapGlobs(globCollection);
				matches.dirs = matches.dirs.concat(descendMatches.dirs);
				if (this.TreeContext.files) {
					matches.files = matches.files.concat(descendMatches.files);
				}
				break;
			case MATCH_TYPE.MATCHED:
				if (this.TreeContext.dirs) {
					matches.dirs.push(dir.Location.clone());
				}
				break;
			}
		}

		return matches;
		
	}

	_populate() {
		//CHECK IF SHOULD REPOPULATE
		this.Location.populate(this.TreeContext);

		if (this.TreeContext.cache && this._isPopulated && (this._populatedTimeStamp > this.TreeContext._cachedTimeStamp)) {
			return;
		}

		this._isPopulated = true;
		this.dirs = [];
		this.files = [];

		if (!this.Location.doesExist) {
			console.log("Tree Location does not exit")
			return;
		}

		if (!this.Location.isDir) {
			console.log("Tree Location is not a directory");
			return;
		}

		var location = this.Location.location;

		var list = fs.readdirSync(location);

		this._populatedTimeStamp = (new Date()).getTime();

		if (!list.length) return;

		var relativeTo = this.Location.relativeTo;

		for (var i = 0, l = list.length; i < l; i++) {
			var file = list[i];
			var fullpath = path.join(location, file);
			
			var SubTreeObject = new Tree(fullpath, relativeTo, this.TreeContext);
			if (!SubTreeObject) continue;

			var SubTreeObjectLocation = SubTreeObject.Location;
			SubTreeObjectLocation.populate(this.TreeContext);

			if (!SubTreeObjectLocation.doesExist) continue;

			if (SubTreeObjectLocation.isDir) {
				this.dirs.push(SubTreeObject);
			} else if (SubTreeObjectLocation.isFile) {
				this.files.push(SubTreeObjectLocation);
			}
		}

	}
}

module.exports = Tree;