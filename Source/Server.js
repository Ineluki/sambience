const Koa = require('koa');
const serve = require('koa-static');
const URL = require('url');
const path = require("path");
const FS = require('fs');
const websockify = require('koa-websocket');
const debug = require('debug')('sambience');
const Lib = require("./Library/Main.js");
const listenPort = require('../Source/Util/Config.js').get('core.port',8080);
const RRM = require('./Util/rrm.js');
const Status = require('./Playback/Status.js');

const app = websockify(new Koa());


//serve static pages, must come first of content
app.use( serve( path.normalize(__dirname+'/../Web/'),{
	maxage : 0,
	hidden : false,
	index : "index.html",
	defer : true
}) );

app.ws.use(async function(ctx,nxt) {
	const client = new RRM({
		out: (data) => {
			ctx.websocket.send(JSON.stringify(data));
		}
	});
	client.setHandler(RRM.WILDCARD,(data,action) => {
		if (routers[action]) {
			return routers[action](data);
		} else {
			return Promise.reject(`${action} is an unknown action`);
		}
	});
	ctx.websocket.on('message',(msg) => {
		try {
			let d = JSON.parse(msg);
			client.handleRequest(d);
		} catch(e) {
			console.error("invalid socket msg: ",msg,e);
		}
	});
	const unsub = Status.subscribe(client);
	ctx.websocket.on('close',unsub);
});

/*
 * dynamically load controllers
 */
const controllerRegexp = /^([a-z]+)\.js$/i;
const routers = {};
FS.readdirSync(path.normalize(__dirname+'/Controller/')).forEach((entry) => {
	let match = controllerRegexp.exec(entry);
	if (!match) return;
	let name = match[1].toLowerCase();
	let r = {};
	require(__dirname+'/Controller/'+entry)(r);
	let k;
	for (k in r) {
		routers[`/${name}${k}`] = r[k];
	}
});

Lib.waitForInit()
.then(() => {
	app.listen(listenPort,() => {
		debug(`listening on port ${listenPort}`);
	});
})



module.exports = app;