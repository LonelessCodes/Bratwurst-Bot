const {retweet, stream, onfollowed, tweet} = require("./../modules/twitter");
const database = require("./../modules/database");
const fs = require("fs");

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

const log = require("./../modules/log");

/**
 * Check Functions
 */
function isIgnored(name) {
	return database.ignored(name);
}

var lastTweet;
var bratwurst = stream("bratwurst", tweet => {
	var message = tweet.text.toLowerCase(),
		tweetID = tweet.id_str,
		username = tweet.user.screen_name;

	var badWords =
		message.indexOf("#heyju magst du bratwurst") > -1 ||
		message.indexOf(" hate ") > -1 ||
		message.indexOf(" nazi") > -1 ||
		message.indexOf(" nazis") > -1 ||
		message.indexOf(" fucking") > -1;

	if (!isIgnored(username)
		&& lastTweet != tweetID
		&& message.indexOf("@bratwurst_bot") < 0
		&& message.indexOf("rt @") != 0
		&& message.indexOf("bratwurst") > -1
		&& !badWords) {
		// Update Stats
		var exists = database.userExists(username);
		if (!exists) {
			exists = database.push("stats", {
				name: username,
				array: []
			});
			database.push("users", username);
		}
		database
			.update("stats", exists, {
				image: tweet.user.profile_image_url
			})
			.push("array", {
				tweetID: tweetID,
				source: tweet.source,
				place: tweet.place ? tweet.place.country_code : null,
				offset: tweet.user.utc_offset ? tweet.user.utc_offset : null,
				lang: tweet.lang ? tweet.lang : null,
				hashtags: tweet.entities.hashtags,
				timestamp: new Date(tweet.created_at).getTime() + 7200 * 1000
			});

		// Post Retweet
		retweet(tweetID, function (err, data) {
			if (err) return log(err);
			lastTweet = data.id_str + "";
			log("\"" + tweet.text + "\" by @" + tweet.user.screen_name + " retweeted");
		});
	}
});
bratwurst.on("disconnect", function (disconnectMessage) {
	log(disconnectMessage);
	bratwurst.stop();
	setTimeout(function () {
		bratwurst.start();
	}, 10000);
});
bratwurst.on("warning", function (warning) {
	log(warning);
	bratwurst.stop();
	setTimeout(function () {
		bratwurst.start();
	}, 10000);
});

/**
 * Follows
 */
const followReply = {
	replies: {
		follow: [
			"Thanks for the follow! Following gives you special Bratwurst priorities. \"@Bratwurst_bot help\" for more bot information."
		]
	},
	get: function (type) {
		return followReply.replies[type][Math.floor(Math.random() * followReply.replies[type].length)];
	}
};

const follow = onfollowed(function (tweetObject) {
	const status = "@" + tweetObject.source.screen_name + " " + followReply.get("follow");
	tweet(status, err => {
		if (err) return log(err);
	});
	log("@" + tweetObject.source.screen_name + " followed");
});
follow.on("warning", function (warning) {
	log(warning);
	follow.stop();
	setTimeout(function () {
		follow.start();
	}, 10000);
});
follow.on("disconnect", function (disconnectMessage) {
	log(disconnectMessage);
	follow.stop();
	setTimeout(function () {
		follow.start();
	}, 10000);
});


/** 
 * mention
 */

/**
 * Answer to mentions
 */
var reply = {
	replies: {
		invented: [
			"Die Bratwurst wurde in 1404 zum ersten mal erwäht.",
			"1404 wurde das Phänomen \"Bratwrust\" zum ersten mal erwähnt."
		],
		whyIsCalled: [
			"Das alte Wort \"Brät\", was \"schieres\" bedeutet (fein verarbeitetes Fleisch ohne Knochen & Fett), verleiht ihr den Namen."
		],
		random: [
			"Das alte Wort \"Brät\", was \"schieres\" bedeutet (fein verarbeitetes Fleisch ohne Knochen & Fett), verleiht ihr den Namen.",
			"Die Bratwurst wurde in 1404 zum ersten mal erwäht.",
			"Sie ist das beliebteste Grillprodukt für die Deutschen. Die Bockwurst mit weiten Abstand auf Platz 2.",
			"Ein Bundesbürger isst im Durchschnitt fast 84 Bratwürste pro Jahr, dass sind 1,6 pro Woche.",
			"Die Deutschen bezeichnen sich ja gerne mal als Grillmeister, im Durchschnitt grillt der Deutsche aber nur 6-mal im Jahr.",
			"Es gibt rund 1.500 verschiedene Bratwurstsorten. Darunter auch welche mit Alkohol, z.B. die Jack Daniel's Currywurst.",
			"Bratwürste gibt es in roher und gebrühter Form, wobei die gebrühte Form verbreiteter ist."
		],
		follow: [
			"Thanks for the follow! Following gives you special Bratwurst priorities. \"@Bratwurst_bot help\" for more bot information."
		]
	},
	get: function (type) {
		return reply.replies[type][Math.floor(Math.random() * reply.replies[type].length)];
	}
};

/**
 * Listen for conversations
 */
