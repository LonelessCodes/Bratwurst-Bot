const utils = require("./utils");

class SpamFilter {
    constructor() {
        this.timeouts = {};
    }

    async check(tweetObj) {
        const compareString = utils.cleanText(tweetObj).toLowerCase().replace(/ /g, "").replace(/[^a-zA-Z0-9 ]/g, "");

        let send = true;
        Object.keys(this.timeouts).forEach(key => {
            if (utils.compare(key, compareString) > 0.95)
                send = false;
        });
        if (!send) throw new Error("Spamfilter is blocking.");

        clearTimeout(this.timeouts[compareString]);
        this.timeouts[compareString] = setTimeout(() => {
            delete this.timeouts[compareString];
        }, 1000 * 3600);

        return true;
    }
}

module.exports = SpamFilter;
