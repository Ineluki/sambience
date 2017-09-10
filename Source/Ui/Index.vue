<template>
	<div id="index">
		<ul>
			<li>
			    <div class="bold">
					{{treeMode}}
			    </div>
				<context-menu id="context-menu" ref="scanMenu">
					<li @click="initScan('update')">Update Meta-Data</li>
					<li @click="initScan('scan')">Scan for Files</li>
				</context-menu>
			    <ul>
			      	<tree
				        class="item"
				        v-for="(child,i) in tree.children"
						v-model="tree.children[i]"
						:searchValue="searchValue"
						:treeMode="treeMode">
			      	</tree>
			    </ul>
		  	</li>
		</ul>
		<div class="controls">
			<input type="text" v-model="searchValue" placeholder="Search"/>
			<input type="reset" @click="searchValue = ''" value="Reset" />
			<select @change="changeTreeType" v-model="treeMode">
				<option value="directory">Dir</option>
				<option value="artist">Artist</option>
			</select>
		</div>
	</div>
</template>

<script>
import Tree from './Tree.vue';
import debounce from 'lodash.debounce';
import {request,bus} from '../Browser/Backend.js';
import contextMenu from 'vue-context-menu';

export default {
  	name: 'index',
  	data () {
		let d = {
			tree: { children: [] },
			treeMode: 'directory',
			searchValue: '',
			contextMenuModel: null
		};
		bus.$on('scan-menu',(e,m) => {
			if (this.treeMode !== 'directory') return;
			this.contextMenuModel = m;
			this.$refs.scanMenu.open(e,m);
		});
		setTimeout(() => { this.loadRootLevel(); },100);
    	return d;
  	},
	methods: {
		loadRootLevel : function() {
			request('/library/index',{ type: this.treeMode, sub: [] })
			.then((res) => {
				//console.log("result",res);
				this.tree.children = res;
			});
		},
		changeTreeType: function() {
			//console.log("changeTreeType",this.treeMode);
			this.loadRootLevel();
		},
		filter: debounce(function() {
			//console.log("filter",this.searchValue);
			if (this.searchValue.length === 0) {
				return;
			}
			request('/library/index/filter',{
				type: this.treeMode,
				search: this.searchValue
			}).then((index) => {
				this.tree.children = index;
			});
		},400),
		initScan: function(type) {
			//console.log("YAY update",this.contextMenuModel);
			request('/library/index/scan',{ path: this.contextMenuModel.path, type: type });
		}
	},
	watch: {
		searchValue: function(newValue) {
			if (newValue.length) {
				this.filter();
			} else {
				return this.loadRootLevel();
			}
		}
	},
	components: {
		tree: Tree,
		contextMenu: contextMenu
	}
}
</script>

<style scoped>
ul {
	list-stype: none;
	margin: 0;
	padding: 0;
}
</style>
