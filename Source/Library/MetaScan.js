const Transform = require('stream').Transform;
const meta = require('music-metadata');
const debug = require('debug')('sambience-meta');

class MetaScan extends Transform {
	constructor() {
		super({
			objectMode: true
		});
		this.allowedEndings = [
			'.mp3','.flac','.wav'
		];
		this.busy = false;
	}

	_transform(obj,enc,cb) {
		if (this.busy) {
			return false;
		}
		this.busy = true;
		var fullpath;
		var remove = false;
		if (obj.file && obj._id) {	//SOURCE DB
			fullpath = obj.file;
			remove = true;
		} else {					//SOURCE WALKER
			let name = obj.filepath;
			fullpath = obj.filepath;
			debug("~~~ "+fullpath);

			let ending = this.allowedEndings.find((e) => {
				return name.substr(name.length-e.length,e.length) === e;
			});
			if (!ending) {
				this.busy = false;
				debug("skip bc ending ");
				return cb();
			}
		}
		meta.parseFile(fullpath,{ duration: true, skipCovers: true })
		.then((metadata) => {
			this.busy = false;
			debug("metadata done ",fullpath);
			let data = {
				file: fullpath,
				artist: metadata.common.albumartist ? metadata.common.albumartist : metadata.common.artist,
				album: metadata.common.album,
				title: metadata.common.title,
				year: metadata.common.year,
				tracknum: metadata.common.track.no,
				disknum: metadata.common.disk.no,
				duration: ~~(metadata.format.duration)
			};
			this.emit('progress');
			cb(null,data);
		}).catch((err) => {
			debug("###ERROR### reading metadata for "+fullpath,err);
			this.emit('fail');
			if (remove) {	//@TODO stops here for some reason. deletes entry but stream ends too
				cb(null,{
					file: fullpath,
					remove: true
				});
			} else {
				cb();
			}
		}).then(() => {
			this.busy = false;
			if (this.isPaused()) {
				console.log("PAUSED");
				this.unpause();
			}
		})
	}
}

module.exports = MetaScan;