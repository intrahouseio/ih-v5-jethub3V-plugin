// Prevent module being loaded on anything other than Linux
const os = require('node:os');

if (os.type() === 'Linux') {
	// Entry point
	const libgpiod = require('bindings')('node-libgpiod');
	libgpiod.Chip.prototype.getLine = function (n) {
		return new libgpiod.Line(this, n);
	};

	libgpiod.available = function () {
		return true;
	};

	libgpiod.Pin = function (n) {
		// Defaults to chip 0
		const chip = new libgpiod.Chip(0);
		const line = chip.getLine(n);
		return line;
	};

	libgpiod.LineFlags = require('./lib/line-flags');

	module.exports = libgpiod;
} else {
	const libgpiod = {
		available() {
			return false;
		},
	};

	module.exports = libgpiod;
}

