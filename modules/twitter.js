const Twitter = require("twit");
const fs = require("fs");
const {roll} = require("./utils");
const {EventEmitter} = require("events");
const Queue = require("./queue");
const retweet_queue = new Queue();

const client = new Twitter(require("./../keys.json"));

const updateInterval = 1000 * 60 * 5;

module.exports.tweet = function (status, options, callback) {
	const params = {
		status: status
	};
	
	if (arguments.length === 3) {
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
		client.post("statuses/update", params, options);
	}
};

module.exports.retweet = function (id, callback) {
	// Queue the retweeting to reduce the possibility of stupid rate limits kicking in
	retweet_queue.push(next => {
		setTimeout(() => {
			client.post("statuses/retweet/:id", { id: id }, (err, data, response) => {
				callback(err, data, response);
				next();
			});
		}, 1000);
	});
};

module.exports.stream = function (track, callback, backup) {
	if (!backup) {
		const stream = client.stream("statuses/filter", { track: track });
		stream.on("tweet", tweet => callback(tweet, tweet.user));
		return stream;
	} else {
		const stream = new EventEmitter();
		
		const already_given = [];
		const run = () => {
			client.get("search/tweets", {
				q: track,
				result_type: "recent",
				include_entities: "true",
				count: 20
			}).then(data => {
				const stat = data.data.statuses || data.statuses;
				if (!stat) return;
				stat.forEach(tweet => {
					if (already_given.includes(tweet.id_str)) return;
					already_given.push(tweet.id_str);
					stream.emit("tweet", tweet);
				});
			}).catch(err => console.log(err));
		};
		run();
		let interval = setInterval(run, updateInterval);

		stream.on("tweet", tweet => callback(tweet, tweet.user));
		stream.stop = function () {
			clearInterval(interval);
		};
		stream.start = function () {
			run();
			interval = setInterval(run, updateInterval);
		};
		return stream;
	}
};

module.exports.onfollowed = function (callback) {
	const stream = client.stream("user");
	stream.on("follow", callback);
	return stream;
};

module.exports.updateBio = function (params, callback) {
	client.post("account/update_profile", params, callback);
};

module.exports.client = client;