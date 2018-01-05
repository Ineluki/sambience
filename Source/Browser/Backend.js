import Vue from 'vue';
const Error = require('../Util/Error.js');
const RRM = require('../Util/rrm.js');
const ReconnectingWebSocket = require('reconnecting-websocket');
const bus = new Vue();

let websocket = new ReconnectingWebSocket('ws://'+document.location.host+'/ws/');
let hostConnection = new RRM({
	out: (data) => {
		websocket.send(JSON.stringify(data));
	},
	initStatus: RRM.S_QUEUED,
	timeout: 9000
});
websocket.addEventListener('message',(e) => {
	hostConnection.handleRequest(JSON.parse(e.data));
});
websocket.addEventListener('open',() => {
	hostConnection.setStatus(RRM.S_OPEN);
});
websocket.addEventListener('close',() => {
	hostConnection.setStatus(RRM.S_QUEUED);
});



let bindEvents = ['playback','scan','error'];
function initConnection() {
	bindEvents.forEach(event => {
		hostConnection.setHandler(event,function(data) {
			bus.$emit(event,data);
		});
	});
}

initConnection();

const request = function(action,params) {
	return hostConnection.createRequest(action,params,1000)
	.catch(err => {
		bus.$emit('error',(err.message ? err.message : err) +" for action "+action);
		return Promise.reject(err);
	});
};

module.exports = {
	request,
	bus
};