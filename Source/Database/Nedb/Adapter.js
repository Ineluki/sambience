const AbstractAdapter = require('../AbstractAdapter.js');
const ArtistIndex = require('./Index/Artist.js');
const DirectoryIndex = require('./Index/Directory.js');
const MetaStorage = require('./MetaStorage.js');
const PlaylistStorage = require('./PlaylistStorage.js');
const SettingStorage = require('./SettingStorage.js');
const debug = require('debug')('sambience');
const Playlist = require("../../Model/Playlist.js");

class NedbAdapter extends AbstractAdapter {

	constructor(config) {
		super();
		this.storage = new MetaStorage( config.music );
		this.playlistStorage = new PlaylistStorage( config.playlist, this.storage );
		this.settingStorage = new SettingStorage( config.settings );
		this.indices = {
			directory: null,
			artist: null
		};
	}

	reloadIndices() {
		let waitFor = [];
		this.indices.directory = new DirectoryIndex(this.storage);
		waitFor.push( this.indices.directory.buildIndex() );
		this.indices.artist = new ArtistIndex(this.storage);
		waitFor.push( this.indices.artist.buildIndex() );
		return Promise.all(waitFor);
	}

	init() {
		debug("reloading lib");
		this.waitForIndices = this.reloadIndices();
		return this.waitForIndices;
	}

	getPlaylists() {
		return this.playlistStorage.getLists();
	}

	savePlaylist(pl) {
		return this.playlistStorage.save(pl);
	}

	deletePlaylist(pl) {
		return this.playlistStorage.delete(pl);
	}

	loadPlaylist(pl) {
		let p;
		let playlist;
		if (pl instanceof Playlist) {
			p = Promise.resolve(pl);
		} else {
			p = this.playlistStorage.getById(pl);
		}
		return p.then(pl => {
			playlist = pl;
			return this.storage.getByIds(pl.rawItems);
		})
		.then((items) => {
			playlist.rawItems = null;
			items.forEach(item => playlist.addFile(item));
			return playlist;
		});
	}

	updateFile(data) {
		return this.storage.updateFile(data);
	}

	searchFilesByPath(path) {
		return this.storage.searchByPath(path);
	}

	searchFilesByArtist(artist,album,song) {
		return this.storage.searchByArtist(artist,album,song);
	}

	getFilesByIds(ids) {
		return this.storage.getByIds(ids);
	}

	getFileReadStream(q) {
		return this.storage.getReadStream(q);
	}

	getFileWriteStream() {
		return this.storage.getWriteStream();
	}

	getIndexView(type,path) {
		let index;
		if (type === 'directory') {
			index = this.indices.directory;
		} else {
			index = this.indices.artist;
		}
		return index.getIndex(path).getView();
	}

	getIndexSearch(type,search) {
		let index;
		if (type === 'directory') {
			index = this.indices.directory;
		} else {
			index = this.indices.artist;
		}
		return index.getIndex([]).getFilteredView(search);
	}

	getFilesByIndex(type,input) {
		let index;
		if (type === 'directory') {
			index = this.indices.directory;
		} else {
			index = this.indices.artist;
		}
		return index.handleInput(input);
	}

	getSetting(key,def) {
		return this.settingStorage.get(key)
		.catch((err) => {
			if (err) console.error(err);
			return def;
		});
	}

	setSetting(key,val) {
		return this.settingStorage.set(key,val);
	}

}

module.exports = NedbAdapter;