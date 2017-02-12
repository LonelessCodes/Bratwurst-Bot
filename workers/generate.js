const {tweet} = require("./../modules/twitter");
const database = require("./../modules/database");
const Markov = require("./../lib/markov.js");

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */
const log = require("./../modules/log");

const hashtag = " #bot";

const markov = {};
markov["en"] = new Markov(6, 140 - hashtag.length);
markov["de"] = new Markov(6, 140 - hashtag.length);

const tweets = database.ref("tweets");
tweets.once("value", snap => {
	snap.forEach(add);
	tweetAt();
});
tweets.on("child_added", add);

function add(tweet) {
	const text = tweet.child("text").val();
	if (!tweet.child("text").exists() ||
		text.indexOf("RT ") === 0)
		return;

	const lang = tweet.child("lang").val();
	if (lang === "en" || lang === "de") {
		markov[lang].feed(text);
	}
}

function tweeter() {
	const total = markov["en"].count() + markov["de"].count();
	const result = Math.random() * total <= markov["de"].count() ?
		markov["de"].generate() : markov["en"].generate();

	if (result.length >= 10) {
		log("Random sentence: " + result);
		tweet(result + hashtag, () => tweetAt());
	} else {
		tweeter();
	}
}
function tweetAt() {
	//                       10 Minutes
	const interval = 60000 * 30;
	const d = Date.now();
	const t = Math.ceil(d / interval);
	setTimeout(tweeter, t * interval - d);
}

log("Markov Chain worker is listening");