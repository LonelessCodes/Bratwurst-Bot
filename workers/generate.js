const {tweet} = require("../modules/twitter");
const database = require("../modules/database");
const MarkovChar = require("../lib/markov.js");
const MarkovWord = require("../lib/markov-word.js");
const cron = require("cron");

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */
const log = require("../modules/log");

const hashtag = " #bot";

// character level Markov chain
// upped to 7-grams
const markovChar = {};
markovChar["en"] = new MarkovChar(7, 140 - hashtag.length - 1);
markovChar["de"] = new MarkovChar(7, 140 - hashtag.length - 1);

// word level markov chain
const markovWord = {};
markovWord["en"] = new MarkovWord(2, 140 - hashtag.length - 1);
markovWord["de"] = new MarkovWord(2, 140 - hashtag.length - 1);

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
		markovChar[lang].feed(text);
		markovWord[lang].feed(text);
	}
}

function tweeter() {
	const random = Math.floor(Math.random() * 2);
	const total = markovWord["en"].count() + markovWord["de"].count();
	
	let result;
	if (random) {
		result = Math.random() * total <= markovWord["de"].count() ?
			markovWord["de"].generate() : markovWord["en"].generate();
	} else {
		result = Math.random() * total <= markovChar["de"].count() ?
			markovChar["de"].generate() : markovChar["en"].generate();
	}

	if (result.length >= 15 && new RegExp("bratwurst", "gi").test(result)) {
		log("Random sentence: " + result, random ? "Markov Word" : "Markov Character");
		tweet(result + hashtag);
	} else {
		tweeter();
	}
}
function tweetAt() {
	new cron.CronJob("00 00 * * * 1-5", tweeter, null, true, "Europe/Berlin");
}

log("Markov Chain worker is listening");
