var osenv = require("osenv");
var hbs = require("handlebars");
var fs = require("fs");
var path = require("path");

var Location = module.exports = function(location, relativeTo) {

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

	this.depth = getDepth.call(this);

	this._isPopulated = false;
	this._populatedTimeStamp = 0;

	this.isDir = false;
	this.isFile = false;
	this.doesExist = false;

	this.birthtime = 0;
	this.ctime = 0;
	this.mtime = 0;
	this.size = 0;
	
	function getDepth() {
		var stringsearch = "/", count = 0;
		for(var index=-2; index != -1; count++,index=this.relativeLocation.indexOf(stringsearch,index+1) );
		return count;
	}
};

Location.prototype.clone = function() {
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
};

Location.prototype.populate = function(options) {
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
};

//translate relative paths to absolute paths
Location.toAbsolute = function(location, relativeTo) {

	//if no location defined, assume cwd
	relativeTo = relativeTo || "";
	relativeTo = Location.convertToUNIXSlashes(relativeTo);
	relativeTo = path.posix.normalize(relativeTo);

	if (relativeTo === ".") relativeTo = Location.cwd();

	location = location || "";
	location = Location.convertToUNIXSlashes(location);

	if (location === "") return relativeTo;
	location = location + "";

	var firstCharacter = location.substr(0,1);
	var secondCharacter = location.substr(1,1);

	//take into consideration the ~ home variable
	if (firstCharacter === "~") {
		location = path.posix.join( Location.home(), location.substr(1));
	}
	
	//if path is absolute
	if (firstCharacter === "/" || 
		secondCharacter === ":") return path.posix.normalize(location);
	
	//if path is not absolute
	return path.posix.join(relativeTo, location);

};

Location.cwd = function() {
	var cwd = process.cwd();
	return Location.convertToUNIXSlashes(cwd);
};

Location.home = function() {
	var home = osenv.home();
	return Location.convertToUNIXSlashes(home);
};

//string replace using handlebars and a context object
Location.contextReplace = function(location, context) {
	if (location instanceof Array) {
		var locations = [];
		for (var i = 0, l = location.length; i < l; i++) {
			var template = hbs.compile(locations[i]);
			locations.push(template(context));
		}
		return locations;
	}

	return hbs.compile(location)(context);
};

var slashReplaceRegEx = /\\/g;
Location.convertToUNIXSlashes = function(location) {
	return location.replace(slashReplaceRegEx, "/");
};
