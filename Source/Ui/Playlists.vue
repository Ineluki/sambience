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
			<context-menu id="context-menu" ref="plMenu">
				<li @click="plMenuButton('sort')">Sort</li>
				<li @click="plMenuButton('edit')">Edit</li>
				<li @click="plMenuButton('delete')">Delete</li>
			</context-menu>
		</div>
		<ul id="playlistTabs">
			<li 	v-for="pl in playlistMeta"
					@click="changeOpenList(pl._id)"
					@contextmenu.prevent="plMenu($event,pl)"
					v-bind:class="{ active: (pl._id == currentList) }">
				<span class="glyphicon glyphicon-play"
					v-bind:class="{ invisible: (pl._id != playing.playlist) }"></span>
				{{pl.name}}
			</li>
			<li @click="addPlaylist"> + </li>
		</ul>
		<grid v-if="playlistData"
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
import contextMenu from 'vue-context-menu';

export default {
  	name: 'playlists',
  	data () {
		request('/playlist/')
		.then((data) => {
			let d = {};
			if (data.length) {
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
			} else {
				this.addPlaylist();
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
					delete(this.playlistMeta[pl.deleted]);
					if (Object.keys(this.playlistMeta).length === 0) {
						this.addPlaylist();
					} else {
						if (pl.deleted === currentPlaylist()) {
							this.changeOpenList(Object.keys(this.playlistMeta)[0]);
						}
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
			if (id && typeof this.playlists[this.currentList] === 'undefined') {
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
			request('/playlist/create',{name: 'Playlist'})
			.then((pl) => {
				Vue.set(this.playlistMeta, pl._id, pl);
				this.changeOpenList(pl._id);
			});
		},
		plMenu: function(e,pl) {
			this.editPlaylistMeta = pl;
			this.$refs.plMenu.open(e);
		},
		plMenuButton: function(action) {
			switch(action) {
				case 'sort':
					let id = this.editPlaylistMeta._id;
					request('/playlist/sort',{ id: id })
					.then((list) => {
						bus.$emit('playlist-update',{
							id: id,
							data: list
						});
					});
				break;

				case 'edit':
					this.editPlaylist(this.editPlaylistMeta);
				break;

				case 'delete':
					this.editPlaylistMeta.delete = 1;
					this.savePlaylist();
				break;

				default:
					console.error("unknown action: "+action);
				return;
			}
		}
	},
	components: {
		grid: Table,
		playback: Playback,
		modal: Modal,
		contextMenu: contextMenu
	}
}
</script>

<style scoped>
#playlistTabs {
	list-style: none;
	padding: 0;
	margin: 0;
}
#playlistTabs > li {
	display: inline-block;
	padding: 2px;
	cursor: pointer;
}

</style>
