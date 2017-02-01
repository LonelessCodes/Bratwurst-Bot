const {retweet, stream, onfollowed, tweet} = require("./../modules/twitter");
const database = require("./../modules/database");
const log = require("./../modules/log");

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

/*
 * Database Objects
 */
const {User, Tweet} = require("./../modules/database_objects");

const users = database.ref("users");
const tweets = database.ref("tweets");

// Retweet

/**
 * Built-in spam filter for 3.3 release
 */

let lastTweet;
stream("bratwurst", (tweetObj, user) => {
	const message = tweetObj.text.toLowerCase();
	const tweetID = tweetObj.id_str;

	const badWords =
		message.indexOf("magst du bratwurst") > -1 ||
		message.indexOf("disgusting") > -1 ||
		message.indexOf(" hate ") > -1 ||
		message.indexOf(" nazi") > -1 ||
		message.indexOf(" fucking") > -1;

	if (lastTweet === tweetID ||
		message.indexOf("bratwurst") === -1 ||
		message.indexOf("rt @") === 0 ||
		message.indexOf("@bratwurst_bot") > -1 ||
		badWords) return;

	database.isIgnored(user.id_str).then(() => {
		return new Promise((resolve, reject) => {
			// Post Retweet
			retweet(tweetID, (err, data) => {
				if (err) {
					reject(err);
					return;
				}
				lastTweet = data.id_str;
				log(`"${tweetObj.text}" by @${user.screen_name} retweeted`);
				resolve();
			});
		});
	}).then(() => {
		users.child(user.id_str).set(new User(user), () => { });
		tweets.child(tweetID).set(new Tweet(tweetObj), () => { });
	}).catch(err => {
		log(err || `"${tweetObj.text}" by @${user.screen_name} not retweeted because ignored`);
	});
}, true);

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