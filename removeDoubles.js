var colors = require("colors"),
	fs = require('fs'),
	chart = require("./charts/charts")();
	
var Twitter = require('twit');

var client = new Twitter(require("./secret/keys").keys);

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

/*var time = new Date();
chart.charts(function(paths, info){
	var string = "Bratwurst tweeters were most active " + (info.times > 5 ? info.times > 11 ? info.times > 14 ? info.times > 18 ? info.times > 21 ? "at night" : "in the evening" : "in the afternoon" : "around noon" : "in the morning" : "at night") + ". ";
	string += "Most tweeters came from " + info.global;
	string += " [" + (new Date().getTime() - time.getTime()) + "ms] #BratwurstStats";
	
	console.log(string);
});
*/

var STATS = JSON.parse(fs.readFileSync('STATS.txt'));

var ids = [];
var newSTATS = [];
for(var i = 0; i < STATS.length; i++){
	newSTATS.push({
		name: STATS[i].name,
		array: [],
		image: STATS[i].image
	});
	for(var elem = 0; elem < STATS[i].array.length; elem++){
		if(ids.indexOf(STATS[i].array[elem].tweetID) == -1){
			newSTATS[i].array.push(STATS[i].array[elem]);
		}
		ids.push(STATS[i].array[elem].tweetID);
	}
}

console.log(newSTATS)

function updateCache() {
	fs.rename('STATS.txt1', 'STATS.txt2', function (err) {
		fs.rename('STATS.txt', 'STATS.txt1', function (err) {
			if (err) return log(err);
			fs.writeFile('STATS.txt', JSON.stringify(newSTATS, null, 4), function (err) {
				if (err) return log(err);
			});
		});
	});
}
updateCache();