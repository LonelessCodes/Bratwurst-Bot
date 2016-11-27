const {tweet, updateBio} = require("./../modules/twitter");
const chart = require("./../charts/charts")();
const fs = require("fs");
const {triggerAt} = require("./../modules/utils");

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */
const log = require("./../modules/log");

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

Number.prototype.getDaysOfMonth = function () {
	var a = new Date(this);
	var year = a.getFullYear();
	var month = a.getMonth();
	return new Date(year, month, 0).getDate();
};

/*
 * tweet monthly stats
 */

const t = (new Date().getTime().getDaysOfMonth() - new Date().getDate()) * 1000 * 60 * 60 * 24;

function month() {
	const time = new Date();
	chart.charts(function (paths, info) {
		let string = "Bratwurst tweeters were most active " + (info.times > 5 ? info.times > 11 ? info.times > 14 ? info.times > 18 ? info.times > 21 ? "at night" : "in the evening" : "in the afternoon" : "around noon" : "in the morning" : "at night") + ". ";
		string += "Most tweeters came from " + info.global;
		string += " [" + (new Date().getTime() - time.getTime()) + "ms] #BratwurstStats";

		tweet(string, {
			media: [
				paths.times,
				paths.global,
				paths.source
			]
		}, err => {
			if (err) return log(err);
			log(string, (string.length + 23 <= 140));

			chart.user((file, dataf) => {
				tweet("Top Bratwurst tweeter of the month is @" + dataf.user + " with " + dataf.value + " tweets. Congratulations!!!", {
					media: [file]
				}, (err, data) => {
					setTimeout(month, new Date().getTime().getDaysOfMonth() * 1000 * 60 * 60 * 24);
					if (err) return log(err);
					log("Top Bratwurst tweeter of the month is @" + dataf.user + " with " + dataf.value + " tweets. Congratulations!!!", ("Top Bratwurst tweeter of the month is @" + data.user + " with " + data.value + " tweets. Congratulations!!!".length + 23 <= 140));
				});
			});
		});
	});
}

setTimeout(month, t);

/**
 * Update Bio
 */
function bio() {
	var text = "Retweeting all things Bratwurst. " + JSON.parse(fs.readFileSync(__dirname + "\\..\\database\\ALLUSERS.txt")).length + " users have tweeted about bratwurst so far. \"@Bratwurst_bot help\" for help. Bot by @LonelessArt. Current version: " + require("./../package.json").version;

	updateBio({ description: text }, function (err) {
		if (err) log(err);
	});
}
bio();
setInterval(bio, 1000 * 60 * 30);

/**
 * Daily Report
 */
function dailyReport() {
	const time = new Date();
	const STATS = JSON.parse(fs.readFileSync(__dirname + "\\..\\database\\STATS.txt"));
	const IGNORE = JSON.parse(fs.readFileSync(__dirname + "\\..\\database\\IGNORE.txt"));
	var rank = [],
		rankName = [],
		rankNumber = [];
	STATS.forEach((stat, i) => {
		if (!IGNORE.includes(stat.name)) {
			var length = 0;
			for (var arr = 0; arr < stat.array.length; arr++)
				if (stat.array[arr].timestamp > (time.getTime() - 86400000))
					length++;
			if (length > 0) {
				rank.push(length);
				rankName.push(stat.name);
				rankNumber.push(i);
			}
		}
	});

	var name = rankName[rank.indexOf(rank.max())],
		number = rank.max();

	if (!name) return;

	let string = "It is once again the end of the day. Top Bratwurst Tweeter of the last 24 hours is @" + name + " with " + number + " ";
	if (number == 1) string += "tweet";
	else string += "tweets";
	string += ". Congratulations!";
	string += " [" + (new Date().getTime() - time) + "ms]";

	tweet(string, function () {
		log(string);
		triggerAt(new Date().setHours(0), dailyReport);
	});
}
triggerAt(new Date().setHours(0), dailyReport);

log("Stats worker is listening");