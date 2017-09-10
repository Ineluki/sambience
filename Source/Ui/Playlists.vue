<template>
	<div id="main">
		<div id="header">
			<playback></playback>
			<modal v-if="showEditPlaylist" @close="showEditPlaylist = false">
				<h3 slot="header">Playlist Edit</h3>
				<div slot="body">
					<input v-model="editPlaylistMeta.name"/>
					<input v-model="editPlaylistMeta.delete" type="checkbox" value="1"/> Delete
				</div>
				<div slot="footer">
					<button @click="savePlaylist">Save</button>
					<button @click="showEditPlaylist = false">Close</button>
				</div>
			</modal>
		</div>
		<ul>
			<li 	v-for="pl in playlistMeta"
					@click="changeOpenList(pl._id)"
					v-bind:class="{ active: (pl._id == currentList) }">
				<span class="glyphicon glyphicon-play"
					v-bind:class="{ invisible: (pl._id != playing.playlist) }"></span>
				{{pl.name}}
				<span class="btn glyphicon glyphicon-edit" @click="editPlaylist(pl)"></span>

			</li>
			<li @click="addPlaylist"> + </li>
		</ul>
		<grid
			:columns="gridColumns"
			:group-columns="groupColumns"
			:data="playlistData"
			:active="playing.song">
		</grid>
	</div>
</template>

<script>
import Table from './Table.vue';
import Playback from './Playback.vue';
import {request,bus} from '../Browser/Backend.js';
import {currentPlaylist} from '../Browser/Cache.js';
import Modal from './Modal.vue';
import Vue from 'vue';

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
			//console.log("playlist-update detected",res,this);
			this.playlists[res.id] = res.data;
			if (res.id === this.currentList) {
				this.playlistData = this.playlists[this.currentList];
			}
		});
		bus.$on('playback',(data) => {
			if (data.type === 'start') {
				this.playing = data;
			} else if(data.type === 'stop') {
				this.playing = {};
			}
		});
    	return {
			playing: {},
			currentList: null,
			editPlaylistMeta: null,
			showEditPlaylist: false,
			playlists: {},
			playlistMeta: {},
			playlistData: [],
			gridColumns: ['disknum','tracknum','title'],
			groupColumns: ['artist','album']
		};
  	},
	computed: {

	},
	methods: {
		editPlaylist: function(pl) {
			this.editPlaylistMeta = { delete: false };
			Object.keys(pl).forEach(k => { this.editPlaylistMeta[k] = pl[k]; });
			this.showEditPlaylist = true;
		},
		savePlaylist: function() {
			console.log("save Playlist",this.editPlaylistMeta);
			request('/playlist/save',{ obj: this.editPlaylistMeta })
			.then((pl) => {
				if (pl.deleted) {
					Vue.delete( this.playlistMeta, pl.deleted );
					if (pl.deleted === currentPlaylist()) {
						let id = Object.keys(this.playlistMeta)[0];
						if (id) this.changeOpenList(id);
					}
				} else {
					this.playlistMeta[ pl._id ] = pl;
				}
				this.showEditPlaylist = false;
			});
		},
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
		},
		addPlaylist: function() {
			request('/playlist/create',{name: 'new pl'})
			.then((pl) => {
				Vue.set(this.playlistMeta, pl._id, pl);
			});
		}
	},
	components: {
		grid: Table,
		playback: Playback,
		modal: Modal
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
