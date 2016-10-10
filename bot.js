var Twitter = require("twit"),
	fs = require("fs"),
	chart = require("./charts/charts")();

var client = new Twitter(require("./secret/keys").keys);

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

const log = require("./modules/log");

/**
 * Initializing the cache
 * gotta polish this till it is a real cacher
 */
var IGNORE = JSON.parse(fs.readFileSync("database/IGNORE.txt")),
	ALLUSERS = JSON.parse(fs.readFileSync("database/ALLUSERS.txt")),
	STATS = JSON.parse(fs.readFileSync("database/STATS.txt"));

if (typeof IGNORE != "object" || typeof ALLUSERS != "object" || typeof STATS != "object") {
	IGNORE = JSON.parse(fs.readFileSync("database/IGNORE.txt1"));
	ALLUSERS = JSON.parse(fs.readFileSync("database/ALLUSERS.txt1"));
	STATS = JSON.parse(fs.readFileSync("database/STATS.txt1"));
}

function updateCache() {
	fs.rename("database/IGNORE.txt1", "database/IGNORE.txt2", function (err) {
		fs.rename("database/IGNORE.txt", "database/IGNORE.txt1", function (err) {
			if (err) return log(err);
			fs.writeFile("database/IGNORE.txt", JSON.stringify(IGNORE, null, 4), function (err) {
				if (err) return log(err);
			});
		});
	});
	fs.rename("database/ALLUSERS.txt1", "database/ALLUSERS.txt2", function (err) {
		fs.rename("database/ALLUSERS.txt", "database/ALLUSERS.txt1", function (err) {
			if (err) return log(err);
			fs.writeFile("database/ALLUSERS.txt", JSON.stringify(ALLUSERS, null, 4), function (err) {
				if (err) return log(err);
			});
		});
	});
	fs.rename("database/STATS.txt1", "database/STATS.txt2", function (err) {
		fs.rename("database/STATS.txt", "database/STATS.txt1", function (err) {
			if (err) return log(err);
			fs.writeFile("database/STATS.txt", JSON.stringify(STATS, null, 4), function (err) {
				if (err) return log(err);
			});
		});
	});
}
setInterval(updateCache, 1000 * 60 * 2);

/**
 * Check Functions
 */
function isIgnored(name) {
	return (IGNORE.indexOf(name) > -1);
}

/**
 * Serious Stuff
 */
var lastTweet;
var bratwurst = client.stream("statuses/filter", { track: "bratwurst" });
bratwurst.on("tweet", function (tweet) {
	var message = tweet.text.toLowerCase(),
		tweetID = tweet.id_str,
		username = tweet.user.screen_name;

	var badWords = message.indexOf("#heyju magst du bratwurst") > -1 || message.indexOf(" hate ") > -1 || message.indexOf(" nazi") > -1 || message.indexOf(" nazis") > -1 || message.indexOf(" fucking") > -1;

	if (!isIgnored(username)
		&& lastTweet != tweetID
		&& message.indexOf("@bratwurst_bot") < 0
		&& message.indexOf("rt @") != 0
		&& message.indexOf("bratwurst") > -1
		&& !badWords) {
		// Update Stats
		var exists = false;
		for (var i = 0; i < ALLUSERS.length; i++) {
			if (STATS[i]["name"] == username) {
				exists = i;
				break;
			}
		}
		if (!exists) {
			STATS.push({
				"name": username,
				"array": []
			});
			exists = STATS.length - 1;
		}
		STATS[exists]["image"] = tweet.user.profile_image_url;
		STATS[exists]["array"].push({
			"tweetID": tweetID,
			"source": tweet.source,
			"place": tweet.place ? tweet.place.country_code : null,
			"offset": tweet.user.utc_offset ? tweet.user.utc_offset : null,
			"lang": tweet.lang ? tweet.lang : null,
			"hashtags": tweet.entities.hashtags,
			"timestamp": new Date(tweet.created_at).getTime() + 7200 * 1000
		});

		// Update Users
		if (ALLUSERS.indexOf(username) == -1) ALLUSERS.push(username);

		// Post Retweet
		client.post("statuses/retweet/:id", { id: tweetID }, function (err, data, response) {
			if (err) return log(err);
			lastTweet = data.id_str + "";
			log("\"" + tweet.text + "\" by @" + tweet.user.screen_name + " retweeted");
		});
	}
});
bratwurst.on("disconnect", function (disconnectMessage) {
	bratwurst.stop();
	setTimeout(function () {
		bratwurst.start();
	}, 10000);
	log(disconnectMessage);
});
bratwurst.on("warning", function (warning) {
	bratwurst.stop();
	setTimeout(function () {
		bratwurst.start();
	}, 10000);
	log(warning);
});

