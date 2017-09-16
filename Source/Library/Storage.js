const Nedb = require('nedb');
const {Readable,Writable} = require('stream');
const debug = require('debug')('sambience');

class MetaStore {

	constructor(fpath) {
		this.db = new Nedb({
			filename: fpath,
			inMemoryOnly: false,
		  	timestampData: true,
		  	autoload: true
		});
		this.keys = [
			'file','artist','album','title','year','disknum','tracknum','duration'
		];
	}

	updateFile(data) {
		return new Promise((resolve, reject) => {
			if (data.remove && data.file) {
				debug("REMOVE "+JSON.stringify(data));
				this.db.remove({ file: data.file },{},(err,numRemoved) => {
					if (err) reject(err);
					else resolve(numRemoved);
				});
			} else {
				debug("UPDATE "+JSON.stringify(data));
				let strippedData = {};
				this.keys.forEach((key) => {
					strippedData[key] = key in data ? data[key] : null;
				});
				this.db.update({ file: data.file }, strippedData, { upsert: true }, function (err, numReplaced, upsert) {
					if (err) reject(err);
					else resolve(upsert);
				});
			}
		});
	}

	getPathStartRegexp(path,subdirs=false) {
		path = path.replace(/[\.\[\]\(\)\-\+\*\?]/g,'\\$&');
		return new RegExp('^'+path+(subdirs ? '' : '[^\/]+$'));
	}

	searchByPath(path) {
		const _this = this;
		let reg = this.getPathStartRegexp(path,true);
		//console.log("searchByPath",reg);
		return new Promise(function(resolve, reject) {
			_this.db.find({ file: { $regex: reg }},(err,docs) => {
				debug("path found "+docs.length,reg);
				if (err) reject(err);
				else resolve(docs);
			});
		});
	}

	searchByArtist(artist,album,title) {
		return new Promise((resolve, reject) => {
			let search = {};
			if (artist) search.artist = artist;
			if (album) search.album = album;
			if (title) search.title = title;
			this.db.find(search,(err,docs) => {
				if (err) reject(err);
				else resolve(docs);
			})
		});
	}

	getByIds(ids) {
		return new Promise((resolve, reject) => {
			this.db.find({ _id: { $in: ids } },(err,docs) => {
				if (err) reject(err);
				else resolve(docs);
			});
		});
	}

	getWriteStream() {
		const _this = this;
		let progress = 0;
		return new Writable({
			objectMode: true,
			write: function(data,enc,cb) {
				_this.updateFile(data).then(() => { debug("stored",++progress); cb(); }, (err) => { cb(err); });
				return true;
			}
		});
	}

	getReadStream(query) {
		const _this = this;
		var err,docs,resume;
		this.db.find(query,(e,d) => {
			if (e) {
				r.emit('error',e);
			} else {
				d.forEach((doc) => { r.push(doc); });
				r.push(null);
			}
		});
		const r = new Readable({
			objectMode: true,
			read: function(cb) { }
		});
		return r;
	}

}

module.exports = MetaStore;