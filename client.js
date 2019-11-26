const Log = require('./log.js');
const http = require('http');
const log = new Log("[CLIENT]");

process.send = (process.send)? process.send : console.log;

const url = 'http://localhost:9012/hi/cf';

log.out(`calling ${ url }`);
http.get(url, res => {
	let data = '';
	res
		.on("error", err => {
			log.out("Error: " + err.message);
		})
		.on('data', (chunk) => {
			data += chunk;
		})
		.on('end', () => {
			log.out(data);
		});
}).on('error', err => {
	log.out("Error: " + err.message);
});

// short delay before sending ready to allow for the request to arrive
setTimeout(() => {
	process.send("ready");
}, 1000);
