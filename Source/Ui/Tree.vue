<template>
	<li>
	    <div
			:class="{bold: isFolder}"
			@dblclick="addToPlaylist(path)">

			<span @click="toggle" v-if="isFolder">[{{open ? '-' : '+'}}]</span>
			{{label}} {{sizes}}
	    </div>
	    <ul v-show="open" v-if="isFolder">
	      	<tree
		        class="item"
		        v-for="child in children"
				:path="child.path"
				:label="child.label"
				:size="child.size"
				:leafCount="child.leafCount">
	      	</tree>
	    </ul>
  	</li>
</template>

<script>
import Vue from 'vue'
import {request} from '../Browser/Backend.js';
const Tree = {
	name: 'tree',
	props: {
		path: Array,
		label: String,
		size: Number,
		leafCount: Number
	},
	data: function () {
		return {
			open: false,
			children: []
		}
	},
	computed: {
		isFolder: function() {
		  	return this.size > 0 || this.leafCount > 0;
		},
		sizes: function() {
			if (this.leafCount === 0) return '';
			let r = '(';
			if (this.leafCount > this.size) {
				r += this.size + ' / ' + this.leafCount;
			} else {
				r += this.size;
			}
			r += ')';
			return r;
		}
	},
	methods: {
		toggle: function () {
		  	if (this.isFolder) {
		    	this.open = !this.open;
		  	}
			if (this.open === true && this.size > 0 && this.children.length === 0) {
				request('/library/index',{ type: 'directory', sub: this.path})
				.then((res) => {
					console.log("result",res);
					this.children = res;
				});
			}
		},
		addToPlaylist: function (path) {
			console.log("adding",path);
			addPathToList(1,path);
		}
	},
	components: {
		tree: Tree
	}
}
export default Tree;
</script>

<style scoped>
.item {
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
</style>
