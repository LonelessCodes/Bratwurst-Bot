const client = require("./twitter"),
	kill = require("tree-kill"),
	spawn = require("child_process").spawn;

const log = require("./modules/log");

var killer;
var killableProcess = new Array(4);

function checkKillable() {
	var killable = true;
	for (var i = 0; i < killableProcess.length; i++) {
		if (!killableProcess[i]) killable = false;
	}
	if (killable && killer) {
		killer();
	}
}

const processes = {};
function mainProcess() {
	processes.retweeting = spawn("node", ["retweet-thread.js"]);
	processes.retweeting.stdout.on("data", function (data) {
		log(data);
	});
	processes.retweeting.on("message", (event) => {
		if (event.killable) killableProcess[0] = true;
		if (event.notKillable) killableProcess[0] = false;
		checkKillable();
	});

	
	processes.mentions = spawn("node", ["mention-thread.js"]);
	processes.mentions.stdout.on("data", function (data) {
		log(data);
	});
	processes.mentions.on("message", (event) => {
		if (event.killable) killableProcess[0] = true;
		if (event.notKillable) killableProcess[0] = false;
		checkKillable();
	});

	
	processes.hashtag = spawn("node", ["hashtag-thread.js"]);
	processes.hashtag.stdout.on("data", function (data) {
		log(data);
	});
	processes.hashtag.on("message", (event) => {
		if (event.killable) killableProcess[0] = true;
		if (event.notKillable) killableProcess[0] = false;
		checkKillable();
	});

	
	processes.stats = spawn("node", ["stats-thread.js"]);
	processes.stats.stdout.on("data", function (data) {
		log(data);
	});
	processes.stats.on("message", (event) => {
		if (event.killable) killableProcess[0] = true;
		if (event.notKillable) killableProcess[0] = false;
		checkKillable();
	});
}
mainProcess();

function killProcesses(callback) {
	killer = function () {
		for (var key in processes) {
			kill(processes[key].pid);
		}
		killer = null;
		callback();
	};
	checkKillable();
}

function restart() {
	killProcesses(() => {
		setTimeout(() => {
			mainProcess();
		}, 2000);
	});
}

const commands = client.stream("@Bratwurst_bot", function (tweet) {
	if (tweet.user.screen_name === "LonelessArt") {
		const text = tweet.text.toLowerCase();
		if (text === "@Bratwurst_bot restart") {
			restart();
		}
		else if (text === "@Bratwurst_bot kill") {
			killProcesses(function () {
				process.exit();
			});
		}
	}
});
commands.on("disconnect", function (disconnectMessage) {
	commands.stop();
	setTimeout(function () {
		commands.start();
	}, 10000);
	log(disconnectMessage);
});
commands.on("warning", function (warning) {
	commands.stop();
	setTimeout(function () {
		commands.start();
	}, 10000);
	log(warning);
});