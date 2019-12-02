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

// if not forked
process.send = (process.send)? process.send : log.out;

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
	log.out('listening', server.listening);
});

['SIGINT', 'SIGTERM'].forEach(sig => {
	process.on(sig, () => {
		log.out('got', sig);
		log.out('cleanup start');
		setTimeout(() => {
			log.out('cleanup end. Exiting');
			process.exit(0);
		}, process.env.GRACEPERIOD);
		server.close(err => {
			log.out('listening', server.listening);
			if (err) {
				log.out("server close err", err);
			}
		});
	});
});
