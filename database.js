module.exports.userExists = function (username, callback) {
	process.emit({
		database: true,
		userExists: true,
		username: username
	});
	const func = function (data) {
		if (data.database && data.userExists) {
			process.removeListener("message", func);

			callback(data.response);
		}
	};
	process.on("message", func);
};

module.exports.get = function (table, where, isValue, callback) {
	process.emit({
		database: true,
		get: true,
		table: table,
		where: where,
		is: isValue
	});
	const func = function (data) {
		if (data.database && data.get) {
			process.removeListener("message", func);

			callback(data.response);
		}
	};
	process.on("message", func);
};

module.exports.update = function (table, where, isValue, callback) {
	process.emit({
		database: true,
		get: true,
		table: table,
		where: where,
		is: isValue
	});
	const func = function (data) {
		if (data.database && data.get) {
			process.removeListener("message", func);

			callback(data.response);
		}
	};
	process.on("message", func);
};