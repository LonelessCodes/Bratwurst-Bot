const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const log = require("./modules/log");
const { CronJob } = require("cron");

class Worker {
    /**
     * Create a new worker
     * @param {string} file 
     * @param {boolean} restart 
     */
    constructor(file, restart = false) {
        this.file = file;
        this.restartCallback = () => this.restart();
        if (restart) setInterval(this.restartCallback, 1000 * 3600 * 6);
        this.start();
    }

    restart() {
        this.stop();
        this.start();
    }

    start() {
        this.process = child_process.fork(`workers/${this.file}`);
        this.process.once("exit", this.restartCallback);
    }

    stop() {
        this.process.removeListener("exit", this.restartCallback);
        this.process.kill();
    }
}

// const workers = [
//     new Worker("bratwurst.js", true),
//     new Worker("generate.js"),
//     new Worker("mentions.js", true),
//     new Worker("retweet.js", true),
//     new Worker("stats.js"),
// ];
// Bratwurst Bot is having many many problems right now, and I can't figure out why.
// This down here is just to test what the heck is going on
const workers = [
    new Worker("bratwurst.js"),
    new Worker("generate.js"),
    new Worker("mentions.js"),
    new Worker("retweet.js"),
    new Worker("stats.js"),
];

// prepare
if (!fs.existsSync("backups/")) fs.mkdirSync("backups/");

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
            () => log("Backup saved:", path.join(__dirname, "backups", name + ".json"), json.length + " bytes written"));
        database.goOffline();
        database = undefined; // hoping GC will take care of this
    });
}

new CronJob("00 00 00 * * *", backup, null, true, "Europe/Berlin");

log("Workers started");
