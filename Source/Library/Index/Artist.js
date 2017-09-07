const debug = require("debug")("music");
const IndexNode = require('./Node.js');
const AbstractIndex = require('./AbstractIndex.js');

class ArtistIndex extends AbstractIndex {

	addPath(p) {
		if (!p.artist || !p.album || !p.title) return;
		let parts = [p.artist,p.album,p.title];
		let node = this.root;
		parts.forEach((p,i) => {
			node = node.addChild(p,p);
		});
	};

	buildIndex() {
		return new Promise((resolve, reject) => {
			let read = this.storage.getReadStream({})
			.on('data',i => { this.addPath(i); })
			.on('end',resolve)
			.on('error',e => { reject(e); });
		});
	}

	handleInput(path) {
		let [artist,album,song] = path;
		return this.storage.searchByArtist( artist, album, song );
	}

}

module.exports = ArtistIndex;