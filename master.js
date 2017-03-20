const child_process = require("child_process");
const fs = require("fs");
const log = require("./modules/log");
const mkdir = require("mkdirp");

// prepare
if (!fs.existsSync("backups/")) mkdir.sync("backups");
if (!fs.existsSync("stats/")) mkdir.sync("stats");

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
setInterval(restart, 1000 * 3600 * 6);

// create backup
function backup() {
	require("./modules/database").ref("/").once("value", snapshot => {
		if (!snapshot.exists()) return;
		const time = new Date();
		const name = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
		console.log(require("path").join(__dirname, "backups", name + ".json"));
		fs.writeFile(require("path").join(__dirname, "backups", name + ".json"), JSON.stringify(snapshot.val(), null, 2), () => log("backup created"));
	});
	setTimeout(backup, 1000 * 3600 * 24);
}
backup();