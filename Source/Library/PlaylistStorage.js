const Nedb = require('nedb');
const Playlist = require('../Model/Playlist.js');

class PlaylistStorage {

	constructor(fpath,metaStorage) {
		this.metaStorage = metaStorage;
		this.db = new Nedb({
			filename: fpath,
			inMemoryOnly: false,
		  	timestampData: true,
		  	autoload: true
		});
		this.playlists = new Map();
		this.keys = ['_id','createdAt','updatedAt','name'];
	}

	getLists() {
		const playlists = [];
		return new Promise((resolve, reject) => {
			this.db.find({},(err,docs) => {
				if (err) return reject(err);
				let waitFor = [];
				docs.forEach((data) => {
					let pl = new Playlist();
					this.keys.forEach(key => {
						pl[key] = data[key];
					})
					playlists.push( pl );
					waitFor.push( this.metaStorage.getByIds(data.items) );
				});
				resolve( Promise.all(waitFor) );
			});
		}).then((buckets) => {
			buckets.forEach((items,i) => {
				let pl = playlists[i];
				items.forEach((item) => { pl.addFile(item); });
			});
			return playlists;
		});
	}

	save(pl) {
		return new Promise((resolve, reject) => {
			let ids = [];
			pl.toJSON().forEach((group) => {
				group.children.forEach((item) => {
					ids.push( item._id );
				});
			});
			let data = { items: ids };
			this.keys.forEach(key => {
				data[key] = pl[key];
			});
			this.db.update({ _id: pl._id }, data, { upsert: true, multi: false, returnUpdatedDocs: true }, (err, numReplaced, data) => {
				if (err) {
					reject(err);
				} else {
					this.keys.forEach(key => {
						pl[key] = data[key];
					});
					resolve(pl);
				}
			});
		});

	}

}

module.exports = PlaylistStorage;