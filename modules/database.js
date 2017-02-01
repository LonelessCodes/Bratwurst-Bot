const Promise = require("promise");
const firebase = require("firebase-admin");
const key = require("./../.keys/firebase.json");

firebase.initializeApp({
	credential: firebase.credential.cert(key),
	databaseURL: key.url
});

// firebase.database.enableLogging(true);
const database = firebase.database();

module.exports = database;
module.exports.isIgnored = function (id) {
	const ignore = database.ref("ignored").child(id);
	return new Promise((resolve, reject) => {
		ignore.once("value", snapshot => {
			if (snapshot.exists()) reject();
			else resolve();
		});
	});
};