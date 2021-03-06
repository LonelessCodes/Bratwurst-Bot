// set database global to only have one instance of firebase running in one process
if (!global.database) {
    const firebase = require("firebase-admin");
    const key = require("../../keys/firebase.json");
    
    firebase.initializeApp({
        credential: firebase.credential.cert(key),
        databaseURL: "https://bratwurst-bot.firebaseio.com"
    });
    
    // firebase.database.enableLogging(true);
    const database = firebase.database();
    
    module.exports = database;
    module.exports.isIgnored = async function (id, cb) {
        if (!cb) cb = () => { };
    
        let snapshot = await database.ref("ignored/" + id).once("value");
        if (snapshot.exists()) {
            cb(true);
            throw new Error("User ignored.");
        } else {
            snapshot = await database.ref("blacklist/" + id).once("value");
            if (snapshot.exists()) {
                cb(true);
                throw new Error("User on blacklist.");
            } else {
                cb(false);
                return false;
            }
        }
    };
    module.exports.isIgnoredNoThrow = async function (id, cb) {
        if (!cb) cb = () => { };
    
        let snapshot = await database.ref("ignored/" + id).once("value");
        if (snapshot.exists()) {
            cb(true);
            return true;
        } else {
            snapshot = await database.ref("blacklist/" + id).once("value");
            if (snapshot.exists()) {
                cb(true);
                return true;
            } else {
                cb(false);
                return false;
            }
        }
    };
    
    const { Tweet, User } = require("./objects");
    module.exports.Tweet = Tweet;
    module.exports.User = User;
    
    global.database = module.exports;
} else {
    module.exports = global.database;
}
