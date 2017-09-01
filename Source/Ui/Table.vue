<template>
	<div id="playlist">
		<draggable :list="data" @change="onGroupChange($event)">
			<div class="group" v-for="(group, grpIndex) in data">
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
import {request, bus} from '../Browser/Backend.js';
import {currentPlaylist} from '../Browser/Cache.js';
export default {
	name: 'grid',
	props: {
		columns: Array,
		groupColumns: Array,
		data: Array
	},
	data: function () {
		return {};
	},
	methods: {
		onGroupChange: function(e) {
			console.log("onGroupChange",e);
			request('/playlist/movegroup',{
				id: currentPlaylist(),
				newpos: e.moved.newIndex,
				oldpos: e.moved.oldIndex
			}).then((list) => {
				bus.$emit('playlist-update',{
					id: currentPlaylist(),
					data: list
				});
			});
		},
		onItemChange: function(e,g) {
			request('/playlist/moveitem',{
				id: currentPlaylist(),
				group: g,
				newpos: e.moved.newIndex,
				oldpos: e.moved.oldIndex
			}).then((list) => {
				bus.$emit('playlist-update',{
					id: currentPlaylist(),
					data: list
				});
			});
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
