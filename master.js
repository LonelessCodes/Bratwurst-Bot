const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const log = require("./modules/log");
const { CronJob } = require("cron");

// prepare
if (!fs.existsSync("backups/")) fs.mkdirSync("backups/");

const processes = {};

// start workers
const workers = fs.readdirSync("workers");
workers.forEach(name => {
	const child = child_process.fork(`workers/${name}`);
	child.restartCallback = () => restart(name);
	child.once("exit", child.restartCallback);
	processes[path.basename(name)] = (child);
});

function restart(name) {
	if (name) {
		doThing(name);
		return;
	}

	// if no specific process is given, restart all processes that would usually need restarting
	// (basically everything that has to do with Twitter streaming)
	// now because I'm always using backup stream systems it's completely unnessesary to restart anything
	// at all, but just for the record, if I might at any time go back, I'll keep it here
	Object.keys(processes).forEach(name => {
		switch (name) {
		case "bratwurst":
		case "mentions":
		case "retweet":
			doThing(name);
			break;
		}
	});

	function doThing(name) {
		processes[name].removeListener("exit", processes[name].restartCallback);
		processes[name].kill();
			
		const child = child_process.fork(`workers/${name}`);
		child.restartCallback = () => restart(name);
		child.once("exit", child.restartCallback);
		processes[name] = child;
	}
}
setInterval(restart, 1000 * 3600 * 8);

// create backup
function backup() {
	let database = require("./modules/database");
	database.ref("/").once("value", snapshot => {
		if (!snapshot.exists()) return;
		const time = new Date();
		const name = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
		const json = JSON.stringify(snapshot.val(), null, 2);
		fs.writeFile(
			path.join(__dirname, "backups", name + ".json"),
			json,
			() => {	
				log("Backup saved:", path.join(__dirname, "backups", name + ".json"), json.length + " bytes written");
			});
		database.goOffline();
		database = undefined; // hoping GC will take care of this
	});
}

new CronJob("00 00 00 * * *", backup, null, true, "Europe/Berlin");

log("Workers started");