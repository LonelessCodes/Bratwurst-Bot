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

function editDistance(s1, s2) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();

	var costs = new Array();
	for (var i = 0; i <= s1.length; i++) {
		var lastValue = i;
		for (var j = 0; j <= s2.length; j++) {
			if (i == 0)
				costs[j] = j;
			else {
				if (j > 0) {
					var newValue = costs[j - 1];
					if (s1.charAt(i - 1) != s2.charAt(j - 1))
						newValue = Math.min(Math.min(newValue, lastValue),
							costs[j]) + 1;
					costs[j - 1] = lastValue;
					lastValue = newValue;
				}
			}
		}
		if (i > 0)
			costs[s2.length] = lastValue;
	}
	return costs[s2.length];
}

module.exports.compare = function compare(s1, s2) {
	var longer = s1;
	var shorter = s2;
	if (s1.length < s2.length) {
		longer = s2;
		shorter = s1;
	}
	var longerLength = longer.length;
	if (longerLength == 0) {
		return 1.0;
	}
	return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
};

module.exports.time = function (t1, t2) {
	const t = t2 - t1;
	let result;
	if (t < 1) result = (t * 1000).toFixed(3) + "ns";
	else if (t < 1000) result = t.toFixed(0) + "ms";
	else if (t < 30000) result = (t / 1000).toFixed(1) + "s";
	else result = (t / 60000).toFixed(1) + "m";
	return result;
};

module.exports.cleanText = function (tweet) {
	// remove special characters
	let str = tweet.text;
	const ent = tweet.entities;
	Object.keys(ent).forEach(key => {
		ent[key].forEach(object => {
			str = str.replace(object.text || object.screen_name || object.url, "");
		});
	});

	str = str.replace(/[^a-zA-Z0-9ß.,:;?!&%\(\)äöü'" ]/g, "").replace(/&amp;/g, "&");

	while (/ \ /g.test(str))
		str = str.replace(/ \ /g, " ");
	if (str.charAt(str.length - 1) === " ")
		str = str.slice(0, str.length - 1);
	if (str.charAt(0) === " ")
		str = str.slice(1, str.length);
	
	return str;
};