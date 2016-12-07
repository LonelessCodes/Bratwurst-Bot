const {readdirSync, readFileSync, writeFile, rename} = require("fs");
const dbpath = "database/";

/**
 * Initializing the cache
 * gotta polish this till it is a real cacher
 */
const db = {};
const files = readdirSync(dbpath).filter(file => {
	const name = file.toLowerCase().replace(".txt", "");
	if (file.indexOf(".txt1") > -1 || file.indexOf(".txt2") > -1) 
		return false;
	try {
		db[name] = JSON.parse(readFileSync(dbpath + file));
	} catch (err) {
		db[name] = JSON.parse(readFileSync(dbpath + file + "1"));
	}
	return true;
});

function updateCache() {
	Object.keys(db).forEach((name, i) => {
		const file = files[i];
		rename(dbpath + file + "1", dbpath + file + "2", () => 
			rename(dbpath + file, dbpath + file + "1", () => 
				writeFile(dbpath + file, JSON.stringify(db[name]))));
	});
}
setInterval(updateCache, 1000 * 60 * 2);

exports = module.exports = {
	ignored(name) {
		return db["ignore"].includes(name);
	},
	userExists(name) {
		for (let i = 0; i < db["allusers"].length; i++) 
			if (db["stats"][i]["name"] == name) return i;
	},
	push(key, data) {
		db[key].push(data);
		return db[key].length - 1;
	},
	update(key, index, data) {
		switch (key) {
		case "stats":
			if(db["stats"][index])		
				for (let key in data) {
					db["stats"][index][key] = data[key];
				}
			break;
		default:
			if(db[key][index]){
				db[key][index] = data;
			}
			break;
		}
		return module.exports;
	},
	del(key, data) {
		const index = db[key].indexOf(data);
		if (index > -1) {
			db[key].splice(index, 1);
			return true;
		} else {
			return false;
		}
	},
	get(key, data, sub) {
		switch (key) {
		case "stats":
			if (db["stats"].length > 0)
				for (let i = 0; i < db["stats"].length; i++)
					if (db["stats"][i][sub] == data) {
						return i;
					}
		}
	},
	length(key) {
		return db[key].length;
	},
	byIndex(key, index) {
		return db[key][index];
	}
};
