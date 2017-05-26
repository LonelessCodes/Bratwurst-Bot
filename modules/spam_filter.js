const utils = require("./utils");

class SpamFilter {
	constructor() {
		this.timeouts = {};
	}

	check(tweetObj) {
		return new Promise((resolve, reject) => {
			const compareString = utils.cleanText(tweetObj).toLowerCase().replace(/ /g, "").replace(/[^a-zA-Z0-9 ]/g, "");

			let send = true;
			Object.keys(this.timeouts).forEach(key => {
				if (utils.compare(key, compareString) > 0.9)
					send = false;
			});
			if (!send) return reject();

			clearTimeout(this.timeouts[compareString]);
			this.timeouts[compareString] = setTimeout(() => {
				delete this.timeouts[compareString];
			}, 1000 * 3600 * 2);

			resolve();
		});
	}
}

module.exports = SpamFilter;