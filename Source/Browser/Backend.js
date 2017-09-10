import Vue from 'vue';
const axios = require('axios');
const Error = require('../Util/Error.js');

const sse = new EventSource('/sse/');
const bus = new Vue();

let bindEvents = ['playback','scan','error'];
bindEvents.forEach(event => {
	sse.addEventListener(event,function(e) {
		let data = JSON.parse(e.data);
		bus.$emit(event,data);
	});
});

sse.onerror = function(e) {
	console.error("see-error",e);
};

const request = function(action,params) {
	return axios({
		method: 'GET',
		url: action + (params ? `?__p=${JSON.stringify(params)}` : '')
	}).then(result => {
		if (result.data.error) {
			let e = Error.fromJSON(result.data);
			bus.$emit('error',e);
			return Promise.reject(e);
		}
		return result.data;
	});
}

module.exports = {
	request,
	bus
};