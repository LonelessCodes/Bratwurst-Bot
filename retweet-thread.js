var client = require("./twitter");
var database = require("./database");

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

function log(message) {
	process.send({
		log: true,
		data: message
	});
}

/**
 * Check Functions
 */
function isIgnored(name) {
	return database.ignored(name);
}

var lastTweet;
var bratwurst = client.stream("bratwurst", function (tweet) {
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
		client.retweet(tweetID, function (err, data) {
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
 * Follows
 */
var reply = {
	replies: {
		follow: [
			"Thanks for the follow! Following gives you special Bratwurst priorities. \"@Bratwurst_bot help\" for more bot information."
		]
	},
	get: function (type) {
		return reply.replies[type][Math.floor(Math.random() * reply.replies[type].length)];
	}
};

var follow = client.followed(function (tweet) {
	var status = "@" + tweet.source.screen_name + " " + reply.get("follow");
	client.tweet(status, function (err) {
		if (err) return log(err);
		log("@" + tweet.source.screen_name + " followed");
	});
});
follow.on("warning", function (warning) {
	follow.stop();
	setTimeout(function () {
		follow.start();
	}, 10000);
	log(warning);
});
follow.on("disconnect", function (disconnectMessage) {
	follow.stop();
	setTimeout(function () {
		follow.start();
	}, 10000);
	log(disconnectMessage);
});