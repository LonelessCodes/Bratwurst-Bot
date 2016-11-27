module.exports.roll = function roll(array, roller, end) {
	let index = 0;
	const next = () => {
		index++;
		if (index < array.length) {
			roller(array[index], index, () => next());
		} else {
			if (end) end();
		}
	};
	if (array.length === 0) return end();
	roller(array[index], index, next);
};

module.exports.triggerAt = function triggerAt(time, callback) {
	var now = new Date();
	var millisTill10 = time - now;
	if (millisTill10 < 0) {
		millisTill10 += 86400000; // it's after 10am, try 10am tomorrow.
	}
	setTimeout(callback, millisTill10);
};