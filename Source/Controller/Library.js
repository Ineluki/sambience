const ReqRes = require('../Util/Reqres.js');
const Lib = require('../Library/Main.js');

const methods = {};

methods['GET /index'] = function(params) {
	let index = Lib.getIndex(params.type);
	let data = index.getIndex(params.sub).getView();
	return data;
};
methods['GET /index'].params = ['type','sub'];

methods['GET /index/filter'] = function(params) {
	let index = Lib.getIndex(params.type);
	let data = index.getIndex([]).getFilteredView(params.search);
	return data;
};
methods['GET /index/filter'].params = ['search','type'];


module.exports = function(router) {
	ReqRes.fillRouter(router,methods);
};