const {stream, tweet} = require("./../modules/twitter");
const database = require("./../modules/database");
const log = require("./../modules/log");
const fs = require("fs");

const now = time => {
	if (time) return new Date(time).getTime();
	else return new Date().getTime();
};

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

/*
 * mention
 */

const reply = {
	replies: {
		invented: [
			"Die Bratwurst wurde in 1404 zum ersten mal erwäht.",
			"1404 wurde das Phänomen \"Bratwrust\" zum ersten mal erwähnt."
		],
		whyIsCalled: [
			"Das alte Wort \"Brät\", was \"schieres\" bedeutet (fein verarbeitetes Fleisch ohne Knochen & Fett), verleiht ihr den Namen."
		],
		random: [
			"Das alte Wort \"Brät\", was \"schieres\" bedeutet (fein verarbeitetes Fleisch ohne Knochen & Fett), verleiht ihr den Namen.",
			"Die Bratwurst wurde in 1404 zum ersten mal erwäht.",
			"Sie ist das beliebteste Grillprodukt für die Deutschen. Die Bockwurst mit weiten Abstand auf Platz 2.",
			"Ein Bundesbürger isst im Durchschnitt fast 84 Bratwürste pro Jahr, dass sind 1,6 pro Woche.",
			"Die Deutschen bezeichnen sich ja gerne mal als Grillmeister, im Durchschnitt grillt der Deutsche aber nur 6-mal im Jahr.",
			"Es gibt rund 1.500 verschiedene Bratwurstsorten. Darunter auch welche mit Alkohol, z.B. die Jack Daniel's Currywurst.",
			"Bratwürste gibt es in roher und gebrühter Form, wobei die gebrühte Form verbreiteter ist."
		],
		follow: [
			"Thanks for the follow! Following gives you special Bratwurst priorities. \"@Bratwurst_bot help\" for more bot information."
		]
	},
	get(type) {
		return reply.replies[type][Math.floor(Math.random() * reply.replies[type].length)];
	}
};

/**
 * Listen for conversations
 */
var mentions = stream("@Bratwurst_bot", function (tweetObj) {
	const start = now(); // set timestamp of the request
	const message = tweetObj.text.toLowerCase();
	const messageHas = query => {
		return message.indexOf(query);
	};
	const username = tweetObj.user.screen_name;

	// before going any further, check if this is not an echo or a retweet
	if (username === "Bratwurst_bot" || messageHas("rt @") === 0) return;

	// now continue setting consts
	const tweetID = tweetObj.id_str;
	const ignored = database.ignored(username);
	const returnValue = ["@" + username];
	const baseValue = returnValue[0];

	tweetObj.entities.user_mentions.forEach(user => {
		if (user.screen_name !== "Bratwurst_bot")
			returnValue.push("@" + user.screen_name);
	});

	log(`MENTION: "${tweetObj.text}" by ${tweetObj.user.screen_name}`);

	/**
	 * If first mention is bratwurst bot
	 */
	const bot_name = "@bratwurst_bot";
	if (messageHas(bot_name) === 0) {
		if (messageHas("ignore me") === bot_name.length + 1 && !ignored) {

			// Ignore user
			database.push("ignore", username);
			log(`@${username} ignored`);
			returnValue.push("We're sorry it had to come this far");

		} else if (messageHas("notice me") === bot_name.length + 1 && ignored) {

			// Notice user
			if (database.del("ignore", username)) {
				log(`@${username} noticed`);
				returnValue.push("Yay!");
			}

		} else if (messageHas("help") === bot_name.length + 1) {

			// Return Help
			returnValue.push("There you go");
			returnValue.push(`[${now() - start}ms]`);

			tweet(returnValue.join(" "), {
				media: ["imgs/help.jpg"],
				inReplyTo: tweetID
			}, err => {
				if (err) return log("ERROR: ", err);

				log(`@${username} requested help`);
			});
			return; // sending the tweet link it is => prevent script from sending twice

		} else if (messageHas("?") > -1) {

			/**
			 * Questions
			 */
			if (messageHas("wurde die") > -1 && messageHas("erfunden") > -1) {

				// Wann wurde die Bratwurst erfunden
				returnValue.push(reply.get("invented"));

			} else if (messageHas("wieso") > -1 && messageHas("heißt") > -1 && messageHas("bratwurst") > -1) {

				// Wieso heißt die Bratwurst Bratwurst
				returnValue.push(reply.get("whyIsCalled"));

			} else if (messageHas("senf oder") > -1 && messageHas("ketchup") > -1) {

				// Senf oder Ketchup
				returnValue.push("Senf!");

			} else if (messageHas("wie") > -1 && (messageHas("braten") > -1 || messageHas("brät") > -1 || messageHas("gebraten") > -1 || messageHas("zubereiten") > -1) && messageHas("bratwurst") > -1) {

				// Wie wird eine bratwurst gebraten
				returnValue.push("Mancher hat Angst vor geplatzter Wurst. Immer vorsichtig ganz kleine Rillen einkerben.");

			} else {

				// Default
				returnValue.push("Auch meine Weisheit muss irgendwo ein Ende haben.");

			}

			log("ANSWER:", returnValue.join(" "));
		}
	}

	if (messageHas("@bratwurst_bot random image") > -1) {

		// Random Image
		fs.readDir("bratwursts", (err, images) => {
			const index = Math.floor(Math.random() * images.length);

			returnValue.push("Have a bite");
			returnValue.push(`[${now() - start}ms]`);
			tweet(returnValue.join(" "), {
				media: ["bratwursts/" + images[index]],
				inReplyTo: tweetID
			}, err => {
				if (err) return log("ERROR: ", err);

				log("@" + username + "requested an image. Given image /bratwursts/" + images[index]);
			});
		});
		return; // sending the tweet link it is => prevent script from sending twice

	} else if (messageHas("@bratwurst_bot stats") > -1) {

		// Stats
		const exists = database.get("stats", username, "name");

		const rank = [];
		let rankAt;
		for (let i = 0; i < database.length("stats"); i++)
			rank.push(database.byIndex("stats", i).array.length);
		rank.sort();
		rank.reverse();

		if (exists) {
			rankAt = rank.indexOf(database.byIndex("stats", exists).array.length) + 1;
			returnValue.push("In der Uptime von v2.0+ hast du " + database.byIndex("stats", exists).array.length + " mal über Bratwurst getwittert.");
			returnValue.push("\nDas macht dich zu Platz " + rankAt + " Weltweit");
		} else {
			returnValue.push("Du hast noch nie über Bratwurst geredet. Ich empfehle es zu versuchen.");
		}

		log("STATS:", returnValue.join(" "));

	} else if (messageHas("@bratwurst_bot random fact") > -1) {

		// Random fact
		returnValue.push(reply.get("random"));
		log("RANDOM FACT:", returnValue.join(" "));

	}

	// Send Tweet
	if (returnValue.join(" ") !== baseValue) {
		returnValue.push(`[${now() - start}ms]`);
		tweet(returnValue.join(" "), {
			inReplyTo: tweetID
		}, err => {
			if (err) return log("ERROR: ", err);
		});
	}
});
mentions.on("disconnect", function (disconnectMessage) {
	mentions.stop();
	setTimeout(() => mentions.start(), 10000);
	log(disconnectMessage);
});
mentions.on("warning", function (warning) {
	mentions.stop();
	setTimeout(() => mentions.start(), 10000);
	log(warning);
});

log("Mentions worker is listening");