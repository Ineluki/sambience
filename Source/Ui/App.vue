<template>
	<main id="app">
		<h1>vue</h1>
		<h2>Tree</h2>
		<ul id="folders">
		  	<tree
		    	class="item"
		    	:model="treeData">
		  	</tree>
		</ul>
		<h2>Table</h2>
		<grid
			:columns="gridColumns"
			:group-columns="groupColumns">
  		</grid>
	</main>
</template>

<script>
import Tree from './Tree.vue';
import Table from './Table.vue';
import {getDirTree} from '../Browser/Backend.js';
export default {
  	name: 'app',
  	data () {
		let d = {
			msg: 'test msg',
			treeData : getDirTree(),
			gridColumns: ['disknum','tracknum','title'],
			groupColumns: ['artist','album']
		};
    	return d;
  	},
	components: {
		tree: Tree,
		grid: Table
	}
}
</script>

<style scoped>
#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
	margin-top: 60px;
}

</style>
