let time;
let origSTATS;
let lastMonth;
let lastYear;
let chartDir;
const BlenderJob = require("./../modules/blender")(),
	log = require("./../modules/log"),
	fs = require("fs"),
	mkdirp = require("mkdirp"),
	path = require("path");

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

const paths = {
	stats: path.resolve(__dirname + "/../database/STATS.txt")
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
	sources: fs.readFileSync(path.resolve(__dirname + "/py-template/sources.py"), "utf8"),
	global: fs.readFileSync(path.resolve(__dirname + "/py-template/global.py"), "utf8"),
	times: fs.readFileSync(path.resolve(__dirname + "/py-template/times.py"), "utf8")
};

function sourceFunc(callback) {
	const localTime = new Date();
	/**
	 * Render Sources
	 */
	var numberSources = 0;
	var sources = {};
	for (var i = 0; i < origSTATS.length; i++) {
		for (var elem = 0; elem < origSTATS[i]["array"].length; elem++) {

			// if not older than one month
			if (origSTATS[i]["array"][elem]["source"] &&
				time.getTime() - origSTATS[i]["array"][elem]["timestamp"] < time.getTime().getDaysOfLastMonth() * 24 * 60 * 60 * 1000) {
				var s = origSTATS[i]["array"][elem]["source"].split(">")[1].split("<")[0].replace("Twitter ", "").replace("for ", "");
				if (!sources[s]) sources[s] = 0;
				sources[s]++;
				numberSources++;
			}
		}
	}

	var sourcesArray = [];
	for (var key in sources) {
		sourcesArray.push({
			value: sources[key],
			name: key
		});
	}
	sourcesArray = sourcesArray.sort(function (a, b) {
		return a.value - b.value;
	});
	sourcesArray.reverse();

	var perfectSource = {
		"value": [],
		"name": []
	};
	for (let i = 0; i < 6; i++) {
		if (sourcesArray[i]) {
			perfectSource["value"].push(sourcesArray[i].value / numberSources * 100);
			perfectSource["name"].push(sourcesArray[i].name);
		}
	}

	const pyString = py.sources.template({
		data: JSON.stringify(perfectSource, null, 4),
		lastMonth: lastMonth,
		lastYear: lastYear,
		renderTime: localTime.getTime()
	});

	fs.writeFile(chartDir + "/sources.py", pyString, err => {
		if (err) return log(err);

		new BlenderJob(__dirname + "\\sources.blend")
			.python(chartDir + "/sources.py")
			.save(chartDir + "/sources.png", err => {
				if (err) return log(err);

				pathToChart.source = chartDir + "/sources0001.png";
				infos.source = perfectSource["name"][0];

				callback(pathToChart.source, infos.source);
			});
	});
}

