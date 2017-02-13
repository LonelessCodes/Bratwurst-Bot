// const {tweet} = require("./../modules/twitter");
const database = require("./modules/database");
const Markov = require("./lib/markov-word.js");

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */

const hashtag = " #bot";

const markov = {};
markov["en"] = new Markov(2, 140 - hashtag.length);
markov["de"] = new Markov(2, 140 - hashtag.length);

const tweets = database.ref("tweets");
tweets.once("value", snap => {
	snap.forEach(add);
	tweeter();
});

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
		console.log(result + hashtag);
		setTimeout(tweeter, 500);
	} else {
		tweeter();
	}
}