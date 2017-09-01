const TreeNode = require('./Tree/Node.js');

class Playlist {

	constructor() {
		this.name = '';
		this.createdAt = null;
		this.updatedAt = null;
		
		this.groupDefinition = ['artist','album'];
		this.sortDefinition = ['disknum','tracknum'];

		this.groupMap = new Map();		//groupKey => TreeNode
		this.currentPosition = null;	//TreeNode
		this.root = new TreeNode();

	}

	sort(def) {
		if (typeof def !== 'undefined') {
			this.sortDefinition = def;
		}
		const sdef = this.sortDefinition;
		for (let group of this.root) {
			let resetPos = false;
			if (this.currentPosition.parent === group) {
				resetPos = true;
			}
			let songs = group.removeAll();
			songs.sort((a,b) => {
				for(let i=0, ii=sdef.length; i<ii; i++) {
					let va = a[sdef[i]],
						vb = b[sdef[i]];
					if (va < vb) return -1;
					if (va > vb) return 1;
				}
				return 0;
			});
			group.addAll(songs);
			if (resetPos) {
				this.currentPosition = group.firstChild;
			}
		}
	}

	addFile(file) {
		let group = this.getGroupKey(file,group);
		let groupKey = group._key;
		if (!this.groupMap.has(groupKey)) {
			let grpNode = this.root.addChild(group);
			this.groupMap.set(groupKey,grpNode);
		}
		let grpNode = this.groupMap.get(groupKey);
		for(let node of grpNode) {
			if (node.content._id === file._id) {
				return false;
			}
		}
		grpNode.addChild(file);
		return true;
	}


	getGroupKey(file) {
		let res = '';
		let grp = { _group: true };
		this.groupDefinition.forEach(key => {
			res += '|'+file[key];
			if(grp) grp[key] = file[key];
		});
		grp._key = res;
		return grp;
	}

	clone() {
		let pl = new Playlist();
		// this.all.forEach(entry => { pl.add(entry.song); });
		return pl;
	}

	moveToPosition(gpos,spos=0) {
		this.currentPosition = this.root.getChild(gpos).getChild(spos);
	}

	moveToNextSong() {
		if (!this.currentPosition) {
			if (this.root.size > 0) {
				this.currentPosition = this.root.getChild(0).getChild(0);
				return true;
			} else {
				return false;
			}
		}
		if (this.currentPosition.next) {
			this.currentPosition = this.currentPosition.next;
			return true;
		} else {
			return false;
		}
	}

	moveToRandomSong() {
		this.currentPosition = this.root.getRandomLeaf();
		return true;
	}

	moveToRandomGroup() {
		const grp = this.root.getRandomChild();
		this.currentPosition = grp.firstChild;
		return true;
	}

	getCurrentSong() {
		if (!this.currentPosition) {
			if (!this.moveToNextSong()) {
				return null;
			}
		}
		return this.currentPosition.content;
	}

	orderSong(gpos,spos, ngpos,nspos) {
		let node = this.root.getChild(gpos).getChild(spos);
		node.parent.removeChild(node);
		let target = this.root.getChild(ngpos).addChild(node,nspos);
	}

	orderGroup(gpos,ngpos) {
		let node = this.root.getChild(gpos);
		this.root.removeChild(node);
		this.root.addChild(node,ngpos);
	}

	removeSong(gpos,spos) {
		let leaf = this.root.getChild(gpos).getChild(spos);
		if (this.currentPosition === leaf) {
			this.currentPosition = leaf.getNext();
		}
		leaf.parent.removeChild(leaf);

	}

	removeGroup(gpos) {
		let node = this.root.getChild(gpos);
		if (this.currentPosition.parent === node) {
			this.currentPosition = node.next ? node.getNext().firstChild : null;
		}
		this.root.removeChild(node);
	}

	toJSON() {
		let res = [];
		for(let grpNode of this.root) {
			let n = {
				group: grpNode.content,
				children: []
			};
			for (let leafNode of grpNode) {
				n.children[n.children.length] = leafNode.content;
			}
			res[res.length] = n;
		}
		return res;
	}

}

module.exports = Playlist;