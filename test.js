"use strict";

//import library
var GlobCollection = require("./index.js").GlobCollection;
var TreeContext = require("./index.js").TreeContext;
var Location = require("./index.js").Location;

//create sample glob collections for Adapt Learning

//search for all javascript and nested javascript inside each plugin and the core
var Javascript = new GlobCollection([
	"src/*/*/js/*.js",
	"src/*/*/js/**/*.js",
	"src/core/js/*.js",
	"src/core/js/**/*.js"
]);

//search for all handlebars and nested handlebars inside each plugin and the core
var Handlebars = new GlobCollection([
	"src/*/*/templates/*.hbs",
	"src/*/*/templates/**/*.hbs",
	"src/core/templates/*.hbs",
	"src/core/templates/**/*.hbs"
]);

//search for all less and nested less inside each plugin and the core
var Less = new GlobCollection([
	"src/*/*/less/*.less",
	"src/*/*/less/**/*.less",
	"src/core/less/*.less",
	"src/core/less/**/*.less"
]);

//ignore the build folder
var BuildIgnores = new GlobCollection([
	"!build"
]);

//ignore hidden files and the node_modules folder
var GeneralIgnores = new GlobCollection([
	"!**/.*",
	"!.*",
	"!node_modules",
	"!**/node_modules"
]);

//create tree context
var TreeContext = new TreeContext({
	files: true,
	dirs: true,
	cache:true
});
var Tree = TreeContext.Tree(".","test");

//setup timer variables
var stime = (new Date()).getTime();

//setup loop for performance tests
for (var i = 0, l = 1; i < l; i++) {

	//run globs
	var rtn = Tree.mapGlobs(Javascript, BuildIgnores, GeneralIgnores);
	var files = pluck(rtn.files, "relativeLocation");
	var dirs = pluck(rtn.dirs, "relativeLocation");

	console.log(files);
	console.log(dirs);

	//clear cache at this point
	/*TreeContext.recache();*/

	var ep1time = (new Date()).getTime();
	console.log( (ep1time - stime) / 1 );

	var rtn = Tree.mapGlobs(Handlebars, BuildIgnores, GeneralIgnores);
	var files = pluck(rtn.files, "relativeLocation");
	var dirs = pluck(rtn.dirs, "relativeLocation");

	console.log(files);
	console.log(dirs);

	var ep2time = (new Date()).getTime();
	console.log( (ep2time - ep1time) / 1 );

	var rtn = Tree.mapGlobs(Less, BuildIgnores, GeneralIgnores);
	var files = pluck(rtn.files, "relativeLocation");
	var dirs = pluck(rtn.dirs, "relativeLocation");

	console.log(files);
	console.log(dirs);

	var ep3time = (new Date()).getTime();
	console.log( (ep3time - ep2time) / 1 );

	var rtn = Tree.mapGlobs("build/**", GeneralIgnores);
	var files = pluck(rtn.files, "relativeLocation");
	var dirs = pluck(rtn.dirs, "relativeLocation");

	console.log(files);
	console.log(dirs);
}

var etime = (new Date()).getTime();

console.log( (etime - ep3time) / 1 );


var JavascriptWatch = Tree.watchGlobs(Javascript, GeneralIgnores);
JavascriptWatch.on("change", function(tree, files, dirs) {
	console.log("javascript change");
	console.log(files);
});
JavascriptWatch.start();

var HandlebarsWatch = Tree.watchGlobs(Handlebars, GeneralIgnores);
HandlebarsWatch.on("change", function(tree, files, dirs) {
	console.log("handlebars change");
	console.log(files);
});
HandlebarsWatch.start();

var LessWatch = Tree.watchGlobs(Less, GeneralIgnores);
LessWatch.on("change", function(tree, files, dirs) {
	console.log("less change");
	console.log(files);
});
LessWatch.start();


//utility functions
function pluck(items, name, name2) {
	var names = [].slice.call(arguments, 1);
	var rtn = [];
	for (var i = 0, l = items.length; i < l; i++) {
		var value = get(items[i], names);
		if (value) rtn.push(value);
	}
	return rtn;
}

function get(obj, names) {
	var context = obj;
	for (var i = 0, l = names.length; i < l; i++) {
		var name = names[i];
		if (context[name] !== undefined) context = context[name];
		else return undefined;
	}
	return context;
}
