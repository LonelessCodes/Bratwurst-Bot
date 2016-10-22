const {spawn} = require("child_process");

let retweet = spawn("node", ["retweet.js"]);

setInterval(() => {
	retweet.kill();
	retweet = spawn("node", ["retweet.js"]);
}, 1000 * 60 * 60 * 2);

retweet.stderr.on("data", data => {
	console.log(data);
});

retweet.on("close", code => {
	retweet.kill();
	retweet = spawn("node", ["retweet.js"]);
	console.log("Error: " + code);
});

retweet.on("error", code => {
	retweet.kill();
	retweet = spawn("node", ["retweet.js"]);
	console.log("Error: " + code);
});

retweet.on("exit", code => {
	retweet.kill();
	retweet = spawn("node", ["retweet.js"]);
	console.log("Error: " + code);
});