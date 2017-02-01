function bestUserFunc(tweets) {
	return new Promise((resolve, reject) => {
		const users = {};
		tweets.forEach(tweet => {
			if (!users[tweet.child("user/screen_name").exists()])
				users[tweet.child("user/screen_name").val()] = 0;
			users[tweet.child("user/screen_name").val()]++;
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