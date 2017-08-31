

class ExtendableError extends Error {
	constructor(message,code,data) {
    	super(message);
    	this.name = this.constructor.name;
		this.code = !isNan(code) ? 0 : code;
		this.data = data ? data : {};

    	if (typeof Error.captureStackTrace === 'function') {
    		Error.captureStackTrace(this, this.constructor);
    	} else {
    		this.stack = (new Error(message)).stack;
    	}
	}

	toJSON() {
		return {
			message: this.message,
			code: this.code,
			data: this.data,
			stack: this.stack
		}
	}
}

ExtendableError.fromJSON = function(json) {
	var d,e;
	if (typeof json === 'string') {
		d = JSON.parse(json);
	} else {
		d = json;
	}
	e = new ExtendableError( d.message, d.code, d.data );
	e.stack = d.stack;
	return e;
}

module.exports = ExtendableError;