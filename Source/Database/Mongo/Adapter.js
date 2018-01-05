const AbstractAdapter = require('../AbstractAdapter.js');
const Monk = require('monk');
const {Readable,Writable,PassThrough} = require('stream');
const Playlist = require('../../Model/Playlist.js');
const Song = require('../../Model/File.js');
const debug = require('debug')('sambience');
const Path = require('path');

class MongoAdapter extends AbstractAdapter {

	constructor(config) {
		super();
		this.db = Monk(config.connect);
		this.settings = this.db.get('settings');
		this.songs = this.db.get('songs');
		this.playlists = this.db.get('playlists');
	}

	init() {
		return Promise.resolve();
		let index;
		let dirStorage = this.indexStorageDirectory;
		return Promise.resolve()
		.then(() => {
			return dirStorage.empty();
		})
		.then(() => {
			index = new DirectoryIndex(this);
			return index.buildIndex();
		})
		.then(() => {
			return new Promise(function(resolve, reject) {
				let queue = fastq((view) => {
					dirStorage.insert(view);
				},1);
				index.getRoot().forEvery((node) => {
					let view = node.getView();
					queue.push(view);
				});
				queue.empty = function() {
					done = true;
				};
			});
		});

	}

	reloadIndices() {
		//not needed
		return Promise.resolve();
	}

	getPlaylists() {
		return this.playlists.find({})
		.then((list) => {
			return list.map(data => {
				let pl = new Playlist();
				Playlist.META_KEYS.forEach(key => {
					pl[key] = data[key];
				});
				pl.rawItems = data.items;
				return pl;
			});
		})
	}

	loadPlaylist(id) {
		return this.playlists.findOne({ _id: id })
		.then(data => {
			let pl = new Playlist();
			Playlist.META_KEYS.forEach(key => {
				pl[key] = data[key];
			});
			let idx = {};
			data.items.forEach((i,n) => {
				idx[""+i] = n;
			});
			return this.songs.find({ _id: { $in: data.items } })
			.then(songs => {
				songs.sort((a,b) => {
					return idx[""+a._id] > idx[""+b._id] ? 1 : -1;
				});
				songs.forEach(song => pl.addFile(song));
				return pl;
			});
		})
	}

	savePlaylist(pl) {
		let ids = [];
		pl.toJSON().forEach((group) => {
			group.children.forEach((item) => {
				ids.push( item._id );
			});
		});
		let data = { items: ids };
		Playlist.META_KEYS.forEach(key => {
			if (key in pl && pl[key]) {
				data[key] = pl[key];
			}
		});
		data.updatedAt = new Date();
		debug("saving playlist",data);
		let res;
		if (pl._id) {
			res = this.playlists.update({ _id: pl._id }, data, { upsert: true, multi: false, returnUpdatedDocs: true });
		} else {
			data.createdAt = new Date();
			data._id = Monk.id();
			res = this.playlists.insert(data);
		}
		return res.then(data => {
			debug("after pl save",data);
			Playlist.META_KEYS.forEach(key => {
				if (data[key]) pl[key] = data[key];
			});
			return pl;
		});
	}

	deletePlaylist(pl) {
		return this.playlists.remove({ _id: pl._id });
	}

	updateFile(data) {
		return new Promise((resolve, reject) => {
			if (data.remove && data.file) {
				debug("REMOVE "+JSON.stringify(data));
				this.songs.remove({ file: data.file },{}).then(resolve,reject);
			} else {
				debug("UPDATE "+JSON.stringify(data));
				let strippedData = {};
				Song.keys.forEach((key) => {
					if (key in data) {
						strippedData[key] = data[key];
					}
				});
				let file = strippedData.file;
				if (file) {
					strippedData.dirIndex = file.substr(1).split("/");
				}
				if (strippedData.artist && strippedData.album && strippedData.title) {
					strippedData.artistIndex = [ strippedData.artist, strippedData.album, strippedData.title ];
					strippedData.artistPath = '/'+strippedData.artistIndex.join('/')+'/';
				}
				strippedData.updatedAt = new Date();
				this.songs.update({ file: data.file }, { $set: strippedData, $setOnInsert: {
					_id: Monk.id(),
					createdAt: new Date()
				}}, { upsert: true }).then(resolve,reject);
			}
		});
	}

	searchFilesByPath(path,includeSubDirs=false) {
		let reg = '^'+path+ (includeSubDirs ? '' : '$');
		return this.songs.find({
			path: {
				$regex : path
			}
		});
	}

	searchFilesByArtist(artist,album,song) {
		let search = {};
		if (artist) search.artist = artist;
		if (album) search.album = album;
		if (title) search.title = title;
		return this.songs.find(search);
	}

	getFilesByIds(ids) {
		return this.songs.find({ _id: { $in: ids } });
	}

