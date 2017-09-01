const ExtendableError = require('./Error.js');
const debug = require('debug')('music');
const methods = {};

methods.expectArguments = function(request,args) {
	let res = {};
	let data = request.query.__p ? JSON.parse(request.query.__p) : {};
	args.forEach((arg) => {
		if (!(arg in request.query) && !(arg in data)) {
			throw new ExtendableError("missing argument",13232,arg);
		}
		res[arg] = arg in data ? data[arg] : request.query[arg];
	});
	return res;
};

methods.wrap = function(args,fn) {
	return async(ctx,next) => {
		try {
			params = methods.expectArguments(ctx.request,args);
		} catch (e) {
			ctx.body = JSON.stringify(e,null,' ');
			return;
		}
		await fn(params)
		.then((res) => {
			ctx.body = JSON.stringify(res,null,' ');
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
			ctx.body = JSON.stringify(data,null,' ');
		});
	}
};

methods.fillRouter = function(router,list) {
	for(let r in list) {
		router.addRoute(r,methods.wrap( list[r].params ? list[r].params : [], list[r] ));
	}
};

module.exports = methods;