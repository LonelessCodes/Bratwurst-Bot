var colors = require("colors"),
	fs = require('fs'),
	chart = require("./charts/charts")();

var Twitter = require('twit');

var client = new Twitter(require("./secret/keys").keys);

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

var time = new Date();
chart.charts(function(paths, info){
	var string = "Bratwurst tweeters were most active " + (info.times > 5 ? info.times > 11 ? info.times > 14 ? info.times > 18 ? info.times > 21 ? "at night" : "in the evening" : "in the afternoon" : "around noon" : "in the morning" : "at night") + ". ";
	string += "Most tweeters came from " + info.global;
	string += " [" + (new Date().getTime() - time.getTime()) + "ms] #BratwurstStats";
	
	console.log(string);
});

var textRender = {
	jobs: [],
	push: function (params) {
		textRender.jobs.push(params);
	},
	working: false,
	start: function () {
		setInterval(textRender.check, 2000);
	},
	check: function () {
		if(textRender.jobs.length > 0 && !textRender.working){
			textRender.jobs[0]();
			textRender.jobs.splice(0, 1);
		}
	}
};
textRender.start();


var textBratwurst = client.stream('statuses/filter', { track: '#onabratwurst' });
textBratwurst.on('tweet', function (tweet) {
	var message = tweet.text.toLowerCase(),
		tweetID = tweet.id_str,
		username = tweet.user.screen_name;

	var badWords = message.indexOf("#heyju magst du bratwurst") > -1 || message.indexOf(" hate ") > -1 || message.indexOf(" nazi") > -1 || message.indexOf(" nazis") > -1 || message.indexOf(" fucking") > -1;

	if (username != "Bratwurst_bot" && !badWords) {
		textRender.push(function(){
			var start = new Date().getTime();
			console.log("yo")
			textRender.working = true;
			var data = {
				text: tweet.text.split("\"")[1],
				user: username + "",
				id: tweetID + ""
			};
			
			var text = data.text;
			var pyString = "" +
				"import bpy\n" +
				"bpy.data.objects[\"Text\"].data.body = \"" + data.text + "\"";

			fs.writeFile(__dirname + "/text.py", pyString, function (err, dataPy) {
				if (err) return console.log(err);

				chart.b3d.renderImage(__dirname + "\\messageBratwurst.blend", __dirname + "/text.py", __dirname + "/text.jpg", function (err) {
					if (err) return console.log(err);
					var pathToText = __dirname + "/text0001.jpg";
					
					var image = fs.readFileSync(pathToText, { encoding: 'base64' });
					var timeTaken = " [" + (new Date().getTime() - start) + "ms]"
					client.post("media/upload", { media_data: image }, function (err, dataMedia, response) {
						image = dataMedia.media_id_string + "";
						
						var params = {
							status: "@" + data.user + " \"" + text + "\"",
							media_ids: [image],
							in_reply_to_status_id: data.id
						};
						params.status += timeTaken;
						client.post('statuses/update', params, function (err, dataResponse, response) {
							if (err) return console.log(err);
							console.log("@" + data.user + " \"" + text + "\" sent");
							textRender.working = false;
						});
					});
				});
			});
		});
	}
});
textBratwurst.on('disconnect', function (disconnectMessage) {
	textBratwurst.stop();
	setTimeout(function () {
		textBratwurst.start();
	}, 10000);
	console.log(disconnectMessage);
});
textBratwurst.on('warning', function (warning) {
	textBratwurst.stop();
	setTimeout(function () {
		textBratwurst.start();
	}, 10000);
	console.log(warning);
});