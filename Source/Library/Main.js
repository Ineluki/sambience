const Library = require('./Library.js');
const Control = require('../Playback/Control.js');
const debug = require('debug')('sambience');
const Config = require('../Util/Config.js');
const DbResolver = require('../Database/Resolver.js');


const lib = new Library( DbResolver );

lib.waitForInit()
.then(() => {
	let dirIndexRoot = lib.getStorage().getIndexView('directory',[]);
	if (dirIndexRoot.length === 0) {
		let p = Promise.resolve();
		Config.get('library.baseDirs',[]).forEach((dir) => {
			p = p.then(() => {
				return lib.scan(dir);
			});
		});
		return p;
	}
}).then(() => {
	return lib.getStorage().getSetting("playmode",Control.MODE_NORMAL)
	.then(mode => {
		Control.setMode(mode);
	})
})
.then(() => {
	return lib.getPlaylistOverview()
	.then(res => {
		if (res.length === 0) {
			return lib.createPlaylist("New Playlsit");
		}
	});
})
.then(() => {
	debug("lib init complete");
},(err) => {
	debug("error init lib",err);
});

// lib.reload();
//
// lib.waitForPlaylists.then((lists) => {
// 	debug(lists.length+" playlists loaded");
// 	lists.forEach((pl) => {
// 		if (!Control.getPlaylist()) {
// 			Control.setPlaylist(pl);
// 		}
// 	});
// }).catch((err) => {
// 	console.log("error loading playlists",err);
// });
//
// lib.waitForIndices.then(() => {
// 	debug("indices loaded");
// 	if (lib.getIndex(Library.INDEX_DIR).getRoot().getSize() === 0) {
// 		let p = Promise.resolve();
// 		Config.get('library.baseDirs',[]).forEach((dir) => {
// 			p = p.then(() => {
// 				return lib.scan(dir);
// 			});
// 		});
// 	}
// }).catch((err) => {
// 	console.log("error loading indices",err);
// });

module.exports = lib;