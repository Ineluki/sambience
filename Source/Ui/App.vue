<template>
	<main id="app">
		<index></index>
		<playlists></playlists>
	</main>
</template>

<script>
import Index from './Index.vue';
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
		index: Index,
		playlists: Playlists
	}
}
</script>

<style scoped>


</style>
