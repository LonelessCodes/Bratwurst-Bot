const {tweet, updateBio, client} = require("./../modules/twitter");
const stats = require("./../modules/stats/stats");
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

Date.prototype.getDaysOfMonth = function () {
	var year = this.getFullYear();
	var m = this.getMonth();
	return new Date(year, m + 1, 0).getDate();
};

/*
 * tweet monthly stats
 */

// const nextMonth = () => {
// 	let d = new Date();
// 	d.setDate(1);
// 	d.setHours(0);
// 	d.setMinutes(0);
// 	d.setSeconds(0);
// 	d.setMilliseconds(0);
// 	d = new Date(d.getTime() + d.getDaysOfMonth() * 24 * 3600 * 1000);
// 	console.log(d.getTime() - Date.now());
// 	return (d.getTime() - Date.now());
// };
// const month = () => {
// 	const time = new Date();
// 	stats.charts(function (paths, info) {
// 		let string = "Bratwurst tweeters were most active " + (info.times > 5 ? info.times > 11 ? info.times > 14 ? info.times > 18 ? info.times > 21 ? "at night" : "in the evening" : "in the afternoon" : "around noon" : "in the morning" : "at night") + ". ";
// 		string += "Most tweeters came from " + info.global;
// 		string += " [" + (Date.now() - time.getTime()) + "ms] #BratwurstStats";

// 		tweet(string, {
// 			media: [
// 				paths.times,
// 				paths.global,
// 				paths.source
// 			]
// 		}, err => {
// 			if (err) return log(err);
// 			log(string, (string.length + 23 <= 140));
// 		});
// 	}, ({path, user, value}) => {
// 		tweet("Top Bratwurst tweeter of the month is @" + user + " with " + value + " tweets. Congratulations!!!", {
// 			media: [path]
// 		}, err => {
// 			setTimeout(() => month(), nextMonth());
// 			if (err) return log(err);
// 			log("Top Bratwurst tweeter of the month is @" + user + " with " + value + " tweets. Congratulations!!!", "Top Bratwurst tweeter of the month is @" + user + " with " + value + " tweets. Congratulations!!!".length + 23 <= 140 ? "shortened" : "");
// 		});
// 	});
// }
// setTimeout(() => month(), nextMonth());

/**
 * Daily Report
 */
const nextDay = () => {
	const d = new Date();
	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);
	return d.getTime() + 24 * 3600 * 1000 - Date.now();
};
function dailyReport() {
	const time = new Date();

	new Promise((resolve, reject) => {
		// fetch data
		const tweets = database.ref("tweets");
		const ignored = database.ref("ignored");

		tweets.orderByChild("timestamp").startAt(Date.now() - 1000 * 3600 * 24).once("value", tweets => {
			tweets = tweets.val();
			if (!tweets) return reject();

			ignored.once("value", ignored => {
				// new tweet objects will save the User ID instead of the screen_name, to
				// to go extra sure, but I still have to support screen_name-only entries
				ignored = Object.keys(ignored.val()).map(key => key);
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
		string += " [" + (Date.now() - time.getTime()) + "ms]";

		tweet(string, function () {
			log(string);
			setTimeout(dailyReport, nextDay());
		});
	}).catch(() => {
		log("Daily Report couldn't be created");
		setTimeout(dailyReport, nextDay());
	});
}
setTimeout(dailyReport, nextDay());

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

log("Stats worker is listening");