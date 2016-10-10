const {tweet} = require("./modules/twitter"),
	chart = require("./charts/charts")();

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */
const log = require("./modules/log");

const time = new Date();
chart.charts(function(paths, info){
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
				if (err) return log(err);
				log("Top Bratwurst tweeter of the month is @" + dataf.user + " with " + dataf.value + " tweets. Congratulations!!!", ("Top Bratwurst tweeter of the month is @" + data.user + " with " + data.value + " tweets. Congratulations!!!".length + 23 <= 140));
			});
		});
	});
});