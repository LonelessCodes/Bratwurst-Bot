const {readFileSync, writeFile, rename} = require("fs");
const dbpath = "database/";

/**
 * Initializing the cache
 * gotta polish this till it is a real cacher
 */
let IGNORE =   JSON.parse(readFileSync(dbpath + "IGNORE.txt"));
let ALLUSERS = JSON.parse(readFileSync(dbpath + "ALLUSERS.txt"));
let STATS =    JSON.parse(readFileSync(dbpath + "STATS.txt"));

if (typeof IGNORE != "object" || typeof ALLUSERS != "object" || typeof STATS != "object") {
	IGNORE =   JSON.parse(readFileSync(dbpath + "IGNORE.txt1"));
	ALLUSERS = JSON.parse(readFileSync(dbpath + "ALLUSERS.txt1"));
	STATS =    JSON.parse(readFileSync(dbpath + "STATS.txt1"));
}

function updateCache() {
	rename(dbpath + "IGNORE.txt1", dbpath + "IGNORE.txt2", () => {
		rename(dbpath + "IGNORE.txt", dbpath + "IGNORE.txt1", () => {
			writeFile(dbpath + "IGNORE.txt", JSON.stringify(IGNORE));
		});
	});
	
	rename(dbpath + "ALLUSERS.txt1", dbpath + "ALLUSERS.txt2", () => {
		rename(dbpath + "ALLUSERS.txt", dbpath + "ALLUSERS.txt1", () => {
			writeFile(dbpath + "ALLUSERS.txt", JSON.stringify(ALLUSERS));
		});
	});

	rename(dbpath + "STATS.txt1", dbpath + "STATS.txt2", () => {
		rename(dbpath + "STATS.txt", dbpath + "STATS.txt1", () => {
			writeFile(dbpath + "STATS.txt", JSON.stringify(STATS));
		});
	});
}
setInterval(updateCache, 1000 * 60 * 2);

exports = module.exports = {
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