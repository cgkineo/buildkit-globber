"use strict";

var EventEmitter = require('events').EventEmitter;

class Watch extends EventEmitter {

	constructor(tree, globCollection, options) {
		super();
		this.init(tree, globCollection, options);
	}

	init(tree, globCollection, options) {
		options = options || {};

		this.interval = options.interval || 3000;
		this.RANDOM_WINDOW = (this.interval / 4);
		this.randomInterval = this._getRandomIntInclusive(0, this.RANDOM_WINDOW);
		this._timeoutHandle = null;
		this.id = Math.random();

		this.results = tree.mapGlobs(globCollection);
		this.Tree = tree;
		this.GlobCollection = globCollection;
	}

	stop() {

		if (!this._timeoutHandle) return;

		clearTimeout(this._timeoutHandle);
		this._timeoutHandle = null;

	}

	clearCache() {

		this.Tree.TreeContext.clearCache();
		this.results = this.Tree.mapGlobs(this.GlobCollection);
	}

	start() {

		if (this._timeoutHandle) return;

		var timeoutCallback = () => { this._timeoutCallback(); };

		var calculatedInterval = (this.interval - this.RANDOM_WINDOW) + this.randomInterval;
		this._timeoutHandle = setTimeout(timeoutCallback, calculatedInterval);

	}

	_timeoutCallback() {
		//console.log("tick", this.id, this.randomInterval, (this.interval - this.RANDOM_WINDOW));
		this._timeoutHandle = null;
		this.randomInterval = this._getRandomIntInclusive(0, this.RANDOM_WINDOW);
		this._checkChanges();
	}

	_checkChanges() {

		this.Tree.TreeContext.clearCache();
		var newResults = this.Tree.mapGlobs(this.GlobCollection);

		//check if file/dir list has changed
			//check if files/dirs added
			//check if files/dirs deleted

		//check if modified times have changed on same files/paths

		//emit change event with list of changed files

		var diffFiles = this._getDifferenceBetweenLocationArrays(this.results.files, newResults.files);
		var diffDirs = this._getDifferenceBetweenLocationArrays(this.results.dirs, newResults.dirs);

		if (diffFiles.length > 0 || diffDirs.length > 0) {
			this.emit("change", this, diffFiles, diffDirs);
			this.results = newResults;
		}

		this.start();

	}

	_getDifferenceBetweenLocationArrays(oldList, newList) {

		var uniq = {};
		for (var i = 0, l = oldList.length; i < l; i++) {
			var LocationItem = oldList[i];
			var path = LocationItem.relativeLocation;
			uniq[path] = {
				"location": LocationItem,
				"change": "deleted"
			};

		}
		for (var i = 0, l = newList.length; i < l; i++) {
			var LocationItem = newList[i];
			var path = LocationItem.relativeLocation;
			if (uniq[path]) {
				var oldLocationItem = uniq[path].location;
				if (oldLocationItem.birthtime.getTime() != LocationItem.birthtime.getTime() ||
					oldLocationItem.ctime.getTime() != LocationItem.ctime.getTime() ||
					oldLocationItem.mtime.getTime() != LocationItem.mtime.getTime() ||
					oldLocationItem.size != LocationItem.size) {
					uniq[path]['location'] = LocationItem;
					uniq[path]["change"] = "updated";
				} else {
					delete uniq[path];
				}
			} else {
				uniq[path] = {
					"location": LocationItem,
					"change": "created"
				};
			}
		}
		return Object.keys(uniq).map(function (key) {
		    return uniq[key];
		});

	}

	_getRandomIntInclusive(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

}

module.exports = Watch;