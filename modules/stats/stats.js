let time;
let lastMonthTime;
let lastMonth;
let lastYear;
let chartDir;
const fs = require("fs"),
	mkdirp = require("mkdirp"),
	path = require("path"),
	Promise = require("promise"),
	BlenderJob = require("./../blender")(),
	log = require("./../log"),
	database = require("./../database");

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

const infos = {};

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
 * py templates
 */
const py = {
	sources: fs.readFileSync(path.resolve(__dirname + "/py/sources.py"), "utf8"),
	global: fs.readFileSync(path.resolve(__dirname + "/py/global.py"), "utf8"),
	times: fs.readFileSync(path.resolve(__dirname + "/py/times.py"), "utf8")
};

function sourceFunc(tweets) {
	const localTime = new Date();
	/**
	 * Render Sources
	 */
	return new Promise((resolve, reject) => {
		const sources = {};

		let numberSources = 0;
		tweets.forEach(tweet => {
			if (!tweet.child("source").exists()) return;
			let s = tweet.child("source").val().split(">");
			s = (s.length === 1 ? s[0] : s[1]).split("<")[0].replace("Twitter ", "").replace("for ", "");
			sources[s] ? sources[s]++ : sources[s] = 1;
			numberSources++;
		});

		const sourcesArray = Object.keys(sources).map(key => {
			return {
				value: sources[key],
				name: key
			};
		}).sort(function (a, b) {
			return b.value - a.value;
		});

		const perfectSource = {
			"value": [],
			"name": []
		};
		for (let i = 0; i < 6; i++) {
			if (sourcesArray[i]) {
				perfectSource["value"].push(sourcesArray[i].value / numberSources * 100);
				perfectSource["name"].push(sourcesArray[i].name);
			} else {
				perfectSource["value"].push(0);
				perfectSource["name"].push("");
			}
		}

		const pyString = py.sources.template({
			data: JSON.stringify(perfectSource, null, 4),
			lastMonth: lastMonth,
			lastYear: lastYear,
			renderTime: localTime.getTime()
		});

		fs.writeFile(chartDir + "/sources.py", pyString, err => {
			if (err) {
				reject(err);
				return log(err);
			}

			new BlenderJob(path.resolve(__dirname + "/../../blends/stats_sources.blend"))
				.python(chartDir + "/sources.py")
				.save(chartDir + "/sources.png", err => {
					if (err) {
						reject(err);
						return log(err);
					}

					pathToChart.source = chartDir + "/sources.png";
					infos.source = perfectSource["name"][0];

					resolve();
				});
		});
	});
}

