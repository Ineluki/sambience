const MetaScan = require("./MetaScan.js");
const FolderScan = require('./FolderScan.js');
const Playlist = require('../Model/Playlist.js');
const debug = require('debug')('sambience');
const Status = require('../Playback/Status.js');
const debounce = require('lodash.debounce');
const Error = require('../Util/Error.js');
const Config = require('../Util/Config.js');
const pump = require('pump');

class Library {

	constructor(storage) {
		this.scanning = false;
		this.storage = storage;
		this.initPromise = null;
		this.waitForInit();
	}

	waitForInit() {
		if (!this.initPromise) {
			this.initPromise = this.getStorage().init();
		}
		return this.initPromise;
	}

	scan(path) {
		if (this.scanning) return Promise.reject(new Error("already scanning"));
		debug("scanning at "+path);
		this.scanning = true;
		let walker = new FolderScan(path);
		let meta = new MetaScan({
			update: false,
			allowedEndings: Config.get('library.allowedFileExtensions')
		});
		let store = this.getStorage().getFileWriteStream();
		return this.emitProgress(walker,meta,store,'scan',path);
	}

	updateLib(path) {
		if (this.scanning) return false;
		debug("updating lib at "+path);
		this.scanning = true;
		let entries = this.getStorage().getFileReadStream({ file: { $regex: this.storage.getPathStartRegexp(path,true) } });
		let store = this.storage.getWriteStream();
		let meta = new MetaScan({
			update: true,
			allowedEndings: Config.get('library.allowedFileExtensions')
		});
		return this.emitProgress(entries,meta,store,'update',path);
	}

	emitProgress(walker,meta,store,type,path) {
		return new Promise((resolve, reject) => {
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
				this.scanning = false;
				Status.scan({
					type: type,
					finished: true,
					path: path
				});
				if (e) {
					let err = new Error("error during scan/update",34343,e);
					Status.error(err);
					reject(err);
				} else {
					this.getStorage().reloadIndices()
					.then(resolve,reject);
				}
			};
			meta.on('progress',() => {
				parsed += 1;
				debug("progress",parsed);
				emitUpdate();
			});
			pump(walker,meta,store,endScan);
		});
	}

	createPlaylist(name) {
		const _this = this;
		let pl = new Playlist();
		pl.name = name;
		return this.storage.savePlaylist(pl)
		.then(() => {
			return pl;
		});
	}

	getPlaylist(id) {
		return this.storage.loadPlaylist(id);
	}

	getPlaylistOverview() {
		return this.storage.getPlaylists()
		.then((lists) => {
			return lists.map(pl => pl.getMeta());
		});
	}

	savePlaylist(pl) {
		return this.storage.savePlaylist(pl);
	}

	deletePlaylist(pl) {
		return this.storage.deletePlaylist(pl);
	}

	getStorage() {
		return this.storage;
	}

}


module.exports = Library;