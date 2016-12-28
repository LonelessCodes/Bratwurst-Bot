const {tweet, updateBio, client} = require("./../modules/twitter");
const chart = require("./../charts/charts");
const {triggerAt} = require("./../modules/utils");
const database = require("./../modules/database");

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

let nextMonth = new Date(new Date().getTime() + 1000 * 3600 * 24 * new Date().getTime().getDaysOfMonth());
nextMonth.setDate(0);
nextMonth.setHours(0);
nextMonth.setMinutes(0);
nextMonth.setSeconds(0);
nextMonth.setMilliseconds(0);
let t = nextMonth.getTime() - new Date().getTime();

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
		});
	}, ({path, user, value}) => {
		tweet("Top Bratwurst tweeter of the month is @" + user + " with " + value + " tweets. Congratulations!!!", {
			media: [path]
		}, err => {
			t = t + 1000 * 3600 * 24 * new Date().getTime().getDaysOfMonth();
			setTimeout(month, t);
			console.log(new Date(t));
			if (err) return log(err);
			log("Top Bratwurst tweeter of the month is @" + user + " with " + value + " tweets. Congratulations!!!", "Top Bratwurst tweeter of the month is @" + user + " with " + value + " tweets. Congratulations!!!".length + 23 <= 140 ? "shortened" : "");
		});
	});
}

setTimeout(month, t);
console.log(new Date(t), nextMonth);

/**
 * Update Bio
 */
function bio() {
	database.ref("users").once("value", snapshot => {
		const text = `Retweeting all things Bratwurst. ${snapshot.numChildren()} users have tweeted about bratwurst so far. "@Bratwurst_bot help" for help. Bot by @LonelessArt. v${require("./../package.json").version}`;

		updateBio({ description: text }, err => {
			if (err) log(err);
		});
	});
}
bio();
setInterval(bio, 1000 * 60 * 30);

/**
 * Daily Report
 */
function dailyReport() {
	const time = new Date();
	
	new Promise((resolve, reject) => {
		// fetch data
		const tweets = database.ref("tweets");
		const ignored = database.ref("ignored");

		tweets.orderByChild("timestamp").startAt(Date.now() - 1000 * 3600 * 24).once("value", tweets => {
			ignored.once("value", ignored => {
				// new tweet objects will save the User ID instead of the screen_name, to
				// to go extra sure, but I still have to support screen_name-only entries
				ignored = Object.keys(ignored.val()).map(key => key);
				tweets = tweets.val();
				tweets = Object.keys(tweets).map(key => tweets[key]);

				let users = {};
				tweets.filter(tweet => {
					if (!ignored.id.includes(tweet.user.id) || !ignored.name.includes(tweet.user.screen_name))
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

				if (!users[0].name) return reject();

				client.get("users/show", {
					user_id: id
				}, (err, data) => {
					if (err) return reject();
					resolve({
						name: data.screen_name,
						number: number
					});
				});
			});
		});
	}).then(({name, number}) => {
		// tweet data
		let string =
			`It is once again the end of the day. Top Bratwurst Tweeter of the last 24 hours is @${name} with ${number} ${number === 1 ? "tweet" : "tweets"}. Congratulations!`;
		string += " [" + (new Date().getTime() - time.getTime()) + "ms]";

		tweet(string, function () {
			log(string);
			triggerAt(new Date().setHours(0), dailyReport);
		});
	}).catch(() => {
		log("Daily Report couldn't be created");
	});
}
triggerAt(new Date().setHours(0), dailyReport);

log("Stats worker is listening");