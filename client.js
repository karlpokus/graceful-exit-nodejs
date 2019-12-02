const Log = require('./log.js');
const http = require('http');
const log = new Log(process.env.LOGNAME);

process.send = (process.send)? process.send : log.out;

const url = 'http://localhost:9012/hi/cf';

log.out(`calling ${ url }`);
http.get(url, res => {
	let data = '';
	res
		.on('error', err => {
			log.out(`err: ${ err.message }`);
			process.exit(1);
		})
		.on('data', chunk => {
			data += chunk;
		})
		.on('end', () => {
			log.out(`response: ${ data }`);
		});
}).on('error', err => {
	log.out(`err: ${ err.message }`);
	process.exit(1);
});

// short delay before sending ready to allow for the request to arrive
setTimeout(() => {
	process.send("done");
}, 1000);
