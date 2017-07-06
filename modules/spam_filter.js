const utils = require("./utils");
const stringSimilarity = require("string-similarity");

class SpamFilter {
    constructor() {
        /**
         * @type {string[]}
         */
        this.timeouts = [];
    }

    async check(tweetObj) {
        const compareString = utils.cleanText(tweetObj).toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "");

        for (let string of this.timeouts) {
            console.log(string, "|", compareString, "|", stringSimilarity.compareTwoStrings(string, compareString).toFixed(2));
            if (stringSimilarity.compareTwoStrings(string, compareString) > 0.95) {
                throw new Error("Spamfilter is blocking.");
            }
        }

        this.timeouts.push(compareString);        
        setTimeout(() => {
            this.timeouts.splice(this.timeouts.indexOf(compareString), 1);
        }, 1000 * 3600);

        return;
    }
}

module.exports = SpamFilter;
