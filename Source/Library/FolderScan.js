const Readable = require('stream').Readable;
const FS = require('fs');
const Path = require('path');
const debug = require('debug')('sambience-scan');

class FolderScan extends Readable {
	constructor(path) {
		super({
			objectMode: true
		});
		this.path = path;
		this.fileBuffer = [];
		this.dirBuffer = [path];
		this.busy = false;
	}

	fillBuffer() {
		if (this.dirBuffer.length === 0) {
			return;
		}
		let dir = this.dirBuffer.pop();
		debug("readdir",dir);
		FS.readdir(dir,(err,arr) => {
			if (err) return this.emit('error',err);
			let wait = [];
			arr.forEach((file) => {
				let fp = Path.join(dir,file);
				wait.push(new Promise((resolve, reject) => {
					FS.lstat(fp, (err, st) => {
						if (err) return reject(err);
						if (st.isDirectory()) {
							this.dirBuffer.push(fp);
						} else {
							this.fileBuffer.push(fp);
						}
						resolve();
					});
				}));
			});
			Promise.all(wait)
			.then(() => {
				this.pushFiles();
			},(err) => { this.emit('error',err); });
		});
	}

	pushFiles() {
		debug("pushFiles",this.fileBuffer.length, this.dirBuffer.length);

		if (this.fileBuffer.length === 0) {
			return this.fillBuffer();
		}
		this.busy = false;
		if (this.fileBuffer.length > 0) {
			this.push({ filepath: this.fileBuffer.pop() });
		} else {
			debug("FOLDER READ ENDS");
			this.push(null);
		}

	}

	_read(size) {
		if (true || !this.busy) {
			if (this.fileBuffer.length > 0) {
				let file = this.fileBuffer.pop();
				debug("push "+file);
				this.push({ filepath: file });
				return true;
			}
			this.busy = true;
			this.pushFiles();
		}
		return false;
	}
}

module.exports = FolderScan;