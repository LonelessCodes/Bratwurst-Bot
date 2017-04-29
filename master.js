const child_process = require("child_process");
const fs = require("fs");
const log = require("./modules/log");
const mkdir = require("mkdirp");
const { CronJob } = require("cron");

// prepare
if (!fs.existsSync("backups/")) mkdir.sync("backups");

let processes = [];

function createWorker() {
	log("starting workers");
	const workers = fs.readdirSync("workers");
	workers.forEach(name => {
		const child = child_process.fork(`workers/${name}`);
		child.once("exit", restart);
		processes.push(child);
	});
	log("Workers started");
}
createWorker();

function restart() {
	processes.forEach(child => {
		child.removeListener("exit", restart);
		child.kill();
	});
	processes = [];
	createWorker();
}
setInterval(restart, 1000 * 3600 * 8);

// create backup
function backup() {
	require("./modules/database").ref("/").once("value", snapshot => {
		if (!snapshot.exists()) return;
		const time = new Date();
		const name = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
		fs.writeFile(
			require("path").join(__dirname, "backups", name + ".json"),
			JSON.stringify(snapshot.val(), null, 2),
			() => {	
				log("Backup saved:", require("path").join(__dirname, "backups", name + ".json"));
			});
	});
}

new CronJob("00 00 00 * * *", backup, null, true, "Europe/Berlin");
