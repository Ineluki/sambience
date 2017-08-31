
class Playlist {
	constructor(model) {
		this.list = model;
		this.shuffle = false;
		this.repeat = false;
	}

	getNext() {
		var res;
		if (res = this.getCurrentGroup().getNext()) {
			return res;
		}
		let grp = this.getNextGroup();
		if (!grp) {
			return null;
		}
		return grp.getNext();
	}

	getNextGroup() {
		if (this.shuffle) {
			this.currentGroup = ~~(Math.random() * this.groups);
		} else {
			this.currentGroup += 1;
		}
		if (this.groups.length < this.currentGroup) {
			this.currentGroup = -1;
			return null;
		} else {
			return this.groups[ this.currentGroup ];
		}
	}

	getCurrentGroup() {
		return this.groups[ this.currentGroup ];
	}

	setNext(id) {

	}

}

module.exports = Playlist;