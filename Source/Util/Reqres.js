const ExtendableError = require('./Error.js');
const debug = require('debug')('sambience');
const methods = {};

methods.expectArguments = function(data,args) {
	args.forEach((arg) => {
		if (!(arg in data)) {
			throw new ExtendableError("missing argument",1506554035,arg);
		}
	});
	return data;
};

methods.wrap = function(args,fn) {
	return async(params) => {
		try {
			params = methods.expectArguments(params,args);
		} catch (e) {
			return e;
		}
		return Promise.resolve(params)
		.then(fn)
		.then((res) => {
			return res;
		},(err) => {
			debug("request error",err);
			let data;
			if (err instanceof ExtendableError) {
				data = err;
			} else if (err instanceof Error) {
				data = {};
				Object.getOwnPropertyNames(err).forEach(function (key) {
			        data[key] = err[key];
			    }, err);
			} else {
				data = err;
			}
			return Promise.reject(data);
		});
	}
};

methods.fillRouter = function(router,list) {
	for(let r in list) {
		router[r] = methods.wrap( list[r].params ? list[r].params : [], list[r] );
	}
};

module.exports = methods;