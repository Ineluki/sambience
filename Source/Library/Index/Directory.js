const debug = require("debug")("music");
const IndexNode = require('./Node.js');

class DirectoryIndex {

	constructor(storage) {
		this.storage = storage;
		this.root = null;
		this.reset();
	}

	reset() {
		this.root = new IndexNode('root','');
	}

	addPath(p) {
		let parts = p.substr(1).split('/');
		let node = this.root;
		let accumulated = '';
		parts.forEach((p,i) => {
			accumulated += '/'+p;
			node = node.addChild(p,p);
		});
	};

	buildIndex() {
		return new Promise((resolve, reject) => {
			let filter = {};	//sub ? { file: { $regex: this.storage.getPathStartRegexp(sub,true) }} : {};
			debug("build dir index with filter:",filter);
			this.storage.getReadStream(filter)
			.on('data',(i) => {
				if (i.file) this.addPath(i.file);
			})
			.on('end',() => {
				this.root = this.root.findRoot();
				//this.root.parent = null;
				resolve();
			})
			.on('error',e => { reject(e); });
		});
	}

	getIndex(path) {
		if (path && !path.map) {
			path = [path];
		}
		return this.root.traverseByPath(path);
	}

	/**
	 * take a path from the index and return a promise for items
	 * @return Promise
	 **/
	handleInput(path) {
		return this.storage.searchByPath( path );
	}

	getRoot() {
		return this.root;
	}

	toJSON() {
		return this.root.toJSON();
	}

}

module.exports = DirectoryIndex;