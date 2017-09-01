const Library = require('./Library.js');
const debug = require('debug')('music');

const lib = new Library();

lib.loadPlaylists()
.then((lists) => {
	debug(lists.length+" playlists loaded");
	lists.forEach((pl) => {
		debug(`${pl.name} - ${pl.root.size}`);
	});
}).catch((err) => {
	console.log("error loading playlists",err);
});

lib.loadIndices()
.then(() => {
	debug("indices loaded");
	// let index = lib.indices[Library.INDEX_DIR].root;
	// debug(JSON.stringify(index));
}).catch((err) => {
	console.log("error loading indices",err);
});

module.exports = lib;