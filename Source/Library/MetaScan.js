const Transform = require('stream').Transform;
const meta = require('musicmetadata');
const FS = require('fs');
const debug = require('debug')('sambience-meta');
const Error = require('../Util/Error.js');


class MetaScan extends Transform {
	constructor(opts) {
		super({
			objectMode: true
		});
		this.updateMode = !!opts.update;
		this.allowedEndings = opts.allowedEndings;
		this.busy = 0;
	}

	handleError({ fullpath, err }) {
		debug("###ERROR### reading metadata for "+fullpath,err);
		this.emit('fail');
		if (this.updateMode) {
			return Promise.resolve({
				file: fullpath,
				remove: true
			});
		} else {
			return Promise.resolve();
		}
	}

	createFileData({ filename, fullpath, metadata }) {
		debug("metadata done ",fullpath);
		let data = {
			file: fullpath,
			artist: metadata.albumartist.length ? metadata.albumartist[0] : metadata.artist[0],
			album: metadata.album,
			title: metadata.title,
			year: metadata.year,
			tracknum: metadata.track.no,
			disknum: metadata.disk.no,
			duration: ~~(metadata.duration)
		};
		if (!data.title) {
			data.title = filename;
		}
		if (!data.album) {
			data.album = 'Misc';
		}
		if (!data.artist) {
			data.artist = 'Unknown';
		}
		if (data.artist.map && data.artist.length) {
			data.artist = data.artist[0];
		}
		return data;
	}

	handleHasNoTag({ filename, fullpath }) {
		let metadata = { track: {}, disk: {}, artist: [], albumartist: [] };
		return { filename, fullpath, metadata };
	}

	handleUpdateObj(obj) {
		return new Promise(function(resolve, reject) {
			// debug("update",obj);
			let fullpath = obj.file;
			let filename = obj.file.substr( obj.file.lastIndexOf('/')+1 );
			FS.stat(fullpath,(err,stat) => {
				if (err) reject(err);
				else if (stat.isFile()) resolve({ filename, fullpath });
				else reject({ fullpath, error: new Error("not a file") });
			});
		});
	}

	handleScanObj(obj) {
		return new Promise((resolve, reject) => {
			let filename = obj.filepath.substr( obj.filepath.lastIndexOf('/')+1 ).toLowerCase();
			let fullpath = obj.filepath;
			let ending = this.allowedEndings.find((e) => {
				return filename.substr(filename.length-e.length,e.length) === e;
			});
			if (!ending) reject(new Error("invalid ending on "+filename));
			else resolve({ filename, fullpath });
		});
	}

	runMeta({ filename, fullpath }) {
		return new Promise((resolve, reject) => {
			debug("~~~ "+fullpath,this.busy);
			let readStream = FS.createReadStream(fullpath);
			meta(readStream,{ duration: true },(err,metadata) => {
				readStream.close();
				if (err) {
					debug("ERROR parsing: ",filename, err);
					resolve( this.handleHasNoTag({ filename, fullpath }) );
				} else {
					// debug("found metadata",metadata);
					resolve({ filename, fullpath, metadata });
				}
			});
		});
	}

	_transform(obj,enc,cb) {
		this.busy += 1;
		let p = Promise.resolve(obj);
		if (this.updateMode) {
			p = p.then(this.handleUpdateObj.bind(this))
			.then(this.runMeta.bind(this))
			.then(this.createFileData.bind(this))
			.catch(this.handleError.bind(this));
		} else {
			p = p.then(this.handleScanObj.bind(this))
			.then(res => {
				return this.runMeta(res)
				.then(this.createFileData.bind(this));
			});
		}

		p.then(res => {
			// debug("done",res);
			cb(null,res);
		},err => {
			debug("skip bc err "+err);
			cb();
		}).then(() => {
			this.busy -= 1;
			if (this.isPaused()) {
				debug("UNPAUSE");
				this.resume();
			}
		})

	}
}

module.exports = MetaScan;