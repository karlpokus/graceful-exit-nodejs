const gracefulShutdown = require('http-graceful-shutdown');
const Koa = require('koa');
const Router = require('koa-router');
const Log = require('./log.js');

const app = new Koa();
const router = new Router();
const host = "localhost";
const port = "9012";
const log = new Log("[SERVER]");

const foo = ctx => { // simulate slow client
	log.out('got request');
	return setTimeout(() => {
		log.out('reply to request');
		ctx.res.end(`hi ${ ctx.params.user }`);
	}, process.env.HANDLER_LATENCY);
}

router
	.get("/hi/:user", foo)

app
	.use(router.routes())
	.use(router.allowedMethods());

app.context.respond = false; // to enable timeout in handler

// start server
server = app.listen(port, host, () => {
	log.out(`listening on ${ host }:${ port }`);
	process.send("ready");
});

function cleanup(signal) {
  return new Promise((resolve) => {
		log.out('cleanup start');
  	setTimeout(function() {
  		log.out('cleanup done');
  		resolve();
  	}, 2000)
  });
}

const x = gracefulShutdown(server, {
	signals: 'SIGINT SIGTERM',
	timeout: process.env.GRACEPERIOD, // should be less than graceperiod in orchestrator
	development: false,
	onShutdown: cleanup,
	finally: () => {
		log.out('graceful exit done')
	}
});
