<template>
	<div id="playlist">
		<draggable :list="data" @change="onGroupChange($event)">
			<div class="group" v-for="(group, grpIndex) in data">
				<header class="hoverable">
					<div class="label">
						<span v-for="(key,index) in groupColumns">
							{{group.group[key]}} <span v-if="index+1 < groupColumns.length"> - </span>
						</span>
					</div>
					<div class="invisible reveal controls">
						<div class="btn glyphicon glyphicon-remove-sign" @click="removeGroup(grpIndex)">
						</div>
					</div>
				</header>
				<main>
					<draggable :list="group.children" @change="onItemChange($event,grpIndex)">

						<div class="item hoverable"
							key="song"
							v-for="(entry,entryIndex) in group.children"
							@dblclick="play(grpIndex,entryIndex)">
							<span class="glyphicon glyphicon-play"
								v-bind:class="{ invisible: (active != entry._id) }"></span>
							<span v-for="key in columns">
								{{entry[key]}}
							</span>
							<timeFormat :sec="entry.duration"></timeFormat>
							<span class="invisible reveal">
								<div class="btn glyphicon glyphicon-remove-sign" @click="removeSong(grpIndex,entryIndex)">
								</div>
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
import Time from './Time.vue';
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
		removeGroup: function(grp) {
			console.log("removeGroup",grp);
			request('/playlist/removegroup',{
				id: currentPlaylist(),
				pos: grp
			}).then((list) => {
				bus.$emit('playlist-update',{
					id: currentPlaylist(),
					data: list
				});
			});
		},
		removeSong: function(grp,song) {
			console.log("removeSong",grp);
			request('/playlist/removesong',{
				id: currentPlaylist(),
				grp: grp,
				song: song
			}).then((list) => {
				bus.$emit('playlist-update',{
					id: currentPlaylist(),
					data: list
				});
			});
		}
	},
	components: {
		draggable,
		timeFormat: Time
	}
}
</script>

<style scoped>

header {
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;

}
header > div {
	flex-grow: 1;
}
header > .controls {
	text-align: right;
	margin-right: 0.5em;
}
.item {
	display: flex;
	flex-flow: row nowrap;
	line-height: 19px;
}
.item > span {
	flex-shrink: 1;
	flex-grow: 0;
	text-align: right;
	margin-right: 0.5em;
}
.item > span:nth-child(4) {
	flex-grow: 1;
	text-align: left;
}
ul {
	margin: 0;
	padding: 0;
}
</style>
