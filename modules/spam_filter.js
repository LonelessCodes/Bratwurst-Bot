const utils = require("./utils");
const { compareTwoStrings } = require("string-similarity");

class SpamFilter {
    constructor() {
        /**
         * @type {string[]}
         */
        this.strings = [];
    }

    async check(tweetObj) {
        const compareString = utils.cleanText(tweetObj).toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "");

        for (let string of this.strings) {
            if (compareTwoStrings(string, compareString) > 0.9) {
                throw new Error("Spamfilter is blocking.");
            }
        }

        this.strings.push(compareString);        
        setTimeout(() => {
            this.strings.splice(this.strings.indexOf(compareString), 1);
        }, 1000 * 3600);

        return;
    }
}

module.exports = SpamFilter;
