<template>
	<li>
	    <div
			:class="{bold: isFolder}"

			@dblclick="addToPlaylist(model.path)">

			<span @click="toggle" v-if="isFolder">[{{open ? '-' : '+'}}]</span>
			{{model.name}}
	    </div>
	    <ul v-show="open" v-if="isFolder">
	      	<tree
		        class="item"
		        v-for="model in model.children"
		        :model="model">
	      	</tree>
	    </ul>
  	</li>
</template>

<script>
import Vue from 'vue'
import {addPathToList} from '../Browser/Backend.js';
const Tree = {
	name: 'tree',
	props: {
		model: Object
	},
	data: function () {
		return {
			open: false
		}
	},
	computed: {
		isFolder: function () {
		  	return this.model.children;
		}
	},
	methods: {
		toggle: function () {
		  	if (this.isFolder) {
		    	this.open = !this.open
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
	line-height: 1.5em;
	list-style-type: dot;
}
</style>
