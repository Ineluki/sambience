const MetaScan = require("./MetaScan.js");
const FolderScan = require('./FolderScan.js');
const MetaStorage = require('./Storage.js');
const PlaylistStorage = require('./PlaylistStorage.js');
const Playlist = require('../Model/Playlist.js');
const ArtistIndex = require('../Model/Index/Artist.js');
const DirectoryIndex = require('../Model/Index/Directory.js');
const debug = require('debug')('sambience');
const Status = require('../Playback/Status.js');
const debounce = require('lodash.debounce');
const Error = require('../Util/Error.js');
const Config = require('../Util/Config.js');
const pump = require('pump');

class Library {

	constructor() {
		this.storage = new MetaStorage( Config.get('database.music') );
		this.playlistStorage = new PlaylistStorage( Config.get('database.playlist'), this.storage );
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

	reload() {
		debug("reloading lib");
		this.waitForPlaylists = this.loadPlaylists();
		this.waitForIndices = this.loadIndices();

		return Promise.all([this.waitForPlaylists, this.waitForIndices]);
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
		let walker = new FolderScan(path);
		let meta = new MetaScan({
			update: false,
			allowedEndings: Config.get('library.allowedFileExtensions')
		});
		let store = this.storage.getWriteStream();
		this.emitProgress(walker,meta,store,'scan',path);
		return true;
	}

	updateLib(path) {
		if (this.scanning) return false;
		debug("updating lib at "+path);
		this.scanning = true;
		let entries = this.storage.getReadStream({ file: { $regex: this.storage.getPathStartRegexp(path,true) } });
		let store = this.storage.getWriteStream();
		let meta = new MetaScan({
			update: true,
			allowedEndings: Config.get('library.allowedFileExtensions')
		});
		this.emitProgress(entries,meta,store,'update',path);
		return true;
	}

	emitProgress(walker,meta,store,type,path) {
		let parsed = 0;
		const emitUpdate = debounce(() => {
			debug("emitting",parsed);
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

			Status.scan({
				type: type,
				finished: true,
				path: path
			});
			this.reload();
		};
		meta.on('progress',() => {
			parsed += 1;
			debug("progress",parsed);
			emitUpdate();
		});
		pump(walker,meta,store,endScan);
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