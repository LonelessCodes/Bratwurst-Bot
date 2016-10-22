const {readFileSync, writeFile, rename} = require("fs");
const log = require("./log");

/**
 * Initializing the cache
 * gotta polish this till it is a real cacher
 */
let IGNORE = JSON.parse(readFileSync("../database/IGNORE.txt")),
	ALLUSERS = JSON.parse(readFileSync("../database/ALLUSERS.txt")),
	STATS = JSON.parse(readFileSync("../database/STATS.txt"));

if (typeof IGNORE != "object" || typeof ALLUSERS != "object" || typeof STATS != "object") {
	IGNORE = JSON.parse(readFileSync("../database/IGNORE.txt1"));
	ALLUSERS = JSON.parse(readFileSync("../database/ALLUSERS.txt1"));
	STATS = JSON.parse(readFileSync("../database/STATS.txt1"));
}

function updateCache() {
	rename("../database/IGNORE.txt1", "../database/IGNORE.txt2", err => {
		if (err) return log(err);
		rename("../database/IGNORE.txt", "../database/IGNORE.txt1", err => {
			if (err) return log(err);
			writeFile("../database/IGNORE.txt", JSON.stringify(IGNORE, null, 4), err => {
				if (err) return log(err);
			});
		});
	});
	rename("../database/ALLUSERS.txt1", "../database/ALLUSERS.txt2", err => {
		if (err) return log(err);
		rename("../database/ALLUSERS.txt", "../database/ALLUSERS.txt1", err => {
			if (err) return log(err);
			writeFile("../database/ALLUSERS.txt", JSON.stringify(ALLUSERS, null, 4), err => {
				if (err) return log(err);
			});
		});
	});
	rename("../database/STATS.txt1", "../database/STATS.txt2", err => {
		if (err) return log(err);
		rename("../database/STATS.txt", "../database/STATS.txt1", err => {
			if (err) return log(err);
			writeFile("../database/STATS.txt", JSON.stringify(STATS, null, 4), err => {
				if (err) return log(err);
			});
		});
	});
}
setInterval(updateCache, 1000 * 60 * 2);

module.exports = {
	ignored(name) {
		return IGNORE.indexOf(name) > -1;
	},
	userExists(name) {
		for (let i = 0; i < ALLUSERS.length; i++) {
			if (STATS[i]["name"] == name) {
				return i;
			}
		}
	},
	push(key, data) {
		switch (key) {
		case "stats":
			STATS.push(data);
			return STATS.length - 1;
		case "users":
			ALLUSERS.push(data);
			return STATS.length - 1;
		case "ignore":
			IGNORE.push(data);
			return STATS.length - 1;
		}
	},
	update(key, index, data) {
		switch (key) {
		case "stats":
			if(STATS[index])		
				for (let key in data) {
					STATS[index][key] = data[key];
				}
			break;
		case "users":
			if(ALLUSERS[index]){
				ALLUSERS[index] = data;
			}
			break;
		case "ignore":
			if(IGNORE[index]){
				IGNORE[index] = data;
			}
			break;
		}
		return module.exports;
	},
	del(key, data) {
		const index = IGNORE.indexOf(data);
		switch (key) {
		case "ignore":
			if (index > -1) {
				IGNORE.splice(index, 1);
				return true;
			} else {
				return false;
			}
		}
	},
	get(key, data, sub) {
		switch (key) {
		case "stats":
			if (STATS.length > 0)
				for (let i = 0; i < STATS.length; i++)
					if (STATS[i][sub] == data) {
						return i;
					}
		}
	},
	length(key) {
		switch (key) {
		case "stats":
			return STATS.length;
		case "users":
			return ALLUSERS.length;
		case "ignore":
			return IGNORE.length;
		}
	},
	byIndex(key, index) {
		switch (key) {
		case "stats":
			return STATS[index];
		case "users":
			return ALLUSERS[index];
		case "ignore":
			return IGNORE[index];
		}
	}
};