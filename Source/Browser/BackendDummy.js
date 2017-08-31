
import Playlist from '../Model/Playlist.js'
import Vue from 'vue'

let data = require('../Util/Data.js').getMetaData();
const pl = new Playlist();

function dumpTree(root,lvl=0) {
	let x = [];
	for(let n of root) {
		x.push(n.id);
		if (lvl < 1) dumpTree(n,lvl+1);
	}
	console.log("dump "+lvl,JSON.stringify(x));
}

const getPlaylistData = function() {
	return pl.toJSON();
}

const moveGroup = function(oldIndex,newIndex,grp) {
	pl.orderGroup(oldIndex,newIndex);
}

const moveSong = function(grp,oldIndex,newIndex) {
	pl.orderSong(grp, oldIndex, grp, newIndex);

}

const addPathToList = function(list,path) {	//@TODO works, but list is not updated
	data.forEach(i => {
		if (i.file && i.file.substr(0,path.length) === path) {
			pl.addFile(i);
		}
	});
	bus.$emit('playlist-update');
};

const getDirTree = function() {
	let tree = { name: 'root', path: '/', children: {} };
	const addPath = function(p) {
		let parts = p.split('/');
		let node = tree;
		let accumulated = '';
		parts.forEach((p,i) => {
			accumulated += '/'+p;
			if (!node.children[p]) {
				node.children[p] = {
					name: p,
					path: accumulated.substr(1)
				};
				if (i < parts.length-1) {
					node.children[p].children = {};
				}
			}
			node = node.children[p];
		});
	};
	data.forEach(i => {
		if (i.file) {
			addPath(i.file);
		}
	});
	const findRoot = function(tree) {
		if (tree.children) {
			let keys = Object.keys(tree.children);
			if(keys.length < 2) {
				return findRoot(tree.children[keys[0]]);
			}
			return tree;
		}
		return tree;
	}
	return findRoot(tree);
};
const bus = new Vue();
export { getPlaylistData, moveGroup, moveSong, addPathToList, getDirTree, bus };
