const Koa = require('koa');
const Router = require('koa-better-router');
const serve = require('koa-static');
const session = require('koa-session');
const URL = require('url');
const path = require("path");
const FS = require('fs');
const debug = require('debug')('sambience');
const listenPort = require('../Source/Util/Config.js').get('core.port',8080);
const app = new Koa();


//serve static pages, must come first of content
app.use( serve( path.normalize(__dirname+'/../Web/'),{
	maxage : 0,
	hidden : false,
	index : "index.html",
	defer : true
}) );

/*
 * dynamically load controllers
 */
const controllerRegexp = /^([a-z]+)\.js$/i;
FS.readdirSync(path.normalize(__dirname+'/Controller/')).forEach((entry) => {
	let match = controllerRegexp.exec(entry);
	if (!match) return;
	let name = match[1].toLowerCase();
	let r = Router({ prefix: name });
	require(__dirname+'/Controller/'+entry)(r);
	app.use(r.middleware());
});



app.listen(listenPort,() => {
	debug(`listening on port ${listenPort}`);
});

module.exports = app;