/**
 * Listen for bratwurst message generation
 */

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
		if (textRender.jobs.length > 0 && !textRender.working) {
			textRender.jobs[0]();
			textRender.jobs.splice(0, 1);
		}
	}
};
textRender.start();

var textBratwurst = client.stream("statuses/filter", { track: "#onabratwurst" });
textBratwurst.on("tweet", function (tweet) {
	var message = tweet.text.toLowerCase(),
		tweetID = tweet.id_str,
		username = tweet.user.screen_name;

	var badWords = message.indexOf("#heyju magst du bratwurst") > -1 || message.indexOf(" hate ") > -1 || message.indexOf(" nazi") > -1 || message.indexOf(" nazis") > -1 || message.indexOf(" fucking") > -1;

	if (username != "Bratwurst_bot" && !badWords && message.indexOf("rt ") == -1) {
		textRender.push(function (callback) {
			textRender.working = true;
			var start = new Date().getTime();
			var data = {
				text: tweet.text.split("\"")[1],
				user: username + "",
				id: tweetID + ""
			};
			log("RENDER JOB: " + data.text + " by " + username);

			var text = data.text;
			var pyString = "" +
				"import bpy\n" +
				"bpy.data.objects[\"Text\"].data.body = \"" + data.text + "\"";

			fs.writeFile(__dirname + "/text.py", pyString, function (err, dataPy) {
				if (err) return console.log(err);

				chart.b3d.renderImage(__dirname + "\\messageBratwurst.blend", __dirname + "/text.py", __dirname + "/text.jpg", function (err) {
					if (err) return console.log(err);
					var pathToText = __dirname + "/text0001.jpg";

					var image = fs.readFileSync(pathToText, { encoding: "base64" });
					var timeTaken = " [" + (new Date().getTime() - start) + "ms]";
					client.post("media/upload", { media_data: image }, function (err, dataMedia, response) {
						image = dataMedia.media_id_string + "";

						var extraUser = "";
						for (var i = 0; i < tweet.entities.user_mentions.length; i++)
							if (tweet.entities.user_mentions[i].screen_name != "Bratwurst_bot") extraUser += "@" + tweet.entities.user_mentions[i].screen_name + " ";

						var params = {
							status: "@" + data.user + " " + extraUser + "\"" + text + "\"",
							media_ids: [image],
							in_reply_to_status_id: data.id
						};
						params.status += timeTaken;
						client.post("statuses/update", params, function (err, dataResponse, response) {
							if (err) return console.log(err);
							log("@" + data.user + " \"" + text + "\" sent");
							textRender.working = false;
						});
					});
				});
			});
		});
	}
});
textBratwurst.on("disconnect", function (disconnectMessage) {
	textBratwurst.stop();
	setTimeout(function () {
		textBratwurst.start();
	}, 10000);
	console.log(disconnectMessage);
});
textBratwurst.on("warning", function (warning) {
	textBratwurst.stop();
	setTimeout(function () {
		textBratwurst.start();
	}, 10000);
	console.log(warning);
});

/**
 * Listen for Follow
 */
var follow = client.stream("user");
follow.on("follow", function (tweet) {
	var params = {
		status: "@" + tweet.source.screen_name + " " + reply.get("follow")
	};
	client.post("statuses/update", params, function (err, data, response) {
		if (err) return log(err);
		log("@" + tweet.source.screen_name + " followed");
	});
});
follow.on("disconnect", function (disconnectMessage) {
	follow.stop();
	setTimeout(function () {
		follow.start();
	}, 10000);
	log(disconnectMessage);
});

/**
 * Update Bio
 */