function globalFunc(callback) {
	const localTime = new Date();
	let global = {};
	for (var i = 0; i < origSTATS.length; i++) {
		for (var elem = 0; elem < origSTATS[i]["array"].length; elem++) {
			if (origSTATS[i]["array"][elem]["place"] && (time.getTime() - origSTATS[i]["array"][elem]["timestamp"]) < time.getTime().getDaysOfLastMonth() * 24 * 60 * 60 * 1000) {
				var s = origSTATS[i]["array"][elem]["place"];
				if (!global[s]) global[s] = 0;
				global[s]++;
			}
		}
	}

	const countries = [
		{ id: "AE" }, { id: "AF" }, { id: "AL" }, { id: "AM" }, { id: "AO" }, { id: "AR" }, { id: "AT" }, { id: "AU" }, { id: "AZ" }, { id: "BA" }, { id: "BD" }, { id: "BE" }, { id: "BF" }, { id: "BG" }, { id: "BI" }, { id: "BJ" }, { id: "BN" }, { id: "BO" }, { id: "BR" }, { id: "BS" }, { id: "BT" }, { id: "BW" }, { id: "BY" }, { id: "BZ" }, { id: "CA" }, { id: "CD" }, { id: "CF" }, { id: "CG" }, { id: "CH" }, { id: "CI" }, { id: "CL" }, { id: "CM" }, { id: "CN" }, { id: "CO" }, { id: "CR" }, { id: "CU" }, { id: "CY" }, { id: "CZ" }, { id: "DE" }, { id: "DJ" }, { id: "DK" }, { id: "DO" }, { id: "DZ" }, { id: "EC" }, { id: "EE" }, { id: "EG" }, { id: "EH" }, { id: "ER" }, { id: "ES" }, { id: "ET" }, { id: "FK" }, { id: "FI" }, { id: "FJ" }, { id: "FR" }, { id: "GA" }, { id: "GB" }, { id: "GE" }, { id: "GF" }, { id: "GH" }, { id: "GL" }, { id: "GM" }, { id: "GN" }, { id: "GQ" }, { id: "GR" }, { id: "GT" }, { id: "GW" }, { id: "GY" }, { id: "HN" }, { id: "HR" }, { id: "HT" }, { id: "HU" }, { id: "ID" }, { id: "IE" }, { id: "IL" }, { id: "IN" }, { id: "IQ" }, { id: "IR" }, { id: "IS" }, { id: "IT" }, { id: "JM" }, { id: "JO" }, { id: "JP" }, { id: "KE" }, { id: "KG" }, { id: "KH" }, { id: "KP" }, { id: "KR" }, { id: "XK" }, { id: "KW" }, { id: "KZ" }, { id: "LA" }, { id: "LB" }, { id: "LK" }, { id: "LR" }, { id: "LS" }, { id: "LT" }, { id: "LU" }, { id: "LV" }, { id: "LY" }, { id: "MA" }, { id: "MD" }, { id: "ME" }, { id: "MG" }, { id: "MK" }, { id: "ML" }, { id: "MM" }, { id: "MN" }, { id: "MR" }, { id: "MW" }, { id: "MX" }, { id: "MY" }, { id: "MZ" }, { id: "NA" }, { id: "NC" }, { id: "NE" }, { id: "NG" }, { id: "NI" }, { id: "NL" }, { id: "NO" }, { id: "NP" }, { id: "NZ" }, { id: "OM" }, { id: "PA" }, { id: "PE" }, { id: "PG" }, { id: "PH" }, { id: "PL" }, { id: "PK" }, { id: "PR" }, { id: "PS" }, { id: "PT" }, { id: "PY" }, { id: "QA" }, { id: "RO" }, { id: "RS" }, { id: "RU" }, { id: "RW" }, { id: "SA" }, { id: "SB" }, { id: "SD" }, { id: "SE" }, { id: "SI" }, { id: "SJ" }, { id: "SK" }, { id: "SL" }, { id: "SN" }, { id: "SO" }, { id: "SR" }, { id: "SS" }, { id: "SV" }, { id: "SY" }, { id: "SZ" }, { id: "TD" }, { id: "TF" }, { id: "TG" }, { id: "TH" }, { id: "TJ" }, { id: "TL" }, { id: "TM" }, { id: "TN" }, { id: "TR" }, { id: "TT" }, { id: "TW" }, { id: "TZ" }, { id: "UA" }, { id: "UG" }, { id: "US" }, { id: "UY" }, { id: "UZ" }, { id: "VE" }, { id: "VN" }, { id: "VU" }, { id: "YE" }, { id: "ZA" }, { id: "ZM" }, { id: "ZW" }
	];

	var finalArray = [];
	var values = [];
	for (let i = 0; i < countries.length; i++) {
		var value = 0;
		for (var key in global) {
			if (countries[i].id == key) value = global[key];
		}
		finalArray.push({
			"name": "Curve." + i.toZeros(),
			"value": value + 0
		});
		values.push(value + 0);
	}

	var max = values.max();

	var pyString = py.global.template({
		data: JSON.stringify(finalArray, null, 4),
		max: max,
		lastMonth: lastMonth,
		lastYear: lastYear,
		renderTime: localTime.getTime()
	});

	fs.writeFile(chartDir + "/global.py", pyString, err => {
		if (err) return log(err);

		new BlenderJob(__dirname + "\\global.blend")
			.python(chartDir + "/global.py")
			.save(chartDir + "/global.png", err => {
				if (err) return log(err);
				pathToChart.global = chartDir + "/global0001.png";
				for (var i = 0; i < finalArray.length; i++) {
					if (finalArray[i]["value"] == max) infos.global = countries[i].id;
				}
				callback();
			});
	});
}

