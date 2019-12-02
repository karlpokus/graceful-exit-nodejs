const Log = require('./log.js');
const http = require('http');
const log = new Log("[CLIENT]");

process.send = (process.send)? process.send : log.out;

const agent = new http.Agent({
	keepAlive: true,
	keepAliveMsecs: 15000
});

const makeRequest = (path, cb) => {
	let opts = {
		hostname: 'localhost',
	  port: 9012,
	  path: path,
	  method: 'GET',
		agent: agent,
		//headers: { "Connection": "Keep-Alive"	}
	};

	http.request(opts, res => {
		if (process.env.HEADERS == "1") {
			log.out('response headers', JSON.stringify(res.headers, null, 2));
		}
		let data = '';
		res
			.on('error', err => { // don't exit on error
				log.out('response err', err.message);
			})
			.on('data', chunk => {
				data += chunk;
			})
			.on('end', () => {
				cb(data);
			});
	}).on('error', err => { // don't exit on error
		log.out('request err', err.message);
	}).end();
};

log.out('1st call to server');
makeRequest('/hi/one', data => {
	log.out('response', data);
	process.send("done");
	setTimeout(() => {
		log.out('2nd call to server');
		makeRequest('/hi/two', data => {
			log.out('response', data);
		});
	}, 2000);
});
