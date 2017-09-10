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
				<option value="1">Shuffle Song</option>
				<option value="2">Shuffle Group</option>
				<option value="3">Repeat</option>
			</select>
		</div>
		<div class="log">
			<div v-if="logLine">{{logLine.msg}}</div>
			<div v-for="log in logHistory">{{log.msg}}</div>
		</div>
	</div>
</template>

<script>
import {request,bus} from '../Browser/Backend.js';
export default {
  	name: 'playback',
  	data () {
		let d = {
			mode: 0,
			logHistory: [],
			logLine: null
		};
		bus.$on('scan',(data) => {
			// console.log("scan",data);
			if (data.finished) {
				this.addLog(`${data.type} finished at ${data.path}`,'success',true);
			} else {
				this.addLog(`${data.type} progress: ${data.progress}`,'info',false);
			}
		});
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
			//console.log("changeMode",this.mode);
			request('/playback/setmode',{mode: this.mode});
		},
		addLog: function(msg,cls='info',history=true) {
			if (this.logLine && this.logLine.history) {
				this.logHistory.unshift(this.logLine);
			}
			this.logLine = {
				msg: msg,
				cls: cls,
				history: history
			};
			const logLen = 10;
			if (this.logHistory.length > logLen) {
				this.logHistory = this.logHistory.slice( 0, logLen );
			}
		}
	},
	components: {

	}
}
</script>

<style scoped>


</style>
