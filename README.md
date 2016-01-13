#buildkit-treeglob
Buildkit file globbing utility

## What Does It Do?
Returns arrays of file and directory properties according to globs and a tree.
Performs file and directory change watching according to globs and a tree.

## Use
a. Install buildkit-globber
```
npm install --save buildkit-globber
```
b. Require
```
//node v4
var GlobCollection = require("buildkit-globber").GlobCollection;
var TreeContext = require("buildkit-globber").TreeContext;
var WatchCollection = require("buildkit-globber").WatchCollection;
var FileSystem = require("buildkit-globber").FileSystem;
var Location = require("buildkit-globber").Location;
var MATCH_TYPE = require("buildkit-globber").MATCH_TYPE;


//node v5+
var {GlobCollection,
	TreeContext,
	Tree,
	WatchCollection,
	Location,
	FileSystem,
	MATCH_TYPE} = require("buildkit-globber");
```
c. Use API.
See below.


## Glob
A description of the files / directories expected.

```
"*/*/*.js" // all javascript files, two directories into the tree
"*/**/*.js" // all javascript files, one directory and above in the tree
"src/*/js/**/*.js" // all of javascript files in the subfolders of the 'js' folder located in each of the "src" folder's sub directories.
"!**/.*" // not all nested hidden files
"!node_modules" // not the immediate node_modules folder
"!**/node_modules" // no any sub node_modules folder

var globs = new GlobCollection([
	"src/*/js/*.js",
	"src/*/js/**/*.js",
	"!**/.*"
]);

var ignores = new GlobCollection([
	"!node_modules",
	"!**/node_modules"
]);

```

##Tree Context
An collection of options for a group of Tree objects.
```
var treecontext = new TreeContext({
	files: true,
	dirs: true,
	cache: true
});

treecontext.clearCache();

```


## Tree
A directory "." relative to another directory "/home/user/Destkop".

```
var tree = treecontext.Tree(".","/working/project_number");

tree.populate();

tree.dirs;
tree.files;
tree.subtrees;
tree.TreeContext;

```
Alternatively, without a treecontext
```
var tree = new Tree(".","/working/project_number");

tree.populate();

tree.dirs;
tree.files;
tree.subtrees;
tree.TreeContext;

```


## Glob + Tree Together
```
	
	//fetch all files + dirs in tree by globs:
	var locationObjects = tree.mapGlobs(globs, ignores);

	locationObjects.files[0-x].relativeLocation;
	locationObjects.files[0-x].ctime;
	locationObjects.files[0-x].mtime;
	locationObjects.files[0-x].size;
	locationObjects.files[0-x].isFile;
	locationObjects.files[0-x].isDir;
	locationObjects.files[0-x].basename;
	locationObjects.files[0-x].extname;
	locationObjects.files[0-x].filename;
	locationObjects.files[0-x].dirname;
	locationObjects.files[0-x].depth;
	locationObjects.files[0-x].location;
	locationObjects.files[0-x].relativeTo;

	locationObjects.dirs[0-x].relativeLocation;
	locationObjects.dirs[0-x].ctime;
	locationObjects.dirs[0-x].mtime;
	locationObjects.dirs[0-x].size;
	locationObjects.dirs[0-x].isFile;
	locationObjects.dirs[0-x].isDir;
	locationObjects.dirs[0-x].basename;
	locationObjects.dirs[0-x].extname;
	locationObjects.dirs[0-x].filename;
	locationObjects.dirs[0-x].dirname;
	locationObjects.dirs[0-x].depth;
	locationObjects.dirs[0-x].location;
	locationObjects.dirs[0-x].relativeTo;



	//watch all files + dirs in tree by globs:
	var watchObject = tree.watchGlobs(globs, ignores);
	watchObject.on("change", function(tree, files, dirs) {

		files[0-x].location.ctime;
		files[0-x].change = "updated/deleted/created";

	});
	watchObject.start();
	watchObject.stop();
	watchObject.start();


```

## Location Object
```

	var location = new Location("src", ".");
	location.populate({cache: true});

	location.doesExist;
	location.isFile;
	location.isDir;
	location._isPopulated;
	location._populatedTimeStamp;
	location.depth;
	location.dirname;
	location.filename;
	location.extname;
	location.basename;
	location.relativeLocation;
	location.location;
	location.relativeTo;
	location.birthtime;
	location.ctime;
	location.mtime;
	location.size;
	location.clone();
	location.populate();



	Location.toAbsolute(string location, [string relativeTo]);
	Location.toRelative(string location, [string relativeTo]);
	Location.cwd();
	Location.home();
	Location.contextReplace(string handlebars, object context);
	Location.convertToPosixSlashes(string location);

```

##Watch Collection Object
```
	var watches = new WatchCollection();

	watches.push(watchObject);

	watches.start();
	watches.stop();
	watches.start();

```

##MATCH_TYPE
```

	MATCH_TYPE.NOTMATCHED = 0;
	MATCH_TYPE.NOTMATCHED.toString() = "NOTMATCHED";
	MATCH_TYPE.DESCEND = 1;
	MATCH_TYPE.DESCEND.toString() = "DESCEND";
	MATCH_TYPE.NOTEXCLUDED = 2;
	MATCH_TYPE.NOTEXCLUDED.toString() = "NOTEXCLUDED";
	MATCH_TYPE.MATCHED = 3;
	MATCH_TYPE.MATCHED.toString() = "MATCHED";
	MATCH_TYPE.MATCHED_DESCEND = 4;
	MATCH_TYPE.MATCHED_DESCEND.toString() = "MATCHED_DESCEND";

```

##FileSystem Object
```

	FileSystem.collate(string from, string to, string at, Array copyGlobs, Array destGlobs, function callback);
	FileSystem.copy(string from, string to, Array copyGlobs, function callback);
	FileSystem.mkdir(string dest);
	FileSystem.remove(string dest, Array removeGlobs);
	FileSystem.rm(string path);



```