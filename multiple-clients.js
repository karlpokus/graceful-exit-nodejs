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
			log.out('server is ready. Starting client-01');
			fork('client.js')
				.on('exit', logExit.bind(null, "client-01"))
				.on('message', msg => {
					if (msg == "ready") {
						log.out('client-01 is ready. Killing server and starting client-02');
						server.kill('SIGTERM');

						fork('client.js')
							.on('exit', logExit.bind(null, "client-02"))
							// ignore msg from client-02

					}
				});
		}
	});
