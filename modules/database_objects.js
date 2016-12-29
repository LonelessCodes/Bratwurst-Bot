const now = time => {
	if (time) return new Date(time).getTime();
	else return new Date().getTime();
};

class User {
	constructor(user) {
		this.screen_name = user.screen_name;
		this.profile_image_url = user.profile_image_url;
	}
}

class Tweet {
	constructor(tweetObj) {
		this.source = tweetObj.source ? tweetObj.source.split(">")[1].split("<")[0].replace("Twitter ", "").replace("for ", "") : null;
		this.place = tweetObj.place ? tweetObj.place.country_code : null;
		this.offset = tweetObj.user.utc_offset || 0;
		this.lang = tweetObj.lang || null;
		this.hashtags = tweetObj.entities.hashtags ? tweetObj.entities.hashtags.map(hash => hash.text) : null;
		this.timestamp = now(tweetObj.created_at) + (7200 * 1000);

		this.user = {
			id: tweetObj.user.id_str,
			screen_name: tweetObj.user.screen_name
		};
	}
}
module.exports = {
	Tweet: Tweet,
	User: User
};