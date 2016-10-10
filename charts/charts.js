var time,
	origSTATS,
	lastMonth,
	lastYear,
	chartDir,
	Blender = require("./../blender"),
	b3d = new Blender("E:/Programs/Blender/blender.exe"),
	fs = require('fs'),
	mkdirp = require('mkdirp');

var pathToChart = {

};
var infos = {

};

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

/**
 * Create Dir for Maps
 */
Number.prototype.toMonth = function () {
	if (this < 12) {
		var name = [
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
}
Number.prototype.getDaysOfLastMonth = function () {
	var a = new Date(this);
	var year = a.getFullYear();
	var month = a.getMonth();
	if (month == 0) {
		month = 12;
		year = year - 1;
	}
    return new Date(year, month, 0).getDate();
}
Number.prototype.getDaysOfMonth = function () {
	var a = new Date(this);
	var year = a.getFullYear();
	var month = a.getMonth();
    return new Date(year, month, 0).getDate();
}

var sourceFunc = function (callback) {
	var localTime = new Date();
	/**
	 * Render Sources
	 */
	var numberSources = 0;
	var sources = {};
	for (var i = 0; i < origSTATS.length; i++) {
		for (var elem = 0; elem < origSTATS[i]["array"].length; elem++) {
			if (origSTATS[i]["array"][elem]["source"] && (time.getTime() - origSTATS[i]["array"][elem]["timestamp"]) < time.getTime().getDaysOfLastMonth() * 24 * 60 * 60 * 1000) {
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
	for (var i = 0; i < 6; i++) {
		perfectSource["value"].push(sourcesArray[i].value / numberSources * 100);
		perfectSource["name"].push(sourcesArray[i].name);
	}

	var pyString = "" +
		"import bpy\n" +
		"import time\n" +

		"data = " + JSON.stringify(perfectSource, null, 4) + "\n" +

		"bpy.data.objects['SourcesMax'].data.body = str(round(data[\"value\"][0], 1)) + \"%\"\n" +
		"bpy.data.objects['SourcesMiddle'].data.body = str(round(data[\"value\"][0] / 2, 1)) + \"%\"\n" +
		"bpy.data.objects['SourceText'].data.body = \"Most used apps to tweet about Bratwurst in " + lastMonth + ", " + lastYear + "\"\n\n" +

		"for i in range(6):\n" +
		"    bpy.data.objects['BarText.00' + str(i)].data.body = data[\"name\"][i]\n" +
		"    bpy.data.objects['Bar.00' + str(i)].scale[1] = data[\"value\"][i] / data[\"value\"][0]\n" +

		"time = \"generated in \" + str(round(time.time() * 1000) - " + localTime.getTime() + ") + \"ms\"\n" +
		"bpy.data.objects['TimeTaken'].data.body = time";

	fs.writeFile(chartDir + "/sources.py", pyString, function (err, data) {
		if (err) return console.log(err);

		b3d.renderImage(__dirname + "\\sources.blend", chartDir + "/sources.py", chartDir + "/sources.png", function (err) {
			if (err) return console.log(err);
			pathToChart.source = chartDir + "/sources0001.png";
			infos.source = perfectSource["name"][0];
			callback();
		});
	});
};

var globalFunc = function (callback) {
	var localTime = new Date();
	var globalAll = 0;
	var global = {};
	for (var i = 0; i < origSTATS.length; i++) {
		for (var elem = 0; elem < origSTATS[i]["array"].length; elem++) {
			if (origSTATS[i]["array"][elem]["place"] && (time.getTime() - origSTATS[i]["array"][elem]["timestamp"]) < time.getTime().getDaysOfLastMonth() * 24 * 60 * 60 * 1000) {
				var s = origSTATS[i]["array"][elem]["place"];
				if (!global[s]) global[s] = 0;
				global[s]++;
				globalAll++;
			}
		}
	}

	var countries = [
		{ id: "AE" }, { id: "AF" }, { id: "AL" }, { id: "AM" }, { id: "AO" }, { id: "AR" }, { id: "AT" }, { id: "AU" }, { id: "AZ" }, { id: "BA" }, { id: "BD" }, { id: "BE" }, { id: "BF" }, { id: "BG" }, { id: "BI" }, { id: "BJ" }, { id: "BN" }, { id: "BO" }, { id: "BR" }, { id: "BS" }, { id: "BT" }, { id: "BW" }, { id: "BY" }, { id: "BZ" }, { id: "CA" }, { id: "CD" }, { id: "CF" }, { id: "CG" }, { id: "CH" }, { id: "CI" }, { id: "CL" }, { id: "CM" }, { id: "CN" }, { id: "CO" }, { id: "CR" }, { id: "CU" }, { id: "CY" }, { id: "CZ" }, { id: "DE" }, { id: "DJ" }, { id: "DK" }, { id: "DO" }, { id: "DZ" }, { id: "EC" }, { id: "EE" }, { id: "EG" }, { id: "EH" }, { id: "ER" }, { id: "ES" }, { id: "ET" }, { id: "FK" }, { id: "FI" }, { id: "FJ" }, { id: "FR" }, { id: "GA" }, { id: "GB" }, { id: "GE" }, { id: "GF" }, { id: "GH" }, { id: "GL" }, { id: "GM" }, { id: "GN" }, { id: "GQ" }, { id: "GR" }, { id: "GT" }, { id: "GW" }, { id: "GY" }, { id: "HN" }, { id: "HR" }, { id: "HT" }, { id: "HU" }, { id: "ID" }, { id: "IE" }, { id: "IL" }, { id: "IN" }, { id: "IQ" }, { id: "IR" }, { id: "IS" }, { id: "IT" }, { id: "JM" }, { id: "JO" }, { id: "JP" }, { id: "KE" }, { id: "KG" }, { id: "KH" }, { id: "KP" }, { id: "KR" }, { id: "XK" }, { id: "KW" }, { id: "KZ" }, { id: "LA" }, { id: "LB" }, { id: "LK" }, { id: "LR" }, { id: "LS" }, { id: "LT" }, { id: "LU" }, { id: "LV" }, { id: "LY" }, { id: "MA" }, { id: "MD" }, { id: "ME" }, { id: "MG" }, { id: "MK" }, { id: "ML" }, { id: "MM" }, { id: "MN" }, { id: "MR" }, { id: "MW" }, { id: "MX" }, { id: "MY" }, { id: "MZ" }, { id: "NA" }, { id: "NC" }, { id: "NE" }, { id: "NG" }, { id: "NI" }, { id: "NL" }, { id: "NO" }, { id: "NP" }, { id: "NZ" }, { id: "OM" }, { id: "PA" }, { id: "PE" }, { id: "PG" }, { id: "PH" }, { id: "PL" }, { id: "PK" }, { id: "PR" }, { id: "PS" }, { id: "PT" }, { id: "PY" }, { id: "QA" }, { id: "RO" }, { id: "RS" }, { id: "RU" }, { id: "RW" }, { id: "SA" }, { id: "SB" }, { id: "SD" }, { id: "SE" }, { id: "SI" }, { id: "SJ" }, { id: "SK" }, { id: "SL" }, { id: "SN" }, { id: "SO" }, { id: "SR" }, { id: "SS" }, { id: "SV" }, { id: "SY" }, { id: "SZ" }, { id: "TD" }, { id: "TF" }, { id: "TG" }, { id: "TH" }, { id: "TJ" }, { id: "TL" }, { id: "TM" }, { id: "TN" }, { id: "TR" }, { id: "TT" }, { id: "TW" }, { id: "TZ" }, { id: "UA" }, { id: "UG" }, { id: "US" }, { id: "UY" }, { id: "UZ" }, { id: "VE" }, { id: "VN" }, { id: "VU" }, { id: "YE" }, { id: "ZA" }, { id: "ZM" }, { id: "ZW" }
	];

	var finalArray = [];
	var values = [];
	for (var i = 0; i < countries.length; i++) {
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

	var pyString = "" +
		"import bpy\n" +
		"import time\n" +

		"def withZero(number):\n" +
		"    if number < 10:\n" +
		"        return \"0\" + str(number)\n" +
		"    else:\n" +
		"        return str(number)\n" +

		"def makeMaterial(name, diffuse):\n" +
		"    mat = bpy.data.materials.new(name=name)\n" +
		"    mat.diffuse_color = diffuse\n" +
		"    mat.diffuse_intensity = 1.0 \n" +
		"    mat.use_shadeless = True\n" +
		"    return mat\n" +

		"def setMaterial(ob, mat):\n" +
		"    me = ob.data\n" +
		"    me.materials.append(mat)\n" +

		"data = " + JSON.stringify(finalArray, null, 4) + "\n" +

		"max = " + max + "\n" +

		"bpy.data.objects['Max'].data.body = str(max)\n" +
		"bpy.data.objects['Min'].data.body = \"0\"\n" +
		"bpy.data.objects['SourceText'].data.body = \"Number of Bratwurst tweets with geo tag sent in " + lastMonth + ", " + lastYear + " by country\"\n" +

		"for i in data:\n" +
		"    material = makeMaterial(\"World\", [1, 1 - (1 - .527231) * (i[\"value\"] / max), 1 - (1 - 0.073239) * (i[\"value\"] / max)])\n" +
		"    object = bpy.data.objects[i[\"name\"]]\n" +
		"    setMaterial(object, material)\n" +

		"timeend = \"generated in \" + str(round(time.time() * 1000) - " + localTime.getTime() + ") + \"ms\"\n" +
		"bpy.data.objects['TimeTaken'].data.body = timeend";

	fs.writeFile(chartDir + "/global.py", pyString, function (err, data) {
		if (err) return console.log(err);

		b3d.renderImage(__dirname + "\\global.blend", chartDir + "/global.py", chartDir + "/global.png", function (err) {
			if (err) return console.log(err);
			pathToChart.global = chartDir + "/global0001.png";
			for (var i = 0; i < finalArray.length; i++) {
				if (finalArray[i]["value"] == max) infos.global = countries[i].id;
			}
			callback();
		});
	});
};

var timesFunc = function (callback) {
	var localTime = new Date();
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
	for (var i = 0; i < times.length; i++) {
		var hour = times[i].getHour();
		if (!hours[hour]) hours[hour] = 0;
		hours[hour]++;
	}

	var days = {};
	for (var i = 0; i < times.length; i++) {
		var date = times[i].getDate();
		if (!days[date]) days[date] = 0;
		days[date]++;
	}

	days.length = 0;
	for (var key in days) days.length++;
	days.length += -1;

	finalHours = [];
	for (var i = 0; i < 12; i++) finalHours.push((hours["" + (i * 2)] + hours["" + (i * 2 + 1)]) / days.length);
	finalHours.reverse();

	var allTimestamps = [];
	for (var i = 0; i < origSTATS.length; i++) {
		for (var elem = 0; elem < origSTATS[i]["array"].length; elem++) {
			allTimestamps.push(origSTATS[i]["array"][elem]["timestamp"]);
		}
	}

	var months = {};
	for (var i = 0; i < allTimestamps.length; i++) {
		var month = allTimestamps[i].getMonth() + 1;
		if (!months[month]) months[month] = 0;
		months[month]++;
	}

	var timesMonth = [];
	for (var i = 0; i < origSTATS.length; i++) {
		for (var elem = 0; elem < origSTATS[i]["array"].length; elem++) {
			var offset = -7200;
			if (origSTATS[i]["array"][elem]["offset"]) offset += origSTATS[i]["array"][elem]["offset"];
			timesMonth.push(origSTATS[i]["array"][elem]["timestamp"] + offset * 1000);
		}
	}

	var daysMonth = {};
	for (var i = 0; i < timesMonth.length; i++) {
		var date = timesMonth[i].getDate();
		var month = timesMonth[i].getMonth() + 1;
		if (!daysMonth[month]) daysMonth[month] = {};
		if (!daysMonth[month][date]) daysMonth[month][date] = 0;
		daysMonth[month][date]++;
	}

	for (var i in daysMonth) {
		daysMonth[i].length = 0;
		for (var key in daysMonth[i]) daysMonth[i].length++;
		if (daysMonth[i].length > 1) daysMonth[i].length += -1;
	}

	var finalMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	for (var key in months) {
		finalMonth[11 - parseInt(key) + 1] = months[key] / daysMonth[key].length;
	}

	var finalJSON = {
		"time": finalHours,
		"month": finalMonth
	};

	var pyString = "" +
		"import bpy\n" +
		"import time\n" +

		"def withZero(number):\n" +
		"    if number < 10:\n" +
		"        return \"0\" + str(number)\n" +
		"    else:\n" +
		"        return str(number)\n\n" +

		"def makeMaterial(name, diffuse):\n" +
		"    mat = bpy.data.materials.new(name=name)\n" +
		"    mat.diffuse_color = diffuse\n" +
		"    mat.diffuse_intensity = 1.0\n" +
		"    mat.use_shadeless = True\n" +
		"    return mat\n\n" +

		"def setMaterial(ob, mat):\n" +
		"    me = ob.data\n" +
		"    me.materials.append(mat)\n\n" +

		"def scale(obj, value):\n" +
		"    obj.scale[0] = value\n" +
		"    obj.scale[1] = value\n\n" +

		"def changeColor(r, g, b, val, max):\n" +
		"    return [1 - (1 - r) * (val / max), 1 - (1 - g) * (val / max), 1 - (1 - b) * (val / max)]\n\n" +

		"data = " + JSON.stringify(finalJSON, null, 4) + "\n" +

		"maxTime = " + Math.round(finalHours.max()) + "\n" +
		"maxMonth = " + Math.round(finalMonth.max()) + "\n" +

		"bpy.data.objects[\"DayMax\"].data.body = str(maxTime)\n" +
		"bpy.data.objects[\"MonthMax\"].data.body = str(maxMonth)\n" +
		"bpy.data.objects['Title'].data.body = \"Bratwurst Stats of " + lastMonth + ", " + lastYear + "\"\n" +

		"elem = 0\n" +
		"for i in data[\"time\"]:\n" +
		"    material = makeMaterial(\"Time\", changeColor(1, 0.527231, 0.073239, i, maxTime))\n" +
		"    object = bpy.data.objects[\"DayPie.0\" + withZero(elem)]\n" +
		"    scale(object, (i / maxTime) / 3 * 2 + 1 / 3)\n" +
		"    setMaterial(object, material)\n" +
		"    elem += 1\n\n" +

		"elem = 0\n" +
		"for i in data[\"month\"]:\n" +
		"    material = makeMaterial(\"Month\", changeColor(0.187063, 0.528533, 0.206574, i, maxMonth))\n" +
		"    object = bpy.data.objects[\"MonthPie.0\" + withZero(elem)]\n" +
		"    scale(object, (i / maxMonth) / 3 * 2 + 1 / 3)\n" +
		"    setMaterial(object, material)\n" +
		"    elem += 1\n\n" +

		"timeend = \"generated in \" + str(round(time.time() * 1000) - " + localTime.getTime() + ") + \"ms\"\n" +
		"bpy.data.objects['TimeTaken'].data.body = timeend";

	fs.writeFile(chartDir + "/times.py", pyString, function (err, data) {
		if (err) return console.log(err);

		b3d.renderImage(__dirname + "\\time.blend", chartDir + "/times.py", chartDir + "/times.png", function (err) {
			if (err) return console.log(err);
			pathToChart.times = chartDir + "/times0001.png";
			var bestHour = [];
			for (var key in hours) {
				bestHour.push({
					value: hours[key],
					name: key
				});
			}
			infos.times = bestHour.sort(function (a, b) {
				return a.value - b.value;
			}).reverse()[0].name;
			callback();
		});
	});
};

var bestUserFunc = function (callback) {
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

	fs.writeFile(chartDir + "/user.py", pyString, function (err, data) {
		if (err) return console.log(err);

		b3d.renderAnim(__dirname + "\\user.blend", chartDir + "/user.py", chartDir + "/user/frame.png", {
			start: 1,
			end: 84
		}, function (err) {
			if (err) console.log(err);
			callback(chartDir + "/user/frame.gif", {
				user: user,
				value: value
			});
		});
	});
};

var init = function (callback) {
	time = new Date();
	origSTATS = JSON.parse(fs.readFileSync(__dirname + '/../STATS.txt'));

	lastMonth = ((time.getMonth() - 1 == -1) ? 12 : (time.getMonth() - 1)).toMonth();
	lastYear = ((time.getMonth() - 1 == -1) ? time.getFullYear() - 1 : time.getFullYear());

	chartDir = __dirname + "/" + lastYear + "/" + lastMonth;

	mkdirp(chartDir, function (err) {
		timesFunc(function () {
			globalFunc(function () {
				sourceFunc(function () {
					callback(pathToChart, infos);
				});
			});
		});
	});
};

module.exports = function () {
	return {
		charts: init,
		user: bestUserFunc,
		b3d: b3d
	};
};