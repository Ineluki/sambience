const Library = require('./Library.js');
const Control = require('../Playback/Control.js');
const debug = require('debug')('sambience');
const Config = require('../Util/Config.js');

const lib = new Library();

lib.reload();

lib.waitForPlaylists.then((lists) => {
	debug(lists.length+" playlists loaded");
	lists.forEach((pl) => {
		if (!Control.getPlaylist()) {
			Control.setPlaylist(pl);
		}
	});
}).catch((err) => {
	console.log("error loading playlists",err);
});

lib.waitForIndices.then(() => {
	debug("indices loaded");
	if (lib.getIndex(Library.INDEX_DIR).getRoot().getSize() === 0) {
		let p = Promise.resolve();
		Config.get('library.baseDirs',[]).forEach((dir) => {
			p = p.then(() => {
				return lib.scan(dir);
			});
		});
	}
}).catch((err) => {
	console.log("error loading indices",err);
});

module.exports = lib;