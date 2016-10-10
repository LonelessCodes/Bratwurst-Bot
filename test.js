const fs = require("fs");
const chart = require("./charts/charts")();

const {tweet, stream} = require("./modules/twitter");

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

const time = new Date();
chart.charts(function(paths, info){
	var string = "Bratwurst tweeters were most active " + (info.times > 5 ? info.times > 11 ? info.times > 14 ? info.times > 18 ? info.times > 21 ? "at night" : "in the evening" : "in the afternoon" : "around noon" : "in the morning" : "at night") + ". ";
	string += "Most tweeters came from " + info.global;
	string += " [" + (new Date().getTime() - time.getTime()) + "ms] #BratwurstStats";
	
	console.log(string);
});

const Queue = require("./modules/queue");
const queue = new Queue();

var textBratwurst = stream("#onabratwurst", function (tweetObject) {
	var message = tweetObject.text.toLowerCase(),
		tweetID = tweetObject.id_str,
		username = tweetObject.user.screen_name;

	var badWords = message.indexOf("#heyju magst du bratwurst") > -1 || message.indexOf(" hate ") > -1 || message.indexOf(" nazi") > -1 || message.indexOf(" nazis") > -1 || message.indexOf(" fucking") > -1;

	if (username != "Bratwurst_bot" && !badWords) {
		const func = done => {
			const start = new Date().getTime();
			var data = {
				text: tweetObject.text.split("\"")[1],
				user: username + "",
				id: tweetID + ""
			};
			
			var text = data.text;
			var pyString = "" +
				"import bpy\n" +
				"bpy.data.objects[\"Text\"].data.body = \"" + data.text + "\"";

			fs.writeFile(__dirname + "/text.py", pyString, function (err) {
				if (err) return console.log(err);

				new chart.BlenderJob(__dirname + "\\blends\\messageBratwurst.blend")
					.python(__dirname + "/text.py")
					.save(__dirname + "/text.jpg", err => {
						if (err) return console.log(err);
						const pathToText = __dirname + "/text0001.jpg";
						
						const timeTaken = new Date().getTime() - start;

						tweet(`@${data.user} "${text}" [${timeTaken}ms]`, {
							media: [pathToText],
							inReplyTo: data.id
						}, err => {
							if (err) return console.log(err);
							console.log(`@${data.user} "${text}" sent`);
							done();
						});
					});
			});
		};
		queue.push(func);
	}
});
textBratwurst.on("disconnect", function (disconnectMessage) {
	console.log(disconnectMessage);
	textBratwurst.stop();
	setTimeout(function () {
		textBratwurst.start();
	}, 10000);
});
textBratwurst.on("warning", function (warning) {
	console.log(warning);
	textBratwurst.stop();
	setTimeout(function () {
		textBratwurst.start();
	}, 10000);
});