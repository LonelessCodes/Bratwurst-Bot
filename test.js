let time;
let lastMonthTime;
const Promise = require("promise"),
	database = require("./modules/database");
/**
 * fixes
 */
Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

Number.prototype.toZeros = function () {
	if (this < 100) {
		if (this < 10) return "00" + this;
		return "0" + this;
	}
	return "" + this;
};
Number.prototype.getHour = function () {
	var a = new Date(this);
	return a.getHours();
};
Number.prototype.getDate = function () {
	var a = new Date(this);
	return a.getDate();
};
Number.prototype.getMonth = function () {
	var a = new Date(this);
	return a.getMonth();
};

String.prototype.template = function (params) {
	let string = this;
	for (let key in params) {
		string = string.replace(`{{${key}}}`, params[key]);
	}
	return string;
};

/**
 * Create Dir for Maps
 */
Number.prototype.toMonth = function () {
	if (this < 12) {
		const name = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
		];
		return name[this];
	}
	return this;
};

Number.prototype.getDaysOfLastMonth = function () {
	var time = new Date(this);
	var year = time.getFullYear();
	var month = time.getMonth();
	if (month == 0) {
		month = 12;
		year = year - 1;
	}
	return new Date(year, month, 0).getDate();
};
Number.prototype.getDaysOfMonth = function () {
	var a = new Date(this);
	var year = a.getFullYear();
	var month = a.getMonth();
	return new Date(year, month, 0).getDate();
};


/**
 * TIMES
 */
function timesFunc(tweets) {
	return new Promise((resolve) => {
		const times = [];
		const hours = {};
		const days = {};
		tweets.forEach(tweet => {
			let offset = -7200;
			if (tweet.child("offset").exists())
				offset += tweet.child("offset").val();
			const timestamp = new Date(tweet.child("timestamp").val() + offset * 1000);
			times.push(timestamp);

			const hour = timestamp.getHours();
			if (!hours[hour]) hours[hour] = 0;
			hours[hour]++;

			const date = timestamp.getDate();
			if (!days[date]) days[date] = 0;
			days[date]++;

			console.log(tweet.val());
		});

		days.length = Object.keys(days).length;

		const finalHours = [];
		for (let i = 0; i < 12; i++) {
			const first = hours[(i * 2).toString()];
			const second = hours[(i * 2 + 1).toString()];
			finalHours.push((
				(first ? first : 0) +
				(second ? second : 0)
			) / days.length);
		}

		const finalMonth = [];
		for (var i = 0; i < 12; i++) {
			if (lastMonthTime.getMonth() === i) {
				let month = days.length > 0 && tweets.numChildren() > 0 ? tweets.numChildren() / days.length : 0;
				finalMonth.push(month);

				resolve({ best: month });
				break;
			}
		}
	});
}

function getTweets(cb) {
	const query = database
		.ref()
		.child("tweets")
		.orderByChild("timestamp")
		.startAt(new Date(2017, 3, 1, 0, 0, 0, 0).getTime())
		.endAt(new Date(2017, 4, 1, 0, 0, 0, 0).getTime());
	query.once("value", cb);
}

time = new Date();
lastMonthTime = new Date(time.getTime() - 1000 * 3600 * 24 * time.getTime().getDaysOfLastMonth());

getTweets(tweets => {
	timesFunc(tweets).then(({ best: times_best }) => {
		console.log(times_best);
		process.exit()
	}).catch(console.log);
});