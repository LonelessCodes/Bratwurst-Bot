const fs = require("fs");
const {resolve} = require("path");
const logPath = resolve(__dirname + "/../console.log");

function getTimeString(black) {
	const d = new Date();
	let time = d.getFullYear() + ".";

	function cl(num, millsec) {
		if (millsec) {
			if (num < 100) {
				if (num < 10) return "00" + num;
				else return "0" + num;
			} else return num;
		} else {
			if (num < 10) return "0" + num;
			else return num;
		}
	}

	time += cl(d.getMonth() + 1) + "." +
		cl(d.getDate()) + " " +
		cl(d.getHours()) + ":" +
		cl(d.getMinutes()) + ":" +
		cl(d.getSeconds()) + ":" +
		cl(d.getMilliseconds(), true);

	if (black) return "<" + time + "> ";
	else return "<" + time.red + "> ";
}

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */
function log(...messages) {
	var LOG = fs.readFileSync(logPath) + "";
	function convert() {
		let string = "";
		for (let i = 0; i < messages.length; i++) {
			const elem = messages[i];
			if (elem && typeof elem !== "undefined") {
				let end = false;
				switch (typeof elem) {
				case "string":
					string += elem;
					break;
				case "number":
					string += elem.toString();
					break;
				case "boolean":
					string += elem ? "true" : "false";
					break;
				default:
					try { string += elem; } catch (err) { end = true; }
					break;
				}
				if (!end) string += "\n";
			}
		}
		return string;
	}

	const string = convert();
	console.log(getTimeString() + string);
	LOG += getTimeString(true) + string;
	fs.rename(logPath, logPath + "~", function (err) {
		if (err) throw err;
		fs.writeFile(logPath, LOG, "utf8");
	});
}

module.exports = log;