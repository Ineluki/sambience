<template>
	<div class="playlist">
		<draggable :list="playlist" @change="onGroupChange">
			<div class="group" v-for="(group, grpIndex) in playlist">
				<header>
					<span v-for="(key,index) in groupColumns">
						{{group.group[key]}} <span v-if="index+1 < groupColumns.length"> - </span>
					</span>
				</header>
				<main>
					<draggable :list="group.children" @change="onItemChange($event,grpIndex)">
						<div class="item" v-for="entry in group.children">
							<span v-for="key in columns">
								{{entry[key]}}
							</span>
						</div>
					</draggable>
				</main>
			</div>
		</draggable>
	</div>
</template>

<script>
import Vue from 'vue'
import draggable from 'vuedraggable';
import {getPlaylistData, moveSong, moveGroup, bus} from '../Browser/Backend.js';
export default {
	name: 'grid',
	props: {
		columns: Array,
		groupColumns: Array
	},
	data: function () {
		bus.$on('playlist-update',() => {
			this.playlist = getPlaylistData();
		});
		return {
			playlist: []
		}
	},
	computed: {

	},
	filters: {

	},
	methods: {
		onGroupChange: function(e) {
			moveGroup(e.moved.oldIndex, e.moved.newIndex);
		},
		onItemChange: function(e,g) {
			moveSong(g, e.moved.oldIndex, e.moved.newIndex);
		}
	},
	components: {
		draggable
	}
}
</script>

<style scoped>
.playlist {

}
.playlist .group {
	border: 1px solid #aad;
}
.group > header {
	text-align: center;
	background: rgba(200, 200, 220, 0.5);
}
.item > span:not(:nth-child(3)) {
	width: 1em;
	display: inline-block;
	text-align: right;
	margin-right: 0.5em;
}
</style>
