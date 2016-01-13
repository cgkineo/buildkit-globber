"use strict";

var fs = require("fs");
var path = require("path");
var Tree = require("./Tree.js");
var GlobCollection = require("./GlobCollection.js");
var Location = require("./Location.js");

class FileSystem {

	static collate(from, to, at, copyGlobs, destGlobs, callback) {

		var tree = new Tree(from, ".");
		var globs = new GlobCollection(copyGlobs);
		var list = tree.mapGlobs(globs).files;

		from = Location.toAbsolute(from);

		if (!fs.existsSync(to)) {
			FileSystem.mkdir( to);
		}

		var diffTree = new Tree(to, ".");
		var diffGlobs = new GlobCollection(destGlobs);
		var diffList = diffTree.mapGlobs(diffGlobs).files;

		to = Location.toAbsolute(to);

		for (var i = 0, l = list.length; i < l; i ++) {
			var srcItem = list[i];
			var shortenedPathSrc = (srcItem.location).substr( (srcItem.location).indexOf(at) + at.length  );
			if (shortenedPathSrc.substr(0,1) == "/") shortenedPathSrc = shortenedPathSrc.substr(1);
			srcItem.shortenedPathSrc = shortenedPathSrc;
		}

		for (var d = diffList.length -1, dl = -1; d > dl; d--) {
			var destItem = diffList[d];
			var shortenedPathDest = (destItem.location).substr( to.length  );
			if (shortenedPathDest.substr(0,1) == "/") shortenedPathDest = shortenedPathDest.substr(1);

			var found = false;
			for (var i = 0, l = list.length; i < l; i ++) {
				var srcItem = list[i];
				if (shortenedPathDest === srcItem.shortenedPathSrc) {
					found = true;
					break;
				}
				
			}
			
			if (!found) {
				if (destItem.isDir) {
					fs.rmdirSync(destItem.location);
				} else {
					fs.unlinkSync(destItem.location);
				}
			}
		}

		var copyTasks = [];
		var copyInterval = null;
		var copyTasksRunning = 0;

		for (var i = 0, l = list.length; i < l; i ++) {
			var item = list[i];
			var shortenedPath = (item.location).substr( (item.location).indexOf(at) + at.length  );
			var outputPath = path.join(to, shortenedPath);

			if (item.dir) {
				FileSystem.mkdir( outputPath, { norel: true });
			} else {
				var dirname = path.dirname(outputPath);
				FileSystem.mkdir( dirname, { norel: true });

				if (fs.existsSync(outputPath)) {
					var outputStat = fs.statSync(outputPath);
					if (outputStat.mtime >= item.mtime && outputStat.ctime >= item.ctime) continue;
				} 

				addCopyTask(item.location, outputPath);
			}
			
		}

		copyTaskEnd();
		
		function addCopyTask(from, to) {
			copyTasks.push({
				from: from,
				to: to
			});
			startCopyTasks();
		}
		function startCopyTasks() {
			if (copyInterval !== null) return;
			copyInterval = setInterval(copyLoop, 0);
		}
		function copyLoop() {
			for (var i = 0, l = copyTasks.length; i < l && copyTasksRunning < 5; i++) {
				var task = copyTasks.shift();
				copyTasksRunning++;
				var rs = fs.createReadStream(task.from);
				var ws = fs.createWriteStream(task.to);
				rs.pipe(ws);
				rs.on("end", copyTaskDone);
				rs.on("error", function(e) {
					console.log(e);
				});
				ws.on("error", function(e) {
					console.log(e);
				});
			}
		}
		function copyTaskDone() {
			copyTasksRunning--;
			copyTaskEnd();
		}
		function copyTaskEnd() {
			if (copyTasksRunning === 0 && copyTasks.length === 0) {
				clearInterval(copyInterval);
				copyInterval = null;
				callback();
			}
		}
	}

