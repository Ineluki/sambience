import Vue from 'vue'
import App from './Ui/App.vue'

new Vue({
  el: '#app',
  render: h => h(App)
})

/*
 * change favicon based on play status
 */
import {bus} from './Browser/Backend.js';

function changeFavicon(playing) {
	let icon = playing ? 'favicon-play.ico' : 'favicon.ico';
	let elem = document.getElementById('favicon');
	elem.href = icon;
	console.log("changed to "+icon);
}

bus.$on('playback',(data) => {
	changeFavicon(data.type === 'start');
});