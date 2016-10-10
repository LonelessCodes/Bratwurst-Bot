const fs = require("fs");
const log = require("./modules/log");

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

const STATS = JSON.parse(fs.readFileSync("STATS.txt"));

const ids = [];
const newSTATS = [];
for(let i = 0; i < STATS.length; i++){
	newSTATS.push({
		name: STATS[i].name,
		array: [],
		image: STATS[i].image
	});
	for(let elem = 0; elem < STATS[i].array.length; elem++){
		if(ids.indexOf(STATS[i].array[elem].tweetID) == -1){
			newSTATS[i].array.push(STATS[i].array[elem]);
		}
		ids.push(STATS[i].array[elem].tweetID);
	}
}

console.log(newSTATS);

fs.rename("STATS.txt1", "STATS.txt2", err => {
	if (err) return log(err);
	fs.rename("STATS.txt", "STATS.txt1", err => {
		if (err) return log(err);
		fs.writeFile("STATS.txt", JSON.stringify(newSTATS, null, 4), err => {
			if (err) return log(err);
		});
	});
});