	static copy(from, to, copyGlobs, callback) {

		var tree = new Tree(from, ".");
		var globs = new GlobCollection(copyGlobs);
		var list = tree.mapGlobs(globs).files;

		from = Location.toAbsolute(from);

		var copyTasks = [];
		var copyInterval = null;
		var copyTasksRunning = 0;

		for (var i = 0, l = list.length; i < l; i ++) {
			var item = list[i];
			var shortenedPath = (item.location).substr(from.length);
			var outputPath = path.join(to, shortenedPath);

			if (item.dir) {
				FileSystem.mkdir( outputPath, { norel: true });
			} else {
				var dirname = path.dirname(outputPath);
				FileSystem.mkdir( dirname, { norel: true });

				if (fs.existsSync(outputPath)) {
					var outputStat = fs.statSync(outputPath);
					if (outputStat.mtime >= item.mtime && outputStat.ctime >= item.ctime) continue;
				} 

				addCopyTask(item.location, outputPath);
			}
			
		}

		copyTaskEnd();

		
		function addCopyTask(from, to) {
			copyTasks.push({
				from: from,
				to: to
			});
			startCopyTasks();
		}
		function startCopyTasks() {
			if (copyInterval !== null) return;
			copyInterval = setInterval(copyLoop, 0);
		}
		function copyLoop() {
			for (var i = 0, l = copyTasks.length; i < l && copyTasksRunning < 5; i++) {
				var task = copyTasks.shift();
				copyTasksRunning++;
				var rs = fs.createReadStream(task.from);
				var ws = fs.createWriteStream(task.to);
				rs.pipe(ws);
				rs.on("end", copyTaskDone);
				rs.on("error", function(e) {
					console.log(e);
				});
				ws.on("error", function(e) {
					console.log(e);
				});
			}
		}
		function copyTaskDone() {
			copyTasksRunning--;
			copyTaskEnd();
		}
		function copyTaskEnd() {
			if (copyTasksRunning === 0 && copyTasks.length === 0) {
				clearInterval(copyInterval);
				copyInterval = null;
				callback();
			}
		}
	}

	static mkdir(dest, options) {
		//make a directory recursively if need be

		options = options || {};

		var pathSplit = /(\/|\\){1}[^\/\\]+/g;

		dest = Location.toAbsolute(dest);
		if (fs.existsSync(dest)) return true;

		var parts;
		var begin;
		if (options.norel) {
			parts = dest.match(pathSplit);
			var orig = dest.replace(/\\/g, "/");
			begin = parts.join("").replace(/\\/g, "/");
			
			begin = orig.substr(0, orig.indexOf(begin));
			if (orig.substr(0,1) == "/" && options.norel && begin == "") begin = "/";

		} else {
			if (options.root === undefined) options.root = process.cwd();
			options.root = Location.toAbsolute(options.root);
			dest = dest+"";

			var shortenedPath = (dest).substr(options.root.length);

			parts = shortenedPath.match(pathSplit);
		}

		var created = "";

		for (var p = 0, l = parts.length; p < l; p++) {
			if (p === 0) {
				created+=parts[p].substr(1);
			} else {
				created+=parts[p];
			}
			var outputPath;
			if (options.norel){
				outputPath = path.join(begin, created);
			} else {
				outputPath = path.join(options.root, created);;
			}
			if (fs.existsSync(outputPath)) continue;
			fs.mkdirSync(outputPath, 0o777);
		}
	}

	static remove(dest, removeGlobs) {
		var tree = new Tree(dest, ".");
		var globs = new GlobCollection(removeGlobs);
		var list = tree.mapGlobs(globs);

		var dirs = list.dirs;
		var files = list.files;
		for (var i = 0, l = files.length; i < l; i++) {
			if (fs.existsSync(files[i].location)) {
				fs.unlinkSync(files[i].location);
			}
		}
		for (var i = dirs.length - 1, l = -1; i > l; i--) {
			if (fs.existsSync(dirs[i].location)) {
				fs.rmdirSync(dirs[i].location);
			}
		}
	}

	static rm(path) {
		if (!fs.existsSync(path)) return;
		if (!fs.statSync(path).isDirectory()) {
			fs.unlinkSync(path);
			return;
		}

		FileSystem.remove(Location.toAbsolute(path), [ "**" ]);
		if (fs.existsSync(path)) fs.rmdirSync(path);
	}


}

module.exports = FileSystem;