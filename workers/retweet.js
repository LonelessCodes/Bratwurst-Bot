const {retweet, stream, onfollowed, tweet} = require("./../modules/twitter");
const database = require("./../modules/database");
const log = require("./../modules/log");
const {compare} = require("./../modules/utils");

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

const timeouts = {};

let lastTweet;
stream("bratwurst", (tweetObj, user) => {
	if (user.screen_name === "Bratwurst_bot") return;
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
	
	// check for similar tweets in the last time to prevent spamming
	let compareString = message;
	tweetObj.entities.urls.forEach(url => compareString = compareString.replace(url, ""));
	tweetObj.entities.hashtags.forEach(url => compareString = compareString.replace(url, ""));
	tweetObj.entities.user_mentions.forEach(url => compareString = compareString.replace(url, ""));
	compareString = compareString.replace(/ /g, "");

	let send = true;
	Object.keys(timeouts).forEach(key => {
		if (compare(key, compareString) > 0.9)
			send = false;
	});
	if (!send) return;

	clearTimeout(timeouts[compareString]);
	timeouts[compareString] = setTimeout(() => {
		delete timeouts[compareString];
	}, 1000 * 3600 * 2);

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