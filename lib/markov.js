// modified version of: https://github.com/shiffman/Rupert-Bot/blob/master/lib/markov.js

// This is based on Allison Parrish's great RWET examples
// https://github.com/aparrish/rwet-examples

Array.prototype.random = function () {
	return this[Math.floor(Math.random() * this.length)];
};
Array.prototype.last = function () {
	return this[this.length - 1];
};
Array.prototype.matchRegex = function (value) {
	for (let i = 0; i < this.length; i++) {
		if (this[i].match(value)) {
			return i;
		}
	}
	return -1;
};

class MarkovGenerator {
	/**
	 * A MarkovGenerate object
	 * @param n {number}
	 * @param max {number}
	 */
	constructor(n, max) {
		// Order (or length) of each ngram
		this.n = n;
		// What is the maximum amount we will generate?
		this.max = max;
		// An object as dictionary
		// each ngram is the key, a list of possible next elements are the values
		this.ngrams = {};
		// A separate array of possible beginnings to generated text
		this.beginnings = [];
	}

	/**
	 * A function to feed in text to the markov chain
	 * @param text {string}
	 */
	feed(text) {
		// Discard this line if it's too short
		if (text.length < this.n) return false;

		// Store the first ngram of this line
		const beginning = text.substring(0, this.n);
		this.beginnings.push(beginning);

		// Now let's go through everything and create the dictionary
		for (let i = 0; i < text.length - this.n; i++) {
			const gram = text.substring(i, i + this.n);
			const next = text.charAt(i + this.n);
			// Is this a new one?
			if (!this.ngrams.hasOwnProperty(gram)) {
				this.ngrams[gram] = [];
			}
			// Add to the list
			this.ngrams[gram].push(next);
		}
	}
	/**
	 * Get the count of all texts
	 * @param {number}
	 */
	count() {
		return this.beginnings.length;
	}

	/**
	 * Generate a text from the information ngrams
	 * @returns {string}
	 */
	generate() {
		// Get a random  beginning
		let current = this.beginnings.random();
		let output = current;

		// console.log(JSON.stringify(this.ngrams, null, 2));

		// Generate a new token max number of times
		while (output.length < this.max) {
			// If currently added char is a .! or ? end the sentence.
			// If this is not a valid ngram
			if (!this.ngrams.hasOwnProperty(current) ||
				/[.!?]/g.test(output.charAt(output.length - 1))) break;

			// What are all the possible next tokens
			const possible_next = this.ngrams[current];
			// make sure bratwurstbot can close quotation marks after they're created
			const contains_quotation = (output.match(/["]/g) || []).length % 2;
			// find the index of an element containing quotation marks
			const quotation_index = possible_next.matchRegex(/["]/);
			// if contains quotation add that element else pick one randomly
			const next = (contains_quotation && quotation_index > -1) ? possible_next[quotation_index] : possible_next.random();
			// Add to the output
			output += next;
			// Get the last N entries of the output; we'll use this to look up
			// an ngram in the next iteration of the loop
			current = output.substring(output.length - this.n, output.length);

			// console.log(this.max, output.length, output);
		}
		// remove quotations left, single quotations for example
		const quotations = output.match(/["]/);
		if ((quotations || []).length % 2) {
			output = output.substring(0, quotations.last().index) +
				output.substring(quotations.last().index + 1, output.length);
		}

		// Here's what we got!
		return output;
	}
}

module.exports = MarkovGenerator;