const SSE = require('sse-broadcast');

const sse = SSE();

module.exports = {
	subscribe: function(response) {
		sse.subscribe('default','status',response);
	},

	emit: function(data) {
		sse.publish('default','status',data);
	}
}