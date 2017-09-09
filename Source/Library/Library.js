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

		this.indices = new Map();
	}

	loadPlaylists() {
		return this.playlistStorage.getLists()
		.then((lists) => {
			lists.forEach((pl) => {
				this.playlists.set(pl._id,pl);
			});
			return lists;
		});
	}

	loadIndices() {
		let waitFor = [];
		this.indices[Library.INDEX_DIR] = new DirectoryIndex(this.storage);
		waitFor.push( this.indices[Library.INDEX_DIR].buildIndex() );
		this.indices[Library.INDEX_ARTIST] = new ArtistIndex(this.storage);
		waitFor.push( this.indices[Library.INDEX_ARTIST].buildIndex() );
		return Promise.all(waitFor);
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
		return this.indices[type];
	}

	getPlaylist(id) {
		return this.playlists.get(id);
	}

	getPlaylistOverview() {
		let res = [];
		this.playlists.forEach((pl) => {
			res.push(pl.getMeta());
		});
		return res;
	}

	savePlaylist(pl) {
		return this.playlistStorage.save(pl);
	}

	deletePlaylist(pl) {
		return this.playlistStorage.delete(pl)
		.then((res) => {
			this.playlists.delete(pl._id);
			return res;
		});
	}

}

Library.INDEX_DIR = 'directory';
Library.INDEX_ARTIST = 'artist';

module.exports = Library;