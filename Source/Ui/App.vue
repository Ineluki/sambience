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
			<playlists></playlists>
		</main>
	</main>
</template>

<script>
import Tree from './Tree.vue';
import Playlists from './Playlists.vue';
export default {
  	name: 'app',
  	data () {
		let d = {
			tree: { path: [], label: 'Root' }
		};
    	return d;
  	},
	components: {
		tree: Tree,
		playlists: Playlists
	}
}
</script>

<style scoped>


</style>
