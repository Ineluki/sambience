const SSE = require('sse-broadcast');
const debug = require('debug')('sambience');
const sse = SSE();

const channelName = 'default';

let latestStatus = null;

setInterval(() => {
	sse.publish( channelName, 'keepalive', { time: Date.now(), ok: true } );
},1000 * 55);

module.exports = {
	subscribe: function(response) {
		sse.subscribe( channelName, response );
		if (latestStatus) {
			this.playback(latestStatus);
		}
	},

	playback: function(data) {
		debug('status-playback',data);
		latestStatus = data;
		sse.publish( channelName, 'playback', data );
	},

	scan: function(data) {
		sse.publish( channelName, 'scan', data );
	},

	error: function(data) {
		console.log("Error",data);
		sse.publish( channelName, 'error', data );
	}
}