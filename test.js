const {tweet, updateBio, client} = require("./modules/twitter");
const stats = require("./modules/stats/stats");
const database = require("./modules/database");

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */
const log = require("./modules/log");

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

Date.prototype.getDaysOfMonth = function () {
	var year = this.getFullYear();
	var month = this.getMonth();
	return new Date(year, month, 0).getDate();
};

const time = new Date();
stats.charts(function (paths, info) {
	let string = "Bratwurst tweeters were most active " + (info.times > 5 ? info.times > 11 ? info.times > 14 ? info.times > 18 ? info.times > 21 ? "at night" : "in the evening" : "in the afternoon" : "around noon" : "in the morning" : "at night") + ". ";
	string += "Most tweeters came from " + info.global;
	string += " [" + (Date.now() - time.getTime()) + "ms] #BratwurstStats";

	console.log(string);
}, ({path, user, value}) => {
	console.log(path, user, value);
});