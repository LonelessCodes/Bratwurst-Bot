const Promise = require("promise");
const firebase = require("firebase-admin");
const key = require("../keys/firebase.json");

firebase.initializeApp({
    credential: firebase.credential.cert(key),
    databaseURL: "https://bratwurst-bot.firebaseio.com"
});

// firebase.database.enableLogging(true);
const database = firebase.database();

module.exports = database;
module.exports.isIgnored = function (id, cb) {
    if (!cb) cb = () => { };
    
    const ignore = database.ref("ignored/" + id);
    const blacklist = database.ref("blacklist/" + id);
    return new Promise((resolve, reject) => {
        ignore.once("value", snapshot => {
            if (snapshot.exists()) {
                reject(new Error("User ignored."));
                cb(true);
            } else {
                blacklist.once("value", snapshot => {
                    if (snapshot.exists()) {
                        reject(new Error("User on blacklist."));
                        cb(true);
                    } else {
                        resolve();
                        cb(false);
                    }
                });
            }
        });
    });
};