function timesFunc(callback) {
	const localTime = new Date();
	var times = [];
	for (var i = 0; i < origSTATS.length; i++) {
		for (var elem = 0; elem < origSTATS[i]["array"].length; elem++) {
			if ((time.getTime() - origSTATS[i]["array"][elem]["timestamp"]) < time.getTime().getDaysOfLastMonth() * 24 * 60 * 60 * 1000) {
				var offset = -7200;
				if (origSTATS[i]["array"][elem]["offset"]) offset += origSTATS[i]["array"][elem]["offset"];
				times.push(origSTATS[i]["array"][elem]["timestamp"] + offset * 1000);
			}
		}
	}

	var hours = {};
	for (let i = 0; i < times.length; i++) {
		var hour = times[i].getHour();
		if (!hours[hour]) hours[hour] = 0;
		hours[hour]++;
	}

	var days = {};
	for (let i = 0; i < times.length; i++) {
		var date = times[i].getDate();
		if (!days[date]) days[date] = 0;
		days[date]++;
	}

	days.length = 0;
	Object.keys(days).forEach(() => days.length++);
	days.length += -1;

	const finalHours = [];
	for (let i = 0; i < 12; i++) {
		if (days.length > 0 && hours["" + (i * 2)] && hours["" + (i * 2 + 1)]) {
			finalHours.push((hours["" + (i * 2)] + hours["" + (i * 2 + 1)]) / days.length);
		}

	}
	finalHours.reverse();

	var allTimestamps = [];
	for (let i = 0; i < origSTATS.length; i++) {
		for (let elem = 0; elem < origSTATS[i]["array"].length; elem++) {
			allTimestamps.push(origSTATS[i]["array"][elem]["timestamp"]);
		}
	}

	var months = {};
	for (let i = 0; i < allTimestamps.length; i++) {
		var month = allTimestamps[i].getMonth() + 1;
		if (!months[month]) months[month] = 0;
		months[month]++;
	}

	var timesMonth = [];
	for (let i = 0; i < origSTATS.length; i++) {
		for (let elem = 0; elem < origSTATS[i]["array"].length; elem++) {
			let offset = -7200; // fixing the GMT+2
			if (origSTATS[i]["array"][elem]["offset"]) offset += origSTATS[i]["array"][elem]["offset"];
			timesMonth.push(origSTATS[i]["array"][elem]["timestamp"] + offset * 1000);
		}
	}

	var daysMonth = {};
	for (let i = 0; i < timesMonth.length; i++) {
		const date = timesMonth[i].getDate();
		const month = timesMonth[i].getMonth() + 1;
		if (!daysMonth[month]) daysMonth[month] = {};
		if (!daysMonth[month][date]) daysMonth[month][date] = 0;
		daysMonth[month][date]++;
	}

	for (let i in daysMonth) {
		daysMonth[i].length = 0;
		Object.keys(daysMonth[i]).forEach(() => daysMonth[i].length++);
		if (daysMonth[i].length > 1) daysMonth[i].length += -1;
	}

	var finalMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	for (let key in months) {
		if (months[key] && daysMonth[key]) finalMonth[11 - parseInt(key) + 1] = months[key] / daysMonth[key].length;
	}

	var finalJSON = {
		"time": finalHours,
		"month": finalMonth
	};

	var pyString = py.times.template({
		data: JSON.stringify(finalJSON, null, 4),
		maxTime: finalHours[0] >= 0 ? Math.round(finalHours.max()) : 0,
		maxMonth: Math.round(finalMonth.max()),
		lastMonth: lastMonth,
		lastYear: lastYear,
		renderTime: localTime.getTime()
	});

	fs.writeFile(chartDir + "/times.py", pyString, err => {
		if (err) return log(err);

		new BlenderJob(path.resolve(__dirname + "/time.blend"))
			.python(path.resolve(chartDir + "/times.py"))
			.save(path.resolve(chartDir + "/times.png"), err => {
				if (err) return log(err);
				pathToChart.times = path.resolve(chartDir + "/times0001.png");

				var bestHour = [];
				for (var key in hours) {
					bestHour.push({
						value: hours[key],
						name: key
					});
				}
				const reversed = bestHour.sort(function (a, b) {
					return a.value - b.value;
				}).reverse()[0];
				if (reversed) infos.times = reversed.name;
				callback();
			});
	});
}

function bestUserFunc(callback) {
	var users = {};
	for (var i = 0; i < origSTATS.length; i++) {
		for (var elem = 0; elem < origSTATS[i]["array"].length; elem++) {
			if ((time.getTime() - origSTATS[i]["array"][elem]["timestamp"]) < time.getTime().getDaysOfLastMonth() * 24 * 60 * 60 * 1000) {
				if (!users[origSTATS[i]["name"]]) users[origSTATS[i]["name"]] = 0;
				users[origSTATS[i]["name"]]++;
			}
		}
	}

	var usersArray = [];
	for (var key in users) {
		usersArray.push({
			value: users[key],
			name: key
		});
	}
	if (!usersArray[0]) return;
	
	usersArray = usersArray.sort(function (a, b) {
		return a.value - b.value;
	});
	usersArray.reverse();

	var user = usersArray[0].name;
	var value = usersArray[0].value;

	var pyString = "import bpy\n" +
		"bpy.data.objects['Best'].data.body = \"@" + user + "\"\n" +
		"bpy.data.objects['Right'].particle_systems['ParticleSystem'].seed = " + Math.floor(Math.random() * 1000) + "\n" +
		"bpy.data.objects['Left'].particle_systems['ParticleSystem'].seed = " + Math.floor(Math.random() * 1000);

	fs.writeFile(chartDir + "/user.py", pyString, err => {
		if (err) return log(err);

		new BlenderJob(__dirname + "\\user.blend")
			.python(chartDir + "/user.py")
			.frame(1, 84)
			.save(chartDir + "/user/frame.png", err => {
				if (err) log(err);
				callback(chartDir + "/user/frame.gif", {
					user: user,
					value: value
				});
			});
	});
}

const pathToChart = {};
function createChart(callback) {
	time = new Date();
	origSTATS = JSON.parse(fs.readFileSync(paths.stats));

	lastMonth = ((time.getMonth() - 1 == -1) ? 12 : (time.getMonth() - 1)).toMonth();
	lastYear = ((time.getMonth() - 1 == -1) ? time.getFullYear() - 1 : time.getFullYear());

	chartDir = __dirname + "/results/" + lastYear + "/" + lastMonth;

	mkdirp(chartDir, err => {
		if (err) return log(err);
		timesFunc(function () {
			globalFunc(function () {
				sourceFunc(function () {
					callback(pathToChart, infos);
				});
			});
		});
	});
}

exports = module.exports = function () {
	return {
		charts: createChart,
		user: bestUserFunc,
		blender: BlenderJob
	};
};