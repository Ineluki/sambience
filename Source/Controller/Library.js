const ReqRes = require('../Util/Reqres.js');
const Lib = require('../Library/Main.js');

const methods = {};

methods['GET /index'] = function(params) {
	let index = Lib.getIndex(params.type);
	let data = index.getIndex(params.sub).getView();
	return Promise.resolve(data);
};
methods['GET /index'].params = ['type','sub'];


module.exports = function(router) {
	ReqRes.fillRouter(router,methods);
};