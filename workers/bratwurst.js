const fs = require("fs");
const path = require("path");
const {tweet, stream, botName} = require("./../modules/twitter");
const BlenderJob = require("./../modules/blender")();
const log = require("./../modules/log");
const utils = require("./../modules/utils");

const tmp = require("tmp");
tmp.setGracefulCleanup();

const root = path.resolve(path.join(__dirname, ".."));

stream("#onabratwurst", tweetObject => {
	const message = tweetObject.text.toLowerCase();
	const tweetID = tweetObject.id_str;
	const username = tweetObject.user.screen_name;

	const badWords = message.indexOf("magst du bratwurst") > -1 || message.indexOf(" hate ") > -1 || message.indexOf(" nazi") > -1 || message.indexOf(" nazis") > -1 || message.indexOf(" fucking") > -1;

	if (username === botName || badWords || /^rt/.test(message)) return;

	const start = Date.now();
	const text = tweetObject.text.split("\"")[1];

	const pyString = "import bpy\n" +
		`bpy.data.objects["Text"].data.body = "${text}"`;

	const pyfile = tmp.fileSync({ mode: 644, prefix: "bratwurst-", postfix: ".py" }).name;
	const blend = path.join(root, "blends", "message.blend");
	const media = tmp.fileSync({ mode: 644, prefix: "bratwurst-", postfix: ".jpg" }).name;
	fs.writeFile(pyfile, pyString, function (err) {
		if (err) return log(err);

		new BlenderJob(blend)
			.python(pyfile)
			.save(media, err => {
				if (err) return log(err);

				tweet(`@${username} "${text}" [${utils.time(start, Date.now())}]`, {
					media: [media],
					inReplyTo: tweetID
				}, err => {
					if (err) return log(err);
					log(`@${username} "${text}" sent`);
				});
			});
	});
}, 60);

log("Bratwurst worker is listening");