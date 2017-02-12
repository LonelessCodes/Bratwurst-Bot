const {client} = require("./modules/twitter");
const database = require("./modules/database");
const utils = require("./modules/utils");

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

/*
 * Database Objects
 */
const {Tweet} = require("./modules/database_objects");

const tweets = database.ref("tweets");

tweets.once("value", snap => {
	snap = snap.val();
	utils.roll(Object.keys(snap), (key, i, next) => {
		client.get("statuses/show/:id", {
			id: key
		}, (err, tweetObj) => {
			if (err) return;
			const ob = new Tweet(tweetObj);
			console.log(JSON.stringify(ob, null, 2));
			tweets.child(tweetObj.id_str).set(ob, () => {
				console.log("saved");
			});
		});
		setTimeout(next, 15 * 60000 / 850);
	}, () => process.exit());
});