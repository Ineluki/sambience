/**
 * currently not in use
 * @TODO cleanup or use
 **/
class File {
	constructor(data) {
		File.keys.forEach((key) => {
			this[key] = key in data ? data[key] : null;
		},this)
	}

	getFile() {
		return this.file;
	}
	getId() {
		return this._id;
	}

	toJSON() {
		const data = {};
		File.keys.forEach((key) => {
			data[key] = this[key];
		},this)
		return data;
	}

	static fromJSON(data) {
		return new File(data);
	}

	static keys = [
		'file','artist','album','title','year','disknum','tracknum',
		'_id', 'createdAt', 'updatedAt'
	];
}

module.exports = File;