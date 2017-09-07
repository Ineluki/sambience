<template>
	<div id="index">
		<ul>
			<li>
			    <div class="bold">
					{{treeMode}}
			    </div>
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
import {request} from '../Browser/Backend.js';

export default {
  	name: 'index',
  	data () {
		let d = {
			tree: { children: [] },
			treeMode: 'directory',
			searchValue: ''
		};
		setTimeout(() => { this.loadRootLevel(); },100);
    	return d;
  	},
	methods: {
		loadRootLevel : function() {
			request('/library/index',{ type: this.treeMode, sub: [] })
			.then((res) => {
				console.log("result",res);
				this.tree.children = res;
			});
		},
		changeTreeType: function() {
			console.log("changeTreeType",this.treeMode);
			this.loadRootLevel();
		},
		filter: debounce(function() {
			console.log("filter",this.searchValue);
			if (this.searchValue.length === 0) {
				return;
			}
			request('/library/index/filter',{
				type: this.treeMode,
				search: this.searchValue
			}).then((index) => {
				this.tree.children = index;
			});
		},400)
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
		tree: Tree
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