function globalFunc(tweets) {
	const localTime = new Date();

	return new Promise((resolve, reject) => {
		const global = {};
		tweets.forEach(tweet => {
			if (!tweet.child("place").exists()) return;
			const s = tweet.child("place").val();
			if (!global[s]) global[s] = 0;
			global[s]++;
		});

		const countries = [
			{ id: "AE" }, { id: "AF" }, { id: "AL" }, { id: "AM" }, { id: "AO" }, { id: "AR" }, { id: "AT" }, { id: "AU" }, { id: "AZ" }, { id: "BA" }, { id: "BD" }, { id: "BE" }, { id: "BF" }, { id: "BG" }, { id: "BI" }, { id: "BJ" }, { id: "BN" }, { id: "BO" }, { id: "BR" }, { id: "BS" }, { id: "BT" }, { id: "BW" }, { id: "BY" }, { id: "BZ" }, { id: "CA" }, { id: "CD" }, { id: "CF" }, { id: "CG" }, { id: "CH" }, { id: "CI" }, { id: "CL" }, { id: "CM" }, { id: "CN" }, { id: "CO" }, { id: "CR" }, { id: "CU" }, { id: "CY" }, { id: "CZ" }, { id: "DE" }, { id: "DJ" }, { id: "DK" }, { id: "DO" }, { id: "DZ" }, { id: "EC" }, { id: "EE" }, { id: "EG" }, { id: "EH" }, { id: "ER" }, { id: "ES" }, { id: "ET" }, { id: "FK" }, { id: "FI" }, { id: "FJ" }, { id: "FR" }, { id: "GA" }, { id: "GB" }, { id: "GE" }, { id: "GF" }, { id: "GH" }, { id: "GL" }, { id: "GM" }, { id: "GN" }, { id: "GQ" }, { id: "GR" }, { id: "GT" }, { id: "GW" }, { id: "GY" }, { id: "HN" }, { id: "HR" }, { id: "HT" }, { id: "HU" }, { id: "ID" }, { id: "IE" }, { id: "IL" }, { id: "IN" }, { id: "IQ" }, { id: "IR" }, { id: "IS" }, { id: "IT" }, { id: "JM" }, { id: "JO" }, { id: "JP" }, { id: "KE" }, { id: "KG" }, { id: "KH" }, { id: "KP" }, { id: "KR" }, { id: "XK" }, { id: "KW" }, { id: "KZ" }, { id: "LA" }, { id: "LB" }, { id: "LK" }, { id: "LR" }, { id: "LS" }, { id: "LT" }, { id: "LU" }, { id: "LV" }, { id: "LY" }, { id: "MA" }, { id: "MD" }, { id: "ME" }, { id: "MG" }, { id: "MK" }, { id: "ML" }, { id: "MM" }, { id: "MN" }, { id: "MR" }, { id: "MW" }, { id: "MX" }, { id: "MY" }, { id: "MZ" }, { id: "NA" }, { id: "NC" }, { id: "NE" }, { id: "NG" }, { id: "NI" }, { id: "NL" }, { id: "NO" }, { id: "NP" }, { id: "NZ" }, { id: "OM" }, { id: "PA" }, { id: "PE" }, { id: "PG" }, { id: "PH" }, { id: "PL" }, { id: "PK" }, { id: "PR" }, { id: "PS" }, { id: "PT" }, { id: "PY" }, { id: "QA" }, { id: "RO" }, { id: "RS" }, { id: "RU" }, { id: "RW" }, { id: "SA" }, { id: "SB" }, { id: "SD" }, { id: "SE" }, { id: "SI" }, { id: "SJ" }, { id: "SK" }, { id: "SL" }, { id: "SN" }, { id: "SO" }, { id: "SR" }, { id: "SS" }, { id: "SV" }, { id: "SY" }, { id: "SZ" }, { id: "TD" }, { id: "TF" }, { id: "TG" }, { id: "TH" }, { id: "TJ" }, { id: "TL" }, { id: "TM" }, { id: "TN" }, { id: "TR" }, { id: "TT" }, { id: "TW" }, { id: "TZ" }, { id: "UA" }, { id: "UG" }, { id: "US" }, { id: "UY" }, { id: "UZ" }, { id: "VE" }, { id: "VN" }, { id: "VU" }, { id: "YE" }, { id: "ZA" }, { id: "ZM" }, { id: "ZW" }
		];

		const values = [];
		const finalArray = countries.map((country, i) => {
			let value = 0;
			Object.keys(global).some(key => {
				if (country.id == key) {
					value = global[key];
					return true;
				}
			});
			values.push(value);
			return {
				"name": "Curve." + i.toZeros(),
				"value": value
			};
		});
		const max = values.max();

		const pyString = py.global.template({
			data: JSON.stringify(finalArray, null, 4),
			max: max,
			lastMonth: lastMonth,
			lastYear: lastYear,
			renderTime: localTime.getTime()
		});

		fs.writeFile(chartDir + "/global.py", pyString, err => {
			if (err) {
				reject(err);
				return log(err);
			}

			new BlenderJob(path.resolve(__dirname + "/../../blends/stats_global.blend"))
				.python(chartDir + "/global.py")
				.save(chartDir + "/global.png", err => {
					if (err) {
						reject(err);
						return log(err);
					}

					pathToChart.global = chartDir + "/global.png";
					for (var i = 0; i < finalArray.length; i++) {
						if (finalArray[i]["value"] == max) infos.global = countries[i].id;
					}

					resolve();
				});
		});
	});
}

