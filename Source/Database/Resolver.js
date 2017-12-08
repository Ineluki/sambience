"use strict";
const Config = require('../Util/Config.js');
const MongoAdapter = require('./Mongo/Adapter.js');
const NedbAdapter = require('./Nedb/Adapter.js');

let dbAdapter;

switch( Config.get('database.type') ) {
	case 'mongo':
	case 'mongodb':
		dbAdapter = new MongoAdapter( Config.get('database.options') );
	break;

	case 'nedb':
		dbAdapter = new NedbAdapter( Config.get('database.options') );
	break;

	default:
		throw new Error("unknown dbType: "+dbType);
}

module.exports = dbAdapter;