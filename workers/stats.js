const { tweet, updateBio, client } = require("../modules/twitter");
const stats = require("../modules/stats/stats");
const database = require("../modules/database");
const utils = require("../modules/utils");
const cron = require("cron");

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */
const log = require("../modules/log");

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

Date.prototype.getDaysOfMonth = function () {
	var year = this.getFullYear();
	var m = this.getMonth();
	return new Date(year, m + 1, 0).getDate();
};

/*
 * tweet monthly stats
 */
const month = () => {
	const time = new Date();
	stats.charts((bufs, info) => {
		let string = "Bratwurst tweeters were most active " + (info.times > 5 ? info.times > 11 ? info.times > 14 ? info.times > 18 ? info.times > 21 ? "at night" : "in the evening" : "in the afternoon" : "around noon" : "in the morning" : "at night") + ". ";
		string += "Most tweeters came from " + info.global.id + " (" + info.global.value + ")"; // seems like until now I forgot it's returning a object
		string += " [" + utils.time(time.getTime(), Date.now()) + "] #BratwurstStats";

		tweet(string, {
			media: [
				bufs.times,
				bufs.global,
				bufs.source
			]
		}, err => {
			if (err) return log(err);
			log(string, (string.length + 23 <= 140));
		});
	}, ({ buf, user, value }) => {
		const string = "Top Bratwurst tweeter of the month is @" + user + " with " + value + " tweets. Congratulations!!!";
		tweet(string, {
			media: [buf]
		}, err => {
			if (err) return log(err);
			log(string, string.length + 23 <= 140 ? "shortened" : "");
		});
	});
};
// cron new JOB
new cron.CronJob("0 0 1 * *", month, null, true, "Europe/Berlin");

/**
 * Daily Report
 */

function dailyReport() {
	const time = new Date();

	Promise.all([
		database.ref("tweets").orderByChild("timestamp").startAt(Date.now() - 1000 * 3600 * 24).once("value"),
		database.ref("ignored").once("value")
	]).then(([tweetsSnap, ignoredSnap]) => {
		return new Promise((resolve, reject) => {
			if (!tweetsSnap.exists()) return reject("No tweets were found.");
			tweetsSnap = tweetsSnap.val();

			// new tweet objects will save the User ID instead of the screen_name, to
			// to go extra sure, but I still have to support screen_name-only entries
			ignoredSnap = ignoredSnap.val();
			const ignored = [];
			Object.keys(ignoredSnap).forEach(key => {
				ignored.push(key);
			});
			const tweets = [];
			Object.keys(tweetsSnap).forEach(key => {
				const snap = tweetsSnap[key];
				tweets.push(snap);
			});

			let users = {};
			tweets.filter(tweet => {
				if (!ignored.includes(tweet.user.id))
					return true;
				return false;
			}).forEach(tweet => {
				const index = tweet.user.id || tweet.user.screen_name;
				if (users[index]) users[index].length++;
				else users[index] = {
					length: 1,
					id: tweet.user.id,
					name: tweet.user.screen_name
				};
			});
			users = Object.keys(users).map(key => {
				return {
					length: users[key].length,
					id: users[key].id,
					name: users[key].name
				};
			}).sort((a, b) => {
				return b.length - a.length;
			});

			const number = users[0].length;
			const id = users[0].id;

			if (!users[0].name) return reject("No best user could be found. Array length 0");

			client.get("users/show", {
				user_id: id
			}, (err, data) => {
				if (err) return reject("Couldn't load user ID");
				resolve({
					name: data.screen_name,
					number: number
				});
			});
		});
	}).then(({ name, number }) => {
		// tweet data
		let string =
			`It is once again the end of the day. Top Bratwurst Tweeter of the last 24 hours is @${name} with ${number} ${number === 1 ? "tweet" : "tweets"} 🎉🎆. Congratulations!`;
		string += " [" + utils.time(time.getTime(), Date.now()) + "]";

		tweet(string, function () {
			log(string);
		});
	}).catch(err => {
		log("Daily Report couldn't be created. Reason", err);
	});
}
// cron new JOB
new cron.CronJob("0 0 * * *", dailyReport, null, true, "Europe/Berlin");

/**
 * Update Bio
 */
function bio() {
	database.ref("users").once("value").then(snapshot => {
		const text = `About all things Bratwurst. ${snapshot.numChildren()} users have tweeted about bratwurst. "@Bratwurst_bot help" for help. Bot by @LonelessArt. v${require("./../package.json").version}`;

		updateBio({ description: text }, err => {
			if (err) log(err);
		});
	});
}
bio();
setInterval(bio, 1000 * 60 * 30);

log("Stats worker is listening");