	getFileReadStream() {
		const r = new PassThrough({
			objectMode: true
		});
		this.songs.find({},{ rawCursor: true })
		.then(cursor => {
			cursor.pipe(r);
		});
		return r;
	}

	getFileWriteStream() {
		const _this = this;
		let progress = 0;
		return new Writable({
			objectMode: true,
			write: function(data,enc,cb) {
				_this.updateFile(data)
				.then(() => {
					debug("stored",++progress);
					cb();
				}, (err) => {
					cb(err);
				});
				return true;
			}
		});
	}

	searchByPath(path) {
		return this.songs.aggregate([
			{
				$match: { file: { $regex: '^'+path }}
			},{
				$project: {
					_id: false,
					file: true
				}
			}
		]);
	}

	getIndexView(type,pathArr) {
		let pathLen = pathArr.length;
		let path = pathArr.join('/');
		let filterTarget,projectSlice;
		if (type === 'directory') {
			filterTarget = 'file';
			projectSlice = 'dirIndex'
		} else {
			filterTarget = 'artistPath';
			projectSlice = 'artistIndex';
		}
		path = '/'+path;
		if (path.length > 1) path = path + '/';
		path = path.replace(/[\.\[\]\(\)\-\+\*\?]/g,'\\$&');
		let filter = {
			$match: {}
		};
		filter.$match[ filterTarget ] = { $regex: '^'+path }
		let project = {
			$project: {
				_id: false,
				sub: { $slice: [ '$'+projectSlice, pathLen, 2 ]}
			}
		};
		let group = {
			$group: {
				_id: '$sub',
				leafs: { $sum: 1 }
			}
		};
		let sort = {
			$sort: {
				_id: 1
			}
		};
		let project2 = {
			$project: {
				_id: false,
				first: { $arrayElemAt: [ "$_id", 0] },
				second: { $arrayElemAt: [ "$_id", 1 ]},
				leafs: true
			}
		};
		let group2 = {
			$group: {
				_id: "$first",
				children: { $sum: 1 },
				leafs: { $sum: {
					$cond: [ {$ifNull: [ "$second", false ]}, "$leafs", 0]
				} }
			}
		};
		return this.songs.aggregate([filter,project,group,project2,group2,sort])
		.then(res => {
			return res.map(row => {
				let path = pathArr.slice(0);
				path.push(row._id);
				return {
					label: row._id,
					path: path,
					size: row.children,
					leafCount: row.leafs,
					children: []
				};
			});
		});
	}

	getIndexSearch(type,search) {
		let filterTarget,projectSlice;
		if (type === 'directory') {
			filterTarget = 'file';
			projectSlice = 'dirIndex';
		} else {
			filterTarget = 'artistPath';
			projectSlice = 'artistIndex';
		}
		search = search.toLowerCase();
		let searchRegex = search.replace(/[\.\[\]\(\)\-\+\*\?]/g,'\\$&');
		let filter = {
			$match: {}
		};
		filter.$match[ filterTarget ] = { $regex: searchRegex, $options: 'i' };
		let project = {
			$project: {
				_id: false
			}
		};
		project.$project[ projectSlice ] = true;
		return this.songs.aggregate([filter,project])
		.then(rows => {
			let tree = {
				label: '',
				path: [],
				size: 0,
				leafCount: 0,
				children: []
			};
			rows.forEach((row) => {
				let node = tree;
				let path = row[projectSlice];
				path.forEach((p,i) => {
					let chld = node.children.find(c => {
						return c.label === p;
					});
					if (!chld) {
						let np = node.path.slice(0);
						np.push(p);
						chld = {
							label: p,
							path: np,
							size: 0,
							leafCount: 0,
							children: []
						};
						node.size += 1;
						if (i === path.length-1 && p.toLowerCase().indexOf(search) === -1) {

						} else {
							node.children.push(chld);
						}
					}
					chld.leafCount += 1;
					node = chld;
				});
			});
			return tree.children;
		});
	}

	getFilesByIndex(type,input) {
		let inputPath = '/'+input.join('/');
		let filterTarget,projectSlice;
		if (type === 'directory') {
			filterTarget = 'file';
			projectSlice = 'dirIndex';
		} else {
			inputPath += '/';
			filterTarget = 'artistPath';
			projectSlice = 'artistIndex';
		}
		inputPath = inputPath.replace(/[\.\[\]\(\)\-\+\*\?]/g,'\\$&');
		let filter = { $match: {} };
		filter.$match[ filterTarget ] = { $regex: '^'+inputPath };
		return this.songs.aggregate([filter]);
	}

	getSetting(key,def) {
		return this.settings.findOne({ key: key })
		.then(data => {
			if (!data) return def;
			return data.value;
		});
	}

	setSetting(key,val) {
		let data = {
			key: key,
			value: val
		};
		return this.settings.update({ key: key }, data, { upsert: true, multi: false, returnUpdatedDocs: false });
	}

}

module.exports = MongoAdapter;