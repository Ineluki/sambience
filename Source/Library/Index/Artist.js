const debug = require("debug")("music");
const IndexNode = require('./Node.js');

class ArtistIndex {

	constructor(storage) {
		this.storage = storage;
	}

	getIndex() {
		let tree = { name: 'root', path: '/', children: {} };
		const addPath = function(p) {
			if (!p.artist || !p.album || !p.title) return;
			let parts = [p.artist,p.album,p.title];
			let node = tree;
			let accumulated = [];
			parts.forEach((p,i) => {
				accumulated.push(p);
				if (!node.children[p]) {
					node.children[p] = {
						name: p,
						path: accumulated
					};
					if (i < parts.length-1) {
						node.children[p].children = {};
					}
				}
				node = node.children[p];
			});
		};
		const _this = this;
		return new Promise(function(resolve, reject) {
			let read = _this.storage.getReadStream({})
			.on('data',i => { addPath(i); })
			.on('end',() => { resolve( tree ); })
			.on('error',e => { reject(e); });
		});
	}

	handleInput(path) {
		let [artist,album,song] = path;
		return this.storage.searchByArtist( artist, album, song );
	}

}

module.exports = ArtistIndex;