<template>
	<main id="app">
			<ul id="index">
			  	<tree
			    	class="item"
			    	:path="tree.path"
					:label="tree.label"
					:size="999"
					:leafCount="999">
			  	</tree>
			</ul>
			<div id="main">
				<div id="header">
					Status / Actions / Modes
				</div>
				<div id="playlists">
					<div class="riders">
						pl 1 / pl 2 / pl 3
					</div>
					<grid
						:columns="gridColumns"
						:group-columns="groupColumns">
			  		</grid>
				</div>
			</div>
		</main>
	</main>
</template>

<script>
import Tree from './Tree.vue';
import Table from './Table.vue';
export default {
  	name: 'app',
  	data () {
		let d = {
			msg: 'test msg',
			tree: { path: [], label: 'Root' },
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


</style>
