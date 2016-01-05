#buildkit-treeglob
Buildkit file globbing utility

## What Does It Do?
Returns arrays of file and directory properties according to globs and a tree.
Performs file and directory change watching according to globs and a tree.

## Use
1. Install buildkit-globber
```
npm install --save buildkit-globber
```
2. Require
```
//node v4
var GlobCollection = require("buildkit-globber").GlobCollection;
var TreeContext = require("buildkit-globber").TreeContext;
var Location = require("buildkit-globber").Location;
var MATCH_TYPE = require("buildkit-globber").MATCH_TYPE;


//node v5+
var {GlobCollection, TreeContext, Location, MATCH_TYPE} = require("buildkit-globber");
```
3. Use API.
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

var Globs = new GlobCollection([
	"src/*/js/*.js",
	"src/*/js/**/*.js",
	"!**/.*"
]);

var Ignores = new GlobCollection([
	"!node_modules",
	"!**/node_modules"
]);

```


## Tree
A directory "." relative to another directory "/home/user/Destkop".

```

var TreeContext = new TreeContext({
	files: true,
	dirs: true,
	cache: true
});
var Tree = TreeContext.Tree(".","/working/project_number");

```


## Glob + Tree Together
```
	
	//fetch all files + dirs in tree by globs:
	var LocationObjects = Tree.mapGlobs(Globs, Ignores);

	LocationObjects.files[0-x].relativeLocation;
	LocationObjects.files[0-x].ctime;
	LocationObjects.files[0-x].mtime;
	LocationObjects.files[0-x].size;
	LocationObjects.files[0-x].isFile;
	LocationObjects.files[0-x].isDir;
	LocationObjects.files[0-x].basename;
	LocationObjects.files[0-x].extname;
	LocationObjects.files[0-x].filename;
	LocationObjects.files[0-x].dirname;
	LocationObjects.files[0-x].depth;
	LocationObjects.files[0-x].location;
	LocationObjects.files[0-x].relativeTo;

	LocationObjects.dirs[0-x].relativeLocation;
	LocationObjects.dirs[0-x].ctime;
	LocationObjects.dirs[0-x].mtime;
	LocationObjects.dirs[0-x].size;
	LocationObjects.dirs[0-x].isFile;
	LocationObjects.dirs[0-x].isDir;
	LocationObjects.dirs[0-x].basename;
	LocationObjects.dirs[0-x].extname;
	LocationObjects.dirs[0-x].filename;
	LocationObjects.dirs[0-x].dirname;
	LocationObjects.dirs[0-x].depth;
	LocationObjects.dirs[0-x].location;
	LocationObjects.dirs[0-x].relativeTo;



	//watch all files + dirs in tree by globs:
	var WatchObject = Tree.watchGlobs(Globs, Ignore);
	WatchObject.on("change", function(tree, files, dirs) {

		files[0-x].location.ctime;
		files[0-x].change = "updated/deleted/created";

	});
	WatchObject.start();
	WatchObject.stop();


```

## Location Object
```

	var srcTree = new Location("src", ".");
	srcTree.populate({cache: true});

	srcTree.doesExist;
	srcTree.isFile;
	srcTree.isDir;
	srcTree._isPopulated;
	srcTree._populatedTimeStamp;
	srcTree.depth;
	srcTree.dirname;
	srcTree.filename;
	srcTree.extname;
	srcTree.basename;
	srcTree.relativeLocation;
	srcTree.location;
	srcTree.relativeTo;
	srcTree.birthtime;
	srcTree.ctime;
	srcTree.mtime;
	srcTree.size;


	Location.toAbsolute(string location, [string relativeTo]);
	Location.cwd();
	Location.home();
	Location.contextReplace(string handlebars, object context);
	Location.convertToPosixSlashes(string location);

```