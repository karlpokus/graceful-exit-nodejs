function fmt(x) {
	x = x.toString();
	if (x.length == 1) {
		return "0"+x;
	}
	return x;
}

function Logger(caller) {
	this.caller = caller;
	this.out = msg => {
		const d = new Date();
		const ts = `${ fmt(d.getHours()) }:${ fmt(d.getMinutes()) }:${ fmt(d.getSeconds()) }`;
		console.log(`${ this.caller } ${ ts } ${ msg }`);
	}
}

module.exports = Logger;
