const walker = require('folder-reader');
const meta = require('music-metadata');
const Readable = require('stream').Readable;

/**
 * reads file structure
 **/
class Scanner extends Readable {

	constructor(dir) {
		super({
			objectMode: true
		});
		this.dir = dir;
		this.running = false;
		this.stream = null;
		this.allowedEndings = [
			'.mp3','.flac','.wav','.ogg'
		];
	}

	_read(size) {

	}

	start() {
		if (this.running) return;
		const _this = this;
		this.stream = walker(this.dir);
		this.stream.on('data',this.process.bind(this));
		this.stream.on('end',() => {
			_this.stop();
		});
		this.running = true;
	}

	stop() {
		if (!this.running) return;
		this.running = false;
		this.stream.destroy();
		this.stream = null;
	}

	process(obj) {
		let name = obj.basename;
		let fullpath = obj.filepath;
		if (obj.type !== 'file') return;
		let ending = this.allowedEndings.find((e) => {
			return name.substr(name.length-e.length,e.length) === e;
		});
		if (!ending) return;
		this.parse(fullpath);
	}

	parse(fpath,ending) {
		meta.parseFile(fpath)
		.then((metadata) => {
			console.log("metadata for "+fpath,metadata);
		}).catch((err) => {
			console.log("error reading metadata for "+fpath,err);
		});
	}
}

module.exports = Scanner;