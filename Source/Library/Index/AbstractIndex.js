
const IndexNode = require('./Node.js');

class AbstractIndex {

	constructor(storage) {
		this.storage = storage;
		this.root = new IndexNode('root','');
	}

	getIndex(path) {
		if (path && !path.map) {
			path = [path];
		}
		return this.root.traverseByPath(path);
	}

	getRoot() {
		return this.root;
	}

	toJSON() {
		return this.root.toJSON();
	}

}

module.exports = AbstractIndex;