const {retweet, stream, botName} = require("../modules/twitter");
const database = require("../modules/database");
const log = require("../modules/log");
const SpamFilter = require("../modules/spam_filter");

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

/*
 * Database Objects
 */
const {User, Tweet} = require("../modules/database_objects");

const users = database.ref("users");
const tweets = database.ref("tweets");

// Retweet
const spamFilter = new SpamFilter();

// don't know if this is still needed to prevent feedback loops
// on normal streams, but I'll just leave it here
let lastTweet;
// forgot to track the plural as well
stream(["bratwurst", "bratwürste", "bratwursts"], (tweetObj, user) => {
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
		(message.indexOf("bratwurst") === -1 && message.indexOf("bratwürste") === -1) ||
		message.indexOf("@" + botName.toLowerCase()) > -1 ||
		/^rt/.test(message) ||
		badWords) return;

	Promise.all([
		database.isIgnored(user.id_str),
		// check for similar tweets in the last time to prevent spamming
		spamFilter.check(tweetObj)
	]).then(() => {
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