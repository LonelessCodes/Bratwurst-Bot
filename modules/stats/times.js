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
					console.log(finalMonth, i, i.toMonth(), month, days.length, tweets.numChildren());
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

						pathToChart.times = path.resolve(chartDir + "/times0001.png");

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