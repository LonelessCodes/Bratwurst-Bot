var Twitter = require('twit'),
	colors = require("colors"),
	fs = require('fs'),
	chart = require("./charts/charts")();

var client = new Twitter(require("./secret/keys").keys);

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

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */
var LOG = fs.readFileSync(__dirname + '/console.log') + "";
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
	fs.rename(__dirname + '/console.log', __dirname + '/console.log~', function (err) {
		if (err) throw err;
		fs.writeFile(__dirname + "/console.log", LOG, "utf8");
	});
}

var time = new Date();
chart.charts(function(paths, info){
	var string = "Bratwurst tweeters were most active " + (info.times > 5 ? info.times > 11 ? info.times > 14 ? info.times > 18 ? info.times > 21 ? "at night" : "in the evening" : "in the afternoon" : "around noon" : "in the morning" : "at night") + ". ";
	string += "Most tweeters came from " + info.global;
	string += " [" + (new Date().getTime() - time.getTime()) + "ms] #BratwurstStats";
	
	var firstImage = fs.readFileSync(paths.times, { encoding: 'base64' });	
	client.post("media/upload", { media_data: firstImage }, function (err, data, response) {
		firstImage = data.media_id_string + "";
		
		var secondImage = fs.readFileSync(paths.global, { encoding: 'base64' });	
		client.post("media/upload", { media_data: secondImage }, function (err, data, response) {
			secondImage = data.media_id_string + "";
			
			var thirdImage = fs.readFileSync(paths.source, { encoding: 'base64' });	
			client.post("media/upload", { media_data: thirdImage }, function (err, data, response) {
				thirdImage = data.media_id_string + "";
				
				var params = { status: string, media_ids: [firstImage, secondImage, thirdImage] };
				client.post('statuses/update', params, function (err, data, response) {
					log(string, (string.length + 23 <= 140));
					
					chart.user(function(file, dataf){
						var userImage = fs.readFileSync(file, { encoding: 'base64' });	
						client.post("media/upload", { media_data: userImage }, function (err, data, response) {
							userImage = data.media_id_string + "";
							
							var params = { status: "Top Bratwurst tweeter of the month is @" + dataf.user + " with " + dataf.value + " tweets. Congratulations!!!", media_ids: [userImage] };
							client.post('statuses/update', params, function (err, data, response) {
								log("Top Bratwurst tweeter of the month is @" + dataf.user + " with " + dataf.value + " tweets. Congratulations!!!", ("Top Bratwurst tweeter of the month is @" + data.user + " with " + data.value + " tweets. Congratulations!!!".length + 23 <= 140));
							});
						});
					});
				});
			});
		});
	});
});