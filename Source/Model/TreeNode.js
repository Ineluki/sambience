
let nodes = 0;

class TreeNode {

	constructor(parent,content) {
		this.parent = parent;
		this.next = null;
		this.prev = null;

		this.content = content ? content : null;

		this.firstChild = null;
		this.lastChild = null;
		this.size = 0;

		this.id = nodes++;
	}


	addChild(obj,pos) {
		if (typeof pos === 'undefined') {
			pos = this.size;
		} else if (pos > this.size || pos < 0) {
			throw new Error("constraint error: 0 <= pos("+pos+") <= "+this.size);
		}
		let node;
		if (!(obj instanceof TreeNode)) {
			node = new TreeNode(this,obj);
		} else {
			node = obj;
			node.parent = this;
		}

		if (pos === 0) {
			let next = this.firstChild;
			this.firstChild = node;
			if (next) {
				next.prev = node;
			} else {
				this.lastChild = node;
			}
			node.next = next;
		} else {
			let prev = this.firstChild;
			while(--pos) {
				prev = prev.next;
			}
			let next = prev.next;
			prev.next = node;
			node.prev = prev;
			node.next = next;
			if (next) {
				next.prev = node;
			} else {
				this.lastChild = node;
			}
		}
		this.size += 1;
		return node;
	}

	removeChild(obj) {
		let node;
		if (obj instanceof TreeNode) {
			node = obj;
		} else {
			node = this.findNode(obj);
		}
		if (this.firstChild === node) {
			this.firstChild = node.next;
		}
		if (this.lastChild === node) {
			this.lastChild = node.prev;
		}
		if (node.prev) {
			node.prev.next = node.next;
		}
		if (node.next) {
			node.next.prev = node.prev;
		}
		node.prev = null;
		node.next = null;
		node.parent = null;
		this.size -= 1;
		return node;
	}

	getChild(pos) {
		let n = this.firstChild;
		while(pos-- > 0) {
			n = n.next;
		}
		return n;
	}

	findNode(obj) {
		let n = this.firstChild;
		let compareWrap = (obj instanceof TreeNode);
		do {
			if (compareWrap && obj === n || n.content === obj) {
				return n;
			}
		} while(n = n.next);
		return null;
	}

	getNext() {
		if (this.next) {
			return this.next;
		} else if (this.parent && this.parent.next) {
			return this.parent.next.firstChild;
		}
		return null;
	}

	getPrev() {
		if (this.prev) {
			return this.prev;
		} else if (this.parent && this.parent.prev) {
			return this.parent.prev.firstChild;
		}
		return null;
	}

	getRandomLeaf() {
		if (this.size === 0) {
			return this;
		} else {
			let sizes = this.getSizes();
			let total = sizes.reduce((v,c) => { return c+v; },0);
			let target = Math.ceil(Math.random() * total);
			//console.log("RNG",total,target,JSON.stringify(sizes));
			let chunk = 0;
			while(target - sizes[chunk] > 0) {
				target -= sizes[chunk];
				chunk += 1;
			}
			let n = this.firstChild;
			while(chunk-- > 0) {
				n = n.next;
			}
			return n.getRandomLeaf();
		}
	}

	getRandomChild() {
		let i = ~~(Math.random() * this.size);
		return this.getChild(i);
	}

	getSizes() {
		let sizes = [];
		for(let child of this) {
			sizes.push( child.size ? child.size : 1 );
		}
		return sizes;
	}

	getSizeSum() {
		return this.getSizes().reduce((v,c) => { return c+v; },0);
	}

	getSize() {
		return this.size;
	}

	[Symbol.iterator]() {
		let node = this.firstChild;
		return {
			next : () => {
				if (!node) return { done: true };
				let res = {
					value: node,
					done: false
				};
				node = node.next;
				return res;
			}
		};
	}

	toJSON() {
		return this.content;
	}

	removeAll() {
		let res = [];
		for(let n of this) {
			res.push(n.content);
			n.parent = null;
			n.content = null;
		}
		this.firstChild = null;
		this.lastChild = null;
		this.size = 0;
		return res;
	}

	addAll(arr) {
		arr.forEach(content => { this.addChild(content); });
	}

}

module.exports = TreeNode;