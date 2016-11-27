const fs = require("fs");
const path = require("path");
const {tweet, stream} = require("./../modules/twitter");
const BlenderJob = require("./../modules/blender")();
const log = require("./../modules/log");

const pyfile = path.resolve(path.join(__dirname, "\\..\\tmp\\messageBratwurst.py"));

const textBratwurst = stream("#onabratwurst", function (tweetObject) {
	const message = tweetObject.text.toLowerCase();
	const tweetID = tweetObject.id_str;
	const username = tweetObject.user.screen_name;

	const badWords = message.indexOf("#heyju magst du bratwurst") > -1 || message.indexOf(" hate ") > -1 || message.indexOf(" nazi") > -1 || message.indexOf(" nazis") > -1 || message.indexOf(" fucking") > -1;

	if (username === "Bratwurst_bot" || badWords) return;

	const start = new Date().getTime();
	const text = tweetObject.text.split("\"")[1];

	const pyString =
`import bpy
bpy.data.objects["Text"].data.body = "${text}"`;

	fs.writeFile(pyfile, pyString, function (err) {
		if (err) return log(err);

		new BlenderJob(path.resolve(path.join(__dirname, "\\..\\blends\\messageBratwurst.blend")))
			.python(pyfile)
			.save(path.resolve(__dirname + "/../tmp/text.jpg"), err => {
				if (err) return log(err);

				tweet(`@${username} "${text}" [${new Date().getTime() - start}ms]`, {
					media: [__dirname + "/../tmp/text0001.jpg"],
					inReplyTo: tweetID
				}, err => {
					if (err) return log(err);
					log(`@${username} "${text}" sent`);
				});
			});
	});
});
textBratwurst.on("disconnect", function (disconnectMessage) {
	log(disconnectMessage);
	textBratwurst.stop();
	setTimeout(function () {
		textBratwurst.start();
	}, 10000);
});
textBratwurst.on("warning", function (warning) {
	log(warning);
	textBratwurst.stop();
	setTimeout(function () {
		textBratwurst.start();
	}, 10000);
});

log("Bratwurst worker is listening");