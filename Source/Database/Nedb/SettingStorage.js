const Nedb = require('nedb');
const Error = require('../../Util/Error.js');
const debug = require('debug')('sambience');

class SettingStorage {

	constructor(fpath) {
		this.db = new Nedb({
			filename: fpath,
			inMemoryOnly: false,
		  	timestampData: true,
		  	autoload: true
		});
	}

	get(key) {
		return new Promise((resolve, reject) => {
			this.db.findOne({ key: key },(err,doc) => {
				if (err) reject(err);
				else if (!doc) reject(false);
				else resolve(doc.value);
			});
		});
	}

	set(key,val) {
		let data = {
			key: key,
			value: val
		};
		return new Promise((resolve, reject) => {
			this.db.update({ key: key }, data, { upsert: true, multi: false, returnUpdatedDocs: false }, (err, numReplaced) => {
				if (err) reject(err);
				else resolve();
			});
		});
	}

}

module.exports = SettingStorage;