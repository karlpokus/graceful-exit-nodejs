const Log = require('./log.js');
const fork = require('child_process').fork;
const log = new Log("[PARENT]");
const logExit = (caller, code) => {
	log.out(`${ caller } exit ${ code }`);
};

process.on('exit', logExit.bind(null, "parent"));

log.out("starting server");
const server = fork('server.js')
server
	.on('exit', logExit.bind(null, "server"))
	.on('message', msg => {
		if (msg == "ready") {
			log.out('server is ready. Starting client');
			fork('client.js', { env:{ LOGNAME: "[CLIENT]" }})
				.on('exit', logExit.bind(null, "client"))
				.on('message', msg => {
					if (msg == "ready") {
						log.out('client is ready. Killing server');
						server.kill('SIGTERM');
					}
				});
		}
	});
