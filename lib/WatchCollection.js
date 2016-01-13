"use strict";

class WatchCollection extends Array {

	constructor(tree, globCollection, options) {
		super();
	}

	stop() {

		for (var i = 0, l = this.length; i < l; i++) {
			this[i].stop();
		}

	}

	start() {

		for (var i = 0, l = this.length; i < l; i++) {
			this[i].start();
		}

	}

}

module.exports = WatchCollection;