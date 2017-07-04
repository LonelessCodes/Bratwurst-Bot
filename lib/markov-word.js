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

// word level

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
     * Splitting up the text
     * @param text {string}
     * @return {string[]}
     */
    split(text) {
        // Split into array of tokens
        return text.split(/[^A-Z0-9ßäöü.:;!?']+/i);
    }

    /**
     * joining the text
     * @param text {string[]}
     * @return {string}
     */
    join(text) {
        return text.join(" ");
    }

    /**
     * A function to feed in text to the markov chain
     * @param text {string}
     */
    feed(text) {
        text = this.split(text);
        text = text.filter(elm => {
            return elm.length > 0;
        });

        // Discard this line if it's too short
        if (text.length < this.n) return;

        // Store the first ngram of this line
        const beginning = text.slice(0, this.n);
        this.beginnings.push(beginning);

        // Now let's go through everything and create the dictionary
        for (let i = 0; i < text.length - this.n; i++) {
            const gram = this.join(text.slice(i, i + this.n));
            const next = text[i + this.n];
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
        let output = this.beginnings.random();
        let current = this.join(output);

        // Check if output is smaller than max 
        while (true) { // eslint-disable-line
            // If currently added char is a .! or ? end the sentence.
            // If this is not a valid ngram
            if (!this.ngrams.hasOwnProperty(current) ||
                /[.!?]/g.test(output.last())) break;

            // What are all the possible next tokens
            const possible_next = this.ngrams[current];
            
            const next = possible_next.random();

            // if the string would be longer than the max allowed characters, quit adding 
            // new string to output and return the output directly
            if (this.join(output.concat([next])).length >= this.max) break;
            // Add to the output
            output.push(next);
            // Get the last N entries of the output; we'll use this to look up
            // an ngram in the next iteration of the loop
            current = this.join(output.slice(output.length - this.n, output.length));
        }

        // Here's what we got!
        return this.join(output);
    }
}

module.exports = MarkovGenerator;
