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

					pathToChart.global = chartDir + "/global0001.png";
					for (var i = 0; i < finalArray.length; i++) {
						if (finalArray[i]["value"] == max) infos.global = countries[i].id;
					}

					resolve();
				});
		});
	});
}