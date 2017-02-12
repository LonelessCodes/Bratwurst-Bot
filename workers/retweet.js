const {retweet, stream, botName} = require("./../modules/twitter");
const database = require("./../modules/database");
const log = require("./../modules/log");
const utils = require("./../modules/utils");

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
	if (user.screen_name === botName ||
		(tweetObj.possibly_sensitive != null ? tweetObj.possibly_sensitive : false)) return;
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
		message.indexOf("@" + botName.toLowerCase()) > -1 ||
		/^rt/.test(message) ||
		badWords) return;
	
	// check for similar tweets in the last time to prevent spamming
	const compareString = utils.cleanText(tweetObj).toLowerCase().replace(/ /g, "").replace(/[^a-zA-Z0-9 ]/g, "");

	let send = true;
	Object.keys(timeouts).forEach(key => {
		if (utils.compare(key, compareString) > 0.9)
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
				if (err) return reject(err);

				lastTweet = data.id_str;
				log(`"${tweetObj.text}" by @${user.screen_name} retweeted`);
				resolve();
			});
		});
	}).then(() => {
		users.child(user.id_str).set(new User(user), () => { });
		tweets.child(tweetID).set(new Tweet(tweetObj), () => { });
	}).catch(err => {
		log(err || `"${tweetObj.text}" by @${user.screen_name} not retweeted`);
	});
}, 60);

log("Retweet worker is listening");