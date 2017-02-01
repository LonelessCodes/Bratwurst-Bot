const child_process = require("child_process");
const fs = require("fs");
const log = require("./modules/log");

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
setTimeout(restart, 1000 * 3600 * 4 + 1000);

// create backup
function backup () {
	require("./modules/database").ref("/").once("value", snapshot => {
		if (!snapshot.exists()) return;
		fs.writeFile(require("path").join(__dirname, "backups/" + (new Date().toLocaleDateString()) + ".json"), JSON.stringify(snapshot.val(), null, 2), () => log("backup created"));
	});
}
backup();
setTimeout(backup, 1000 * 3600 * 24);