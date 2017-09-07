const debug = require("debug")("music");
const IndexNode = require('./Node.js');
const AbstractIndex = require('./AbstractIndex.js');

class DirectoryIndex extends AbstractIndex {



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
			this.storage.getReadStream({})
			.on('data',(i) => {
				if (i.file) this.addPath(i.file);
			})
			.on('end',() => {
				this.root = this.root.findRoot();
				resolve();
			})
			.on('error',e => { reject(e); });
		});
	}



	/**
	 * take a path from the index and return a promise for items
	 * @return Promise
	 **/
	handleInput(path) {
		let p = '/'+path.join('/');
		return this.storage.searchByPath( p );
	}


}

module.exports = DirectoryIndex;