var atStream = stream("@Bratwurst_bot", function (tweet) {
	var start = new Date().getTime(),
		message = tweet.text.toLowerCase(),
		tweetID = tweet.id_str,
		username = tweet.user.screen_name,
		ignored = database.ignored(username),
		test,
		params = {
			in_reply_to_status_id: tweetID,
			status: "@" + username + " "
		},
		earlier = false;

	if (username != "Bratwurst_bot" && message.indexOf("rt @") < 0) {

		for (var i = 0; i < tweet.entities.user_mentions.length; i++)
			if (tweet.entities.user_mentions[i].screen_name != "Bratwurst_bot") params.status += "@" + tweet.entities.user_mentions[i].screen_name + " ";

		test = params.status + "";

		log(`MENTION: "${tweet.text}" by ${tweet.user.screen_name}`);

		if (message.indexOf("@bratwurst_bot") == 0) {
			if (message.indexOf("ignore me") == 15) {

				// Ignore user
				database.push("ignore", username);
				log("@" + username + " ignored");
				params.status += "We're sorry it had to come this far";

			} else if (message.indexOf("notice me") == 15 && ignored) {

				// Notice user
				if (database.del("ignore", username)) {
					log("@" + username + " noticed");
					params.status += "Yay!";
				}

			} else if (message.indexOf("help") == 15) {

				// Return Help
				params.status += "There you go";
				params.status += " [" + (new Date().getTime() - start) + "ms]";
				earlier = true;
				tweet(params.status, {
					media: ["../help.jpg"],
					inReplyTo: params.in_reply_to_status_id
				}, err => {
					if (err) return log("ERROR: ", err);

					log("@" + username + " requested help");
				});

			} else if (message.indexOf("?") > -1) {

				/**
				 * Questions
				 */
				if (message.indexOf("wurde die") > -1 && message.indexOf("erfunden") > -1) {

					// Wann wurde die Bratwurst erfunden
					params.status += reply.get("invented");

				} else if (message.indexOf("wieso") > -1 && message.indexOf("heißt") > -1 && message.indexOf("bratwurst") > -1) {

					// Wieso heißt die Bratwurst Bratwurst
					params.status += reply.get("whyIsCalled");

				} else if (message.indexOf("senf oder") > -1 && message.indexOf("ketchup") > -1) {

					// Senf oder Ketchup
					params.status += "Senf!";

				} else if (message.indexOf("wie") > -1 && (message.indexOf("braten") > -1 || message.indexOf("brät") > -1 || message.indexOf("gebraten") > -1 || message.indexOf("zubereiten") > -1) && message.indexOf("bratwurst") > -1) {

					// Wie wird eine bratwurst gebraten
					params.status += "Mancher hat Angst vor geplatzter Wurst. Immer vorsichtig ganz kleine Rillen einkerben.";

				} else {

					// Default
					params.status += " Auch meine Weisheit muss irgendwo ein Ende haben.";

				}

				log("ANSWER:", params.status);

			}
		}

		if (message.indexOf("@bratwurst_bot random image") > -1) {

			// Random Image
			fs.readDir("bratwursts", (err, images) => {
				const index = Math.floor(Math.random() * images.length);

				params.status += "Have a bite";
				params.status += " [" + (new Date().getTime() - start) + "ms]";
				earlier = true;
				tweet(params.status, {
					media: ["bratwursts/" + images[index]],
					inReplyTo: params.in_reply_to_status_id
				}, err => {
					if (err) return log("ERROR: ", err);

					log("@" + username + "requested an image. Given image /bratwursts/" + images[index]);
				});
			});

		} else if (message.indexOf("@bratwurst_bot stats") > -1) {

			// Stats
			const exists = database.get("stats", username, "name");

			var rank = [],
				rankAt;
			for (let i = 0; i < database.length("stats"); i++) rank.push(database.byIndex("stats", i).array.length);
			rank.sort();
			rank.reverse();

			if (exists) {
				rankAt = rank.indexOf(database.byIndex("stats", exists).array.length) + 1;
				params.status += "In der Uptime von v2.0+ hast du " + database.byIndex("stats", exists).array.length + " mal über Bratwurst getwittert.\n";
				params.status += "Das macht dich zu Platz " + rankAt + " Weltweit";
			} else {
				params.status += "Du hast noch nie über Bratwurst geredet. Ich empfehle es zu versuchen.";
			}

			log("STATS:", params.status);

		} else if (message.indexOf("@bratwurst_bot random fact") > -1) {

			// Random fact
			params.status += reply.get("random");
			log("RANDOM FACT:", params.status);

		}

		// Send Tweet
		if (params.status != test && !earlier) {
			params.status += " [" + (new Date().getTime() - start) + "ms]";
			tweet(params.status, {
				inReplyTo: params.in_reply_to_status_id
			}, err => {
				if (err) return log("ERROR: ", err);
			});
		}
	}
});
atStream.on("disconnect", function (disconnectMessage) {
	atStream.stop();
	setTimeout(function () {
		atStream.start();
	}, 10000);
	log(disconnectMessage);
});
atStream.on("warning", function (warning) {
	atStream.stop();
	setTimeout(function () {
		atStream.start();
	}, 10000);
	log(warning);
});