<template>
	<li>
	    <div :class="{bold: isFolder, animated: justClicked}" class="hoverable entry" @contextmenu.prevent="scanMenu($event,model)">
			<span @click="toggle" v-if="isFolder" class="opener" v-html="openerSign">
			</span>
			<span>
				{{model.label}}
			</span>
			<span>
				{{sizes}}
			</span>
			<span class="invisible reveal">
				<div class="btn glyphicon glyphicon-share-alt add" @click="addToPlaylist">
				</div>
			</span>
	    </div>
	    <ul v-show="opened" v-if="isFolder">
	      	<tree
		        class="item"
		        v-for="(child,i) in model.children"
				v-model="model.children[i]"
				:searchValue="searchValue"
				:treeMode="treeMode">
	      	</tree>
	    </ul>
  	</li>
</template>

<script>
import Vue from 'vue';
import {request,bus} from '../Browser/Backend.js';
import {currentPlaylist as currentList} from '../Browser/Cache.js';

const Tree = {
	name: 'tree',
	model: {
		prop: 'model',
		event: 'change'
	},
	props: {
		model: Object,
		searchValue: String,
		treeMode: String
	},
	data: function () {
		let d = {
			open: false,
			justClicked: false,
			loaded: false
		};
		if (this.searchValue.length) {
			d.open = true;
			d.loaded = true;
		}
		return d;
	},
	computed: {
		openerSign: function() {
			if (this.searchValue.length) {
				return '[&times;]';
			} else if (this.open) {
				return '[-]';
			} else {
				return '[+]';
			}
		},
		opened: function() {
			if (this.searchValue.length) return true;
			return this.open;
		},
		isFolder: function() {
		  	return this.model.size > 0 && this.model.leafCount > 0;
		},
		sizes: function() {
			if (this.model.leafCount === 0 || this.model.size === 0) return '';
			let r = '(';
			if (this.model.leafCount > this.model.size) {
				r += this.model.size + '/' + this.model.leafCount;
			} else {
				r += this.model.size;
			}
			r += ')';
			return r;
		},
		showScan: function() {
			return this.isFolder && this.treeMode === 'directory';
		}
	},
	methods: {
		toggle: function () {
		  	if (this.isFolder) {
		    	this.open = !this.open;
		  	}
			if (this.open === true && this.model.size > 0 && !this.loaded) {
				request('/library/index',{ type: this.treeMode, sub: this.model.path})
				.then((res) => {
					this.model.children = res;
					this.loaded = true;
				});
			}
		},
		addToPlaylist: function (e) {
			console.log("adding",this.model.path);
			if (!currentList()) return;
			this.justClicked = true;
			setTimeout(() => { this.justClicked = false; },500);
			request('/playlist/additems',{
				id: currentList(),
				value: this.model.path,
				type: this.treeMode
			})
			.then((list) => {
				bus.$emit('playlist-update',{
					id: currentList(),
					data: list
				});
			});
		},
		scanMenu: function(e,m) {
			bus.$emit('scan-menu',e,m);
		}
	},
	components: {
		tree: Tree
	}
}
export default Tree;
</script>

<style scoped>
.opener, .add {
  	cursor: pointer;
}
.bold {
  	font-weight: bold;
}
ul {
	padding-left: 1em;
	line-height: 1.4em;
	list-style: none;
}
.item > div {
	outline: 0px solid #fff;
	outline-offset: 0;
}
.item > .animated {
	outline-width: 1px;
	outline-offset: 6px;
	transition: outline-width 0.5s, outline-offset 0.5s;
}
.entry {
	display: flex;
	flex-flow: row nowrap;
}
.entry > span {
	flex-shrink: 1;
	flex-grow: 0;
}
.entry > span:nth-child(2) {
	flex-grow: 1;
}
.entry > span:nth-child(3) {
	flex-grow: 0;
}
</style>
