const MetaScan = require("./MetaScan.js");
const Walker = require('folder-walker');
const MetaStorage = require('./Storage.js');
const PlaylistStorage = require('./PlaylistStorage.js');
const Playlist = require('../Model/Playlist.js');
const ArtistIndex = require('./Index/Artist.js');
const DirectoryIndex = require('./Index/Directory.js');
const debug = require('debug')('sambience');
const Status = require('../Playback/Status.js');
const debounce = require('lodash.debounce');
const Error = require('../Util/Error.js');

class Library {

	constructor() {
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

	scan(path) {
		if (this.scanning) return false;
		debug("scanning at "+path);
		this.scanning = true;
		let walker = Walker(path);
		let meta = new MetaScan();
		let store = this.storage.getWriteStream();
		walker.pipe(meta).pipe(store);
		this.emitProgress(walker,meta,store,'scan',path);
		return true;
	}

	updateLib(path) {
		if (this.scanning) return false;
		debug("updating lib at "+path);
		this.scanning = true;
		let entries = this.storage.getReadStream({ file: { $regex: this.storage.getPathStartRegexp(path) } });
		let store = this.storage.getWriteStream();
		let meta = new MetaScan();
		this.emitProgress(entries,meta,store,'update',path);
		entries.pipe(meta).pipe(store);
		return true;
	}

	emitProgress(walker,meta,store,type,path) {
		let parsed = 0;
		const emitUpdate = debounce(() => {
			Status.scan({
				type: type,
				progress: parsed
			});
		},500,{ leading: true, maxWait: 500, trailing: false });
		const endScan = (e) => {
			debug("endScan",type,e);
			if (e) {
				Status.error(new Error(e));
			}
			this.scanning = false;
			walker.destroy();
			meta.destroy();
			store.destroy();
			Status.scan({
				type: type,
				finished: true,
				path: path
			});
		};
		meta.on('progress',() => {
			parsed += 1;
			debug("progress",parsed);
			emitUpdate();
		});
		store.on('error',endScan);
		store.on('finish',endScan);
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