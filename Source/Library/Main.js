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

module.exports = lib;