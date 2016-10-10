const Twitter = require("twit");
const fs = require("fs");

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

			var mediaUploads = new Array(options.media.length);
			var mediaIds = [];

			var checkLoaded = function () {
				var yay = true;
				for (var i = 0; i < mediaUploads.length; i++) {
					if (!mediaUploads[i]) {
						yay = false;
						break;
					}
				}
				if (yay) {
					params.media_ids = mediaIds;
					client.post("statuses/update", params, callback);
				}
			};
			for (var i = 0; i < options.media.length; i++) {
				var index = i + 0;
				var media = fs.readFileSync(options.media[media], { encoding: "base64" });
				client.post("media/upload", { media_data: media }, (err, data) => {
					if (err) return callback(err);

					mediaIds.push(data.media_id_string);
					mediaUploads[index] = true;
					checkLoaded();
				});
			}
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
	var stream = client.stream("statuses/filter", { track: track });
	stream.on("tweet", callback);
	return stream;
};

module.exports.followed = function (callback) {
	var stream = client.stream("user");
	stream.on("follow", callback);
	return stream;
};

module.exports.updateBio = function (params, callback) {
	client.post("account/update_profile", params, callback);
};

console.log(Twitter.prototype);