function timesFunc(tweets) {
	const localTime = new Date();

	return new Promise((resolve, reject) => {
		database.ref().child("stats/month").once("value", stats => {
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
			});

			days.length = Object.keys(days).length;

			const finalHours = [];
			for (let i = 0; i < 12; i++) {
				const first = hours["" + (i * 2)];
				const second = hours["" + (i * 2 + 1)];
				finalHours.push((
					(first ? first : 0) +
					(second ? second : 0)
				) / days.length);
			}
			finalHours.reverse();

			const finalMonth = [];
			for (var i = 0; i < 12; i++) {
				if (lastMonthTime.getMonth() === i) {
					let month = days.length > 0 && tweets.numChildren() > 0 ? tweets.numChildren() / days.length : 0;
					finalMonth.push(month);
					database.ref("stats/month").child(i.toMonth()).set(month);
				} else {
					const result = stats.child(i.toMonth());
					finalMonth.push(result.exists() ? result.val() : 0);
				}
			}
			finalMonth.reverse();

			const finalJSON = {
				"times": finalHours,
				"months": finalMonth
			};

			const pyString = py.times.template({
				times: JSON.stringify(finalJSON.times, null, 4),
				months: JSON.stringify(finalJSON.months, null, 4),
				maxTime: Math.round(finalHours.max()),
				maxMonth: Math.round(finalMonth.max()),
				lastMonth: lastMonth,
				lastYear: lastYear,
				renderTime: localTime.getTime()
			});

			fs.writeFile(chartDir + "/times.py", pyString, err => {
				if (err) {
					reject(err);
					return log(err);
				}

				new BlenderJob(path.resolve(__dirname + "/../../blends/stats_time.blend"))
					.python(path.resolve(chartDir + "/times.py"))
					.save(path.resolve(chartDir + "/times.png"), err => {
						if (err) {
							reject(err);
							return log(err);
						}

						pathToChart.times = path.resolve(chartDir + "/times.png");

						const reversed = Object.keys(hours).map(key => {
							return {
								value: hours[key],
								name: key
							};
						}).sort(function (a, b) {
							return b.value - a.value;
						})[0];
						if (reversed) infos.times = reversed.name;

						resolve();
					});
			});
		});
	});
}

function bestUserFunc(tweets) {
	return new Promise((resolve, reject) => {
		const users = {};
		tweets.forEach(tweet => {
			const thing = tweet.child("user/screen_name").val();
			users[thing] ? users[thing]++ : users[thing] = 1;
		});

		const usersArray = Object.keys(users).map(key => {
			return {
				value: users[key],
				name: key
			};
		}).sort(function (a, b) {
			return b.value - a.value;
		});
		if (!usersArray[0]) return reject();

		const user = usersArray[0].name;
		const value = usersArray[0].value;

		const pyString =
			"import bpy\n" +
			"bpy.data.objects['Best'].data.body = \"@" + user + "\"\n" +
			"bpy.data.objects['Right'].particle_systems['ParticleSystem'].seed = " + Math.floor(Math.random() * 1000) + "\n" +
			"bpy.data.objects['Left'].particle_systems['ParticleSystem'].seed = " + Math.floor(Math.random() * 1000);

		fs.writeFile(chartDir + "/user.py", pyString, err => {
			if (err) {
				reject(err);
				return log(err);
			}

			new BlenderJob(path.resolve(__dirname + "/../../blends/stats_user.blend"))
				.python(chartDir + "/user.py")
				.frame(1, 84)
				.save(chartDir + "/user/frame.png", err => {
					if (err) {
						reject(err);
						return log(err);
					}
					resolve({
						path: chartDir + "/user/frame.gif",
						user: user,
						value: value
					});
				});
		});
	});
}

function getTweets(cb) {
	const query = database
		.ref()
		.child("tweets")
		.orderByChild("timestamp")
		.startAt(time.getTime() - (time.getTime().getDaysOfLastMonth() * 24 * 3600 * 1000));
	query.once("value", cb);
}

const pathToChart = {};
function createStats(callback, callback2) {
	time = new Date();
	lastMonthTime = new Date(time.getTime() - 1000 * 3600 * 24 * time.getTime().getDaysOfLastMonth());

	lastMonth = ((time.getMonth() - 1 == -1) ? 12 : (time.getMonth() - 1)).toMonth();
	lastYear = ((time.getMonth() - 1 == -1) ? time.getFullYear() - 1 : time.getFullYear());

	chartDir = path.resolve(path.join(__dirname, "/../../stats", lastYear.toString(), lastMonth.toString()));

	mkdirp(chartDir, err => {
		if (err) return log(err);
		getTweets(tweets => {
			sourceFunc(tweets).then(() => {
				return globalFunc(tweets);
			}).then(() => {
				return timesFunc(tweets);
			}).then(() => {
				callback(pathToChart, infos);
				bestUserFunc(tweets).then(callback2).catch(console.log);
			});
		});
	});
}

module.exports.charts = createStats;
module.exports.blender = BlenderJob;