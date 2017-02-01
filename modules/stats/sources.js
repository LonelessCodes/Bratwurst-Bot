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
			if (!sources[s]) sources[s] = 0;
			sources[s]++;
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

					pathToChart.source = chartDir + "/sources0001.png";
					infos.source = perfectSource["name"][0];

					resolve();
				});
		});
	});
}