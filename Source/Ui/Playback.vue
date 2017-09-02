<template>
	<div id="playback">
		<div class="controls">
			<button @click="control('jumpPrev')">
				<span class="glyphicon glyphicon-step-backward"></span>
			</button>
			<button @click="control('stop')">
				<span class="glyphicon glyphicon-stop"></span>
			</button>
			<button @click="control('start')">
				<span class="glyphicon glyphicon-play"></span>
			</button>
			<button @click="control('jumpNext')">
				<span class="glyphicon glyphicon-step-forward"></span>
			</button>
			<button @click="control('jumpNextGroup')">
				<span class="glyphicon glyphicon-fast-forward"></span>
			</button>
		</div>
		<div class="modes">
			<select @change="changeMode" v-model="mode">
				<option value="0">Normal</option>
				<option value="1">Rnd Song</option>
				<option value="2">Rng Grp</option>
				<option value="3">Repeat</option>
			</select>
		</div>
	</div>
</template>

<script>
import {request} from '../Browser/Backend.js';
export default {
  	name: 'playback',
  	data () {
		let d = {
			mode: 0
		};
    	return d;
  	},
	methods: {
		control: function(cmd) {
			// console.log("control",cmd);
			request('/playback',{
				cmd: cmd
			});
		},
		changeMode: function(e) {
			console.log("changeMode",this.mode);
			request('/playback/setmode',{mode: this.mode});
		}
	},
	components: {

	}
}
</script>

<style scoped>


</style>
