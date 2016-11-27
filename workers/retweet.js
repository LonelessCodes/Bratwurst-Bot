const {retweet, stream, onfollowed, tweet} = require("./../modules/twitter");
const database = require("./../modules/database");
const log = require("./../modules/log");

const now = time => {
	if (time) return new Date(time).getTime();
	else return new Date().getTime();
};

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

/*
 * Check Functions
 */

let lastTweet;
const bratwurst = stream("bratwurst", tweetObj => {
	const message = tweetObj.text.toLowerCase();
	const tweetID = tweetObj.id_str;
	const username = tweetObj.user.screen_name;

	const badWords =
		message.indexOf("#heyju magst du bratwurst") > -1 ||
		message.indexOf(" hate ") > -1 ||
		message.indexOf(" nazi") > -1 ||
		message.indexOf(" nazis") > -1 ||
		message.indexOf(" fucking") > -1;	

	if (database.ignored(username)
		|| lastTweet === tweetID
		|| message.indexOf("bratwurst") === -1
		|| message.indexOf("rt @") === 0
		|| message.indexOf("@bratwurst_bot") > -1
		|| badWords) return;

	// Update Stats
	let exists = database.userExists(username);
	if (!exists) {
		exists = database.push("stats", {
			name: username,
			array: []
		});
		database.push("users", username);
	}
	database
		.update("stats", exists, {
			image: tweetObj.user.profile_image_url
		})
		.push("array", {
			tweetID: tweetID,
			source: tweetObj.source,
			place: tweetObj.place ? tweetObj.place.country_code : null,
			offset: tweetObj.user.utc_offset || null,
			lang: tweetObj.lang || null,
			hashtags: tweetObj.entities.hashtags,
			timestamp: now(tweetObj.created_at) + 7200 * 1000
		});

	// Post Retweet
	retweet(tweetID, function (err, data) {
		if (err) return log(err);
		lastTweet = data.id_str + "";
		log(`"${tweetObj.text}" by @${tweetObj.user.screen_name} retweeted`);
	});
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

/*
 * Follows
 */
const followReply = {
	replies: {
		follow: [
			// "Thanks for the follow! Following gives you special Bratwurst priorities. \"@Bratwurst_bot help\" for more bot information.",
			"Thanks for the follow! \"@Bratwurst_bot help\" for more bot information."
		]
	},
	get(type) {
		return followReply.replies[type][Math.floor(Math.random() * followReply.replies[type].length)];
	}
};

const follow = onfollowed(function (tweetObj) {
	const status = "@" + tweetObj.source.screen_name + " " + followReply.get("follow");
	tweet(status, err => {
		if (err) return log(err);
	});
	log("@" + tweetObj.source.screen_name + " followed");
});
follow.on("warning", function (warning) {
	log(warning);
	follow.stop();
	setTimeout(() => follow.start(), 10000);
});
follow.on("disconnect", function (disconnectMessage) {
	log(disconnectMessage);
	follow.stop();
	setTimeout(() => follow.start(), 10000);
});

log("Retweet worker is listening");