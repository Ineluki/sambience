const debug = require('debug')('sambience');

const sse = {
	subscribers: new Set(),
	publish: function(evtName,data) {
		this.subscribers.forEach(socket => {
			socket.createEvent(evtName,data);
		});
	},
	subscribe: function(socket) {
		this.subscribers.add(socket);
		return () => {
			this.subscribers.delete(socket);
		}
	}
}

let latestStatus = null;

setInterval(() => {
	sse.publish( 'keepalive', { time: Date.now(), ok: true } );
},1000 * 55);

module.exports = {
	subscribe: function(socket) {
		return sse.subscribe( socket );
		if (latestStatus) {
			this.playback(latestStatus);
		}
	},

	playback: function(data) {
		debug('status-playback',data);
		latestStatus = data;
		sse.publish( 'playback', data );
	},

	scan: function(data) {
		sse.publish( 'scan', data );
	},

	error: function(data) {
		console.log("Error",data);
		sse.publish( 'error', data );
	}
};