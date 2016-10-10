const Twitter = require("twit");
const fs = require("fs");
const {roll} = require("./utils");

var client = new Twitter({
	consumer_key: "1FsqFijsOg88basJ4a9jz3rBc",
	consumer_secret: "IwKXRxP6Cs40jz3VfyYJh8qmkwJhM87hQHKaDDW65sp5oMod0k",
	access_token: "4776021941-waErNoOEG6uYtgYwXWF7n9zrMl0dDOCuyQFVa3o",
	access_token_secret: "NyQ0yc9pmi62muThL5M86oq3x8fwMDKFsKY6dQ8FQZMzp"
});

module.exports.tweet = function (status, options, callback) {
	var params = {
		status: status
	};
	if (options) {
		if (options.inReplyTo) params.in_reply_to_status_id = options.inReplyTo;
		if (options.media) {
			params.media_ids = [];

			roll(options.media, (mediaPath, index, next) => {
				fs.readFile(mediaPath, { encoding: "base64" }, (err, media) => {
					if (err) return callback(err);
					client.post("media/upload", { media_data: media }, (err, data) => {
						if (err) return callback(err);

						params.media_ids.push(data.media_id_string);
						next();
					});
				});
			}, () => {
				client.post("statuses/update", params, callback);
			});
		} else {
			client.post("statuses/update", params, callback);
		}
	} else {
		client.post("statuses/update", params, callback);
	}
};

module.exports.retweet = function (id, callback) {
	client.post("statuses/retweet/:id", { id: id }, callback);
};

module.exports.stream = function (track, callback) {
	const stream = client.stream("statuses/filter", { track: track });
	stream.on("tweet", callback);
	return stream;
};

module.exports.onfollowed = function (callback) {
	const stream = client.stream("user");
	stream.on("follow", callback);
	return stream;
};

module.exports.updateBio = function (params, callback) {
	client.post("account/update_profile", params, callback);
};

console.log(Twitter.prototype);