/**
 * used minimally in playback.control
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

	getFullTitle() {
		let res = '';
		if (this.artist) res += this.artist;
		if (this.title) {
			if (res.length) res += ' - ';
			res += this.title;
		}
		return res;
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

}
File.keys = [
	'file','artist','album','title','year','disknum','tracknum',
	'_id', 'createdAt', 'updatedAt'
];

module.exports = File;