function updateBio() {
	var text = "Retweeting all things Bratwurst. " + ALLUSERS.length + " users have tweeted about bratwurst so far. @Bratwurst_bot help for help. Bot by @LonelessArt";

	client.post("account/update_profile", {
		description: text
	}, function (err, data, response) {
		if (err) log(err);
	});
}
updateBio();
setInterval(updateBio, 1000 * 60 * 30);

/**
 * Daily Report
 */
var executed = false;
function dailyReport() {
	var time = new Date(),
		string = "";

	if (time.getHours() == 0 && time.getMinutes() == 0 && time.getSeconds() < 2 && !executed) {
		executed = true;

		var rank = [],
			rankName = [],
			rankNumber = [];
		for (var i = 0; i < STATS.length; i++)
			if (!isIgnored(STATS[i].name)) {
				var length = 0;
				for (var arr = 0; arr < STATS[i].array.length; arr++)
					if (STATS[i].array[arr].timestamp > (time.getTime() - 86400000))
						length++;
				if (length > 0) {
					rank.push(length);
					rankName.push(STATS[i].name);
					rankNumber.push(i);
				}
			}

		var name = rankName[rank.indexOf(rank.max())],
			number = rank.max();

		string += "It is once again the end of the day. Top Bratwurst Tweeter of the last 24 hours is @" + name + " with " + number + " ";
		if (number == 1) string += "tweet";
		else string += "tweets";
		string += ". Congratulations!";
		string += " [" + (new Date().getTime() - time) + "ms]";

		client.post("statuses/update", { status: string }, function (err, data, response) {
			log(string);
		});
	} else if (time.getHours() > 0) executed = false;
}
setInterval(dailyReport, 1000);


/**
 * Monthly Report
 */
var executedMonth = false;
function monthlyReport() {
	var time = new Date();

	if (time.getDate() == 1 && time.getHours() == 7 && time.getMinutes() == 0 && time.getSeconds() < 20 && !executed) {
		executedMonth = true;

		var time = new Date();
		chart.charts(function (paths, info) {
			var string = "Bratwurst tweeters were most active " + (info.times > 5 ? info.times > 11 ? info.times > 14 ? info.times > 18 ? info.times > 21 ? "at night" : "in the evening" : "in the afternoon" : "around noon" : "in the morning" : "at night") + ". ";
			string += "Most tweeters came from " + info.global;
			string += " [" + (new Date().getTime() - time.getTime()) + "ms] #BratwurstStats";

			var firstImage = fs.readFileSync(paths.times, { encoding: "base64" });
			client.post("media/upload", { media_data: firstImage }, function (err, data, response) {
				firstImage = data.media_id_string + "";

				var secondImage = fs.readFileSync(paths.global, { encoding: "base64" });
				client.post("media/upload", { media_data: secondImage }, function (err, data, response) {
					secondImage = data.media_id_string + "";

					var thirdImage = fs.readFileSync(paths.source, { encoding: "base64" });
					client.post("media/upload", { media_data: thirdImage }, function (err, data, response) {
						thirdImage = data.media_id_string + "";

						var params = { status: string, media_ids: [firstImage, secondImage, thirdImage] };
						client.post("statuses/update", params, function (err, data, response) {
							log(string, (string.length + 23 <= 140));

							chart.user(function (file, dataf) {
								var userImage = fs.readFileSync(file, { encoding: "base64" });
								client.post("media/upload", { media_data: userImage }, function (err, data, response) {
									userImage = data.media_id_string + "";

									var params = { status: "Top Bratwurst tweeter of the month is @" + dataf.user + " with " + dataf.value + " tweets. Congratulations!!!", media_ids: [userImage] };
									client.post("statuses/update", params, function (err, data, response) {
										log("Top Bratwurst tweeter of the month is @" + dataf.user + " with " + dataf.value + " tweets. Congratulations!!!", ("Top Bratwurst tweeter of the month is @" + data.user + " with " + data.value + " tweets. Congratulations!!!".length + 23 <= 140));
									});
								});
							});
						});
					});
				});
			});
		});
	} else if (time.getHours() > 0) executedMonth = false;
}
setInterval(monthlyReport, 10000);

log("Bratwurstbot booted up");