module.exports = Concordance;

// Daniel Shiffman
// Programming from A to Z, Fall 2014
// https://github.com/shiffman/Programming-from-A-to-Z-F14

// Only works for English right now

class Concordance {
	/**
	 * An object to store all the info related to a concordance
	 */
	constructor() {
		this.dict = {};
		this.keys = [];
		this.total = 0;
	}

	/**
	 * Splitting up the text
	 * @param text {string}
	 * @return {string}
	 */
	split(text) {
		// Split into array of tokens
		return text.split(/[^A-Z0-9']+/i);
	}

	/**
	 * A function to validate a toke
	 * @param token {string}
	 * @return {boolean}
	 */
	validate(token) {
		if (!/^[#@]?['A-Za-z]+$/i.test(token)) {
			return false;
		}

		if (/^[^ai]$/i.test(token)) {
			return false;
		}
		return true;
	}

	/**
	 * Process new text
	 * @param token {string}
	 */
	process(data) {
		const tokens = this.split(data);
		this.total += data.length;
		// For every token
		for (let i = 0; i < tokens.length; i++) {
			// Lowercase everything to ignore case
			const token = tokens[i];//.toLowerCase();
			if (this.validate(token)) {
				// Increase the count for the token
				this.increment(token);
			}
		}
	}
	
	/**
	 * An array of keys
	 * @return {string[]}
	 */
	getKeys() {
		return this.keys;
	}

	/**
	 * Get the count for a word
	 * @return {number}
	 */
	getCount(word) {
		return this.dict[word];
	}

	/**
	 * Increment the count for a word
	 * @param word {string}
	 */
	increment(word) {
		// Is this a new word?
		if (!this.dict[word]) {
			this.dict[word] = 1;
			this.keys.push(word);
			// Otherwise just increment its count
		} else {
			this.dict[word]++;
		}
	}

	/**
	 * Sort array of keys by counts
	 */
	sortByCount() {
		// A fancy way to sort each element
		// Compare the counts
		this.keys.sort((a, b) => {
			const diff = this.getCount(b) - this.getCount(a);
			return diff;
		});
	}	
}
