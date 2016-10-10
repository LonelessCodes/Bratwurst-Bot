const fs = require("fs");

function getTimeString(black) {
	var d = new Date(),
		time = d.getFullYear() + ".";

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
var LOG = fs.readFileSync(__dirname + "/console.log") + "";
function log(message1, message2, message3, message4, message5) {
	var mes = [message1, message2, message3, message4, message5];

	function convert() {
		var string = "";
		for (var i = 0; i < mes.length; i++) {
			var elem = mes[i];
			if (elem && typeof elem != "undefined") {
				var end = false;
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

	var string = convert();
	console.log(getTimeString() + string.substring(0, string.length - 1));
	LOG += getTimeString(true) + string;
	fs.rename(__dirname + "/console.log", __dirname + "/console.log~", function (err) {
		if (err) throw err;
		fs.writeFile(__dirname + "/console.log", LOG, "utf8");
	});
}

module.exports = log;