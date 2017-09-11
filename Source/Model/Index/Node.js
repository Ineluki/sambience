const debug = require('debug')('sambience');

class IndexNode {

	constructor(l,p,t) {
		this.label = l;
		this.path = p;
		this.parent = t;
		this.childMap = {};
		this.childArr = [];
	}

	getLabel() {
		return this.label;
	}

	getPath() {
		return this.path;
	}

	getFullPath() {
		let res;
		if (this.parent) {
			res = this.parent.getFullPath()
		} else {
			res = [];
		}
		if (this.path) {
			res.push(this.path);
		}
		return res;
	}

	getChildren() {
		return this.childArr;
	}

	getChild(k) {
		return this.childMap[k];
	}

	addChild(l,p) {
		let n = new IndexNode(l,p,this);
		let k = JSON.stringify(p);
		if (this.childMap[k]) return this.childMap[k];
		this.childMap[k] = n;
		this.childArr.push(n);
		return n;
	}

	getSize() {
		return this.childArr.length;
	}

	getLeafCounts(f) {
		if (this.childArr.length) {
			return this.childArr.map((n) => {
				return n.getLeafCounts(f).reduce((v,c) => { return c+v; },0);
			});
		} else {
			let match = true;
			if (f) {
				//debug("search for "+f+" in "+JSON.stringify(this.path));
				match = (this.getFullPath().join(" ")).toLowerCase().indexOf(f) > -1;
			}
			return [ match ? 1 : 0 ];
		}
	}

	getLeafCount(f) {
		if (this.childArr.length) {
			return this.getLeafCounts(f).reduce((v,c) => { return c+v; },0);
		} else {
			return 0;
		}
	}

	getPathMatchesFilter(filter) {
		return (this.getFullPath().join(" ")).toLowerCase().indexOf(filter) > -1;
	}

	getMatchCount(filter) {
		if (this.getPathMatchesFilter(filter)) {
			if (this.childArr.length) {
				return this.getLeafCount();
			} else {
				return 1;
			}
		} else {
			return this.childArr.map((n) => {
				return n.getMatchCount(filter);
			}).reduce((v,c) => { return c+v; },0);
		}
	}

	findRoot() {
		if (this.childArr.length === 1) {
			return this.childArr[0].findRoot();
		}
		return this;
	}

	sort() {
		this.childArr.sort((a,b) => {
			return a.label  > b.label ? 1 : -1;
		});
		this.childArr.forEach((c) => { c.sort(); });
	}

	toJSON() {
		return {
			label: this.label,
			path: this.getFullPath(),
			children: Object.keys(this.childMap),
			leafs: this.getLeafCount()
		};
	}

	getView() {
		return this.childArr.map((c) => {
			return {
				label: c.getLabel(),
				path: c.getFullPath(),
				size: c.getSize(),
				leafCount: c.getLeafCount(),
				children: []
			};
		});
	}

	getFilteredView(filter) {
		//debug("getFilteredView("+filter+") "+this.label);
		return this.childArr.map((c) => {
			let leafs = c.getMatchCount(filter);
			if (leafs === 0) return null;
			let data = {
				label: c.getLabel(),
				path: c.getFullPath(),
				size: c.getSize(),
				leafCount: leafs,
				children: []
			};
			data.children = c.getFilteredView(filter);
			return data;
		}).filter(c => { return c !== null; });
	}

	traverseByPath(path) {
		if (path.length === 0) {
			return this;
		}
		let k =  JSON.stringify(path.shift());
		if (k in this.childMap) {
			return this.childMap[k].traverseByPath(path);
		} else {
			return this.traverseByPath(path);
			// throw new Error("invalid path, "+k+" not found at "+JSON.stringify(this.path)+" only has "+Object.keys(this.childMap).join(', '));
		}
	}

	static fromJSON(json,root=null) {
		if (!root) {
			root = new IndexNode(json.label,json.path);
		}
		json.children.forEach((chld) => {
			let node = root.addChild(chld.label,chld.path);
			TreeNode.fromJSON(chld,node);
		});
		return root;
	}

}

module.exports = IndexNode;