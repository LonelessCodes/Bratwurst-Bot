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