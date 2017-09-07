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
						
						<div class="item"
							key="song"
							v-for="(entry,entryIndex) in group.children"
							@dblclick="play(grpIndex,entryIndex)">
							<span class="glyphicon glyphicon-play"
								v-bind:class="{ invisible: (active != entry._id) }"></span>
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
		active: String,
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
		},
		play: function(group,song) {
			request('/playback/setposition',{
				playlist: currentPlaylist(),
				group: group,
				song: song
			});
		},

		// beforeEnter: function (el) {
		// 	el.style.opacity = 0
		// 	el.style.height = 0
		// },
		// enter: function (el, done) {
		// 	var delay = el.dataset.index * 150
		// 	setTimeout(function () {
		// 		Velocity(
		// 			el,
		// 			{ opacity: 1, height: '1.6em' },
		// 			{ complete: done }
		// 		)
		// 	}, delay)
		// },
		// leave: function (el, done) {
		// 	var delay = el.dataset.index * 150
		// 	setTimeout(function () {
		// 		Velocity(
		// 			el,
		// 			{ opacity: 0, height: 0 },
		// 			{ complete: done }
		// 		)
		// 	}, delay)
		// }
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
.item > span:not(:nth-child(4)) {
	width: 1em;
	display: inline-block;
	text-align: right;
	margin-right: 0.5em;
}
ul {
	margin: 0;
	padding: 0;
}
</style>
