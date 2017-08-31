const MetaScan = require("./MetaScan.js");
const Walker = require('folder-reader');
const MetaStorage = require('./Storage.js');
const PlaylistStorage = require('./PlaylistStorage.js');
const Playlist = require('../Model/Playlist.js');
const ArtistIndex = require('./Index/Artist.js');
const DirectoryIndex = require('./Index/Directory.js');

class Library {

	constructor(path) {
		this.path = path;
		this.storage = new MetaStorage('Data/meta.db');
		this.playlistStorage = new PlaylistStorage('Data/playlist.db',this.storage);
		this.scanning = false;
		this.playlists = new Map();
	}

	loadPlaylists() {
		const _this = this;
		return this.playlistStorage.getLists()
		.then((lists) => {
			lists.forEach((pl) => {
				_this.playlists.set(pl._id,pl);
			});
			return lists;
		});
	}

	createPlaylist(name) {
		const _this = this;
		let pl = new Playlist();
		pl.name = name;
		pl.createdAt = new Date();
		pl.updatedAt = new Date();
		return this.playlistStorage.save(pl)
		.then((pl) => {
			_this.playlists.set(pl._id,pl);
			return pl;
		})
	}

	scan() {
		if (this.scanning) return;
		const _this = this;
		this.scanning = true;
		let walker = new Walker(this.path);
		let meta = new MetaScan();
		let store = this.storage.getWriteStream();
		walker.pipe(meta).pipe(store);
		let endScan = function(e) {
			if (e) console.log("ERROR: ",e);
			_this.scanning = false;
			walker.destroy();
			meta.destroy();
			store.destroy();
		};
		store.on('error',endScan);
		store.on('end',endScan);
	}

	updateLib() {
		let entries = this.storage.getReadStream({ file: { $regex: this.storage.getPathStartRegexp(this.path) } });
		let store = this.storage.getWriteStream();
		let meta = new MetaScan();
		entries.pipe(meta).pipe(store);
	}

	getIndex(type) {
		switch(type) {
			case this.INDEX_DIR:
				return new DirectoryIndex(this.storage);

			case this.INDEX_ARTIST:
				return new ArtistIndex(this.storage);

			default:
				throw new Error("unknown index type: "+type);
		}
	}

	static INDEX_DIR = 'directory';
	static INDEX_ARTIST = 'artist';

}

module.exports = Library;