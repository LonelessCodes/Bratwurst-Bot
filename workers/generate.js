const {tweet} = require("./../modules/twitter");
const database = require("./../modules/database");
const MarkovChar = require("./../lib/markov.js");
const MarkovWord = require("./../lib/markov-word.js");

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */
const log = require("./../modules/log");

const hashtag = " #bot";

// character level Markov chain
const markovChar = {};
markovChar["en"] = new MarkovChar(6, 140 - hashtag.length);
markovChar["de"] = new MarkovChar(6, 140 - hashtag.length);

// word level markov chain
const markovWord = {};
markovWord["en"] = new MarkovWord(2, 140 - hashtag.length);
markovWord["de"] = new MarkovWord(2, 140 - hashtag.length);

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

	if (result.length >= 15) {
		log("Random sentence: " + result, random ? "Markov Word" : "Markov Character");
		tweet(result + hashtag, () => tweetAt());
	} else {
		tweeter();
	}
}
function tweetAt() {
	//                       30 Minutes
	const interval = 60000 * 30;
	const d = Date.now();
	const t = Math.ceil(d / interval);
	setTimeout(tweeter, t * interval - d);
}

log("Markov Chain worker is listening");