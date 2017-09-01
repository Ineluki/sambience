<template>
	<div id="main">
		<div id="header">
			Status / Actions / Modes
		</div>
		<ul>
			<li v-for="pl in playlistMeta"
				@click="changeOpenList(pl._id)"
				v-bind:class="{ active: (pl._id == currentList) }">
				{{pl.name}}
			</li>
		</ul>
		<grid
			:columns="gridColumns"
			:group-columns="groupColumns"
			:data="playlistData">
		</grid>
	</div>
</template>

<script>
import Table from './Table.vue';
import {request,bus} from '../Browser/Backend.js';
import {currentPlaylist} from '../Browser/Cache.js';

export default {
  	name: 'playlists',
  	data () {
		request('/playlist/')
		.then((data) => {
			let d = {};
			data.forEach((pl) => {
				d[ pl._id ] = pl;
			});
			this.playlistMeta = d;
			if (!currentPlaylist()) {
				let id = Object.keys(this.playlistMeta)[0];
				if (id) this.changeOpenList(id);
			} else {
				this.changeOpenList(currentPlaylist());
			}
		});
		bus.$on('playlist-update',(res) => {
			console.log("playlist-update detected",res,this);
			this.playlists[res.id] = res.data;
			if (res.id === this.currentList) {
				this.playlistData = this.playlists[this.currentList];
			}
		});
    	return {
			currentList: null,
			playlists: {},
			playlistMeta: {},
			playlistData: [],
			gridColumns: ['disknum','tracknum','title'],
			groupColumns: ['artist','album']
		};
  	},
	computed: {
		// playlistData: function() {
		// 	if (this.currentList && this.currentList in this.playlists) {
		// 		return this.playlists[this.currentList];
		// 	} else {
		// 		return [];
		// 	}
		// }
	},
	methods: {
		changeOpenList: function(id) {
			if (this.currentList === id) return;
			currentPlaylist(id);
			this.currentList = id;
			if (typeof this.playlists[this.currentList] === 'undefined') {
				request('/playlist/get',{ id: this.currentList })
				.then((list) => {
					bus.$emit('playlist-update',{
						id: id,
						data: list
					});
				});
			} else {
				this.playlistData = this.playlists[this.currentList];
			}
		}
	},
	components: {
		grid: Table
	}
}
</script>

<style scoped>
ul {
	list-style: none;
	padding: 0;
	margin: 0;
}
li {
	display: inline-block;
	border: 1px solid #aaa;
	padding: 2px;
	cursor: pointer;
}
li.active {
	background: #515;
}
</style>
