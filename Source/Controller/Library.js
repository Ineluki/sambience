const ReqRes = require('../Util/Reqres.js');
const Lib = require('../Library/Main.js');

const methods = {};

methods['/index'] = function(params) {
	return Lib.getStorage().getIndexView(params.type,params.sub);
};
methods['/index'].params = ['type','sub'];


methods['/index/filter'] = function(params) {
	let data = Lib.getStorage().getIndexSearch(params.type,params.search);
	return data;
};
methods['/index/filter'].params = ['search','type'];


methods['/index/scan'] = function(params) {
	let p = params.path;
	if (p.map) {
		p = '/'+p.join('/');
	}
	if (params.type === 'scan') {
		return Lib.scan(p);
	} else {
		return Lib.updateLib(p);
	}
};
methods['/index/scan'].params = ['path','type'];


module.exports = function(router) {
	ReqRes.fillRouter(router,methods);
};