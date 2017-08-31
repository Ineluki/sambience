

class DirectoryIndex {

	constructor(storage) {
		this.storage = storage;
	}

	getIndex() {
		let tree = { name: 'root', path: '/', children: {} };
		const addPath = function(p) {
			let parts = p.split('/');
			let node = tree;
			let accumulated = '';
			parts.forEach((p,i) => {
				accumulated += '/'+p;
				if (!node.children[p]) {
					node.children[p] = {
						name: p,
						path: accumulated.substr(1)
					};
					if (i < parts.length-1) {
						node.children[p].children = {};
					}
				}
				node = node.children[p];
			});
		};
		const findRoot = function(tree) {
			if (tree.children) {
				let keys = Object.keys(tree.children);
				if(keys.length < 2) {
					return findRoot(tree.children[keys[0]]);
				}
				return tree;
			}
			return tree;
		}
		const _this = this;
		return new Promise((resolve, reject) => {
			this.createReadStream();
			.on('data',i => {
				if (i.file) {
					addPath(i.file);
				}
			})
			.on('end',() => { resolve( findRoot(tree) ); })
			.on('error',e => { reject(e); });
		});
	}

	handleInput(path) {
		return this.storage.searchByPath( path );
	}

}

module.exports = DirectoryIndex;