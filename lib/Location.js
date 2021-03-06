"use strict";

var osenv = require("osenv");
var hbs = require("handlebars");
var fs = require("fs");
var path = require("path");

var slashReplaceRegEx = /\\/g;

class Location {

	constructor(location, relativeTo) {
		this.init(location, relativeTo);
	}

	init(location, relativeTo) {
		if (arguments.length === 0) return;

		this.relativeTo = Location.toAbsolute(relativeTo);
		this.location = Location.toAbsolute(location, this.relativeTo);

		this.relativeLocation = this.location.slice(this.relativeTo.length);
		if (this.relativeLocation[0] === "/") {
			this.relativeLocation = this.relativeLocation.slice(1);
		}

		this.basename = path.basename(this.location);
		this.extname = path.extname(this.location);
		this.filename = path.basename(this.location, this.extname);
		this.dirname = path.dirname(this.location);

		this.depth = this._getDepth(this);

		this._isPopulated = false;
		this._populatedTimeStamp = 0;

		this.isDir = false;
		this.isFile = false;
		this.doesExist = false;

		this.birthtime = 0;
		this.ctime = 0;
		this.mtime = 0;
		this.size = 0;
	}

	_getDepth() {
		var stringsearch = "/", count = 0;
		for(var index=-2; index != -1; count++,index=this.relativeLocation.indexOf(stringsearch,index+1) );
		return count;
	}

	clone() {
		var clone = new Location();
		clone.doesExist = this.doesExist;
		clone.isFile = this.isFile;
		clone.isDir = this.isDir;
		clone._isPopulated = this._isPopulated;
		clone._populatedTimeStamp = this._populatedTimeStamp;
		clone.depth = this.depth;
		clone.dirname = this.dirname;
		clone.filename = this.filename;
		clone.extname = this.extname;
		clone.basename = this.basename;
		clone.relativeLocation = this.relativeLocation;
		clone.location = this.location;
		clone.relativeTo = this.relativeTo;
		clone.birthtime = this.birthtime;
		clone.ctime = this.ctime;
		clone.mtime = this.mtime;
		clone.size = this.size;
		return clone;
	}

	populate(options) {
		//CHECK IF SHOULD REPOPULATE
		options = options || {};
		
		if (options.cache === undefined) options.cache = true;
		if (options.cache) {
			if (!options._cachedTimeStamp) options._cachedTimeStamp = (new Date()).getTime();
			if (this._isPopulated && (this._populatedTimeStamp > options._cachedTimeStamp)) return this;
		}	

		this._isPopulated = true;

		if (!fs.existsSync(this.location)) {

			this.isDir = false;
			this.isFile = false;
			this.doesExist = false;

		} else {

			var stat = fs.statSync(this.location);

			this.birthtime = stat.birthtime;
			this.ctime = stat.ctime;
			this.mtime = stat.mtime;
			this.size = stat.size;

			this.doesExist = true;
			
			if (stat.isFile()) {
				this.isDir = false;
				this.isFile = true;
			} else if (stat.isDirectory()) {
				this.isDir = true;
				this.isFile = false;
			}

		}

		this._populatedTimeStamp = (new Date()).getTime();

		return this;
	}

	//translate relative paths to absolute paths
	static toAbsolute(location, relativeTo) {

		//if no location defined, assume cwd
		relativeTo = relativeTo || "";
		relativeTo = Location.convertToPosixSlashes(relativeTo);
		relativeTo = path.posix.normalize(relativeTo);

		if (relativeTo === ".") relativeTo = Location.cwd();

		location = location || "";
		location = Location.convertToPosixSlashes(location);

		if (location === "") return relativeTo;
		location = location + "";

		var firstCharacter = location.substr(0,1);
		var secondCharacter = location.substr(1,1);

		//take into consideration the ~ home variable
		if (firstCharacter === "~") {
			location = path.posix.join( Location.home(), location.substr(1));
		}

		var firstCharacter = location.substr(0,1);
		var secondCharacter = location.substr(1,1);
		
		//if path is absolute
		if (firstCharacter === "/" || 
			secondCharacter === ":") return path.posix.normalize(location);
		
		//if path is not absolute
		return path.posix.join(relativeTo, location);

	}

	static toRelative(location, relativeTo) {
		location = Location.toAbsolute(location);
		relativeTo = Location.toAbsolute(relativeTo);
		var relative =  location.substr(relativeTo.length);
		if (relative[0] === "/") relative = relative.substr(1);
		return relative;
	}

	static cwd() {
		var cwd = process.cwd();
		return Location.convertToPosixSlashes(cwd);
	}

	static home() {
		var home = osenv.home();
		return Location.convertToPosixSlashes(home);
	}

	//string replace using handlebars and a context object
	static contextReplace(location, context) {
		if (location instanceof Array) {
			var locations = [];
			for (var i = 0, l = location.length; i < l; i++) {
				var template = hbs.compile(location[i]);
				var loc = template(context);
				loc = path.posix.normalize(loc);
				locations.push(loc);
			}
			return locations;
		}

		var loc = hbs.compile(location)(context)
		loc = path.posix.normalize(loc);
		return loc;
	}

	static convertToPosixSlashes(location) {
		return location.replace(slashReplaceRegEx, "/");
	}

}

module.exports = Location;
