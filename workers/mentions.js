const {tweet, client, botName, stream: _stream} = require("./../modules/twitter");
const database = require("./../modules/database");
const utils = require("./../modules/utils");
const log = require("./../modules/log");
const fs = require("fs");

const now = time => {
	if (time) return new Date(time).getTime();
	else return Date.now();
};

Array.prototype.max = function () {
	return Math.max.apply(null, this);
};
Array.prototype.min = function () {
	return Math.min.apply(null, this);
};

// function quote(str) {
// 	return str.replace(/(?=[\/\\^$*+?.()|{}[\]])/g, "\\");
// }
// const regex = query => new RegExp(query);

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
			// "Thanks for the follow! Following gives you special Bratwurst priorities. \"@" + botName + " help\" for more bot information.",
			"Thanks for the follow, {{name}}! \"@" + botName + " help\" for more bot information."
		]
	},
	get(type) {
		return reply.replies[type][Math.floor(Math.random() * reply.replies[type].length)];
	}
};

const stream = client.stream("user");

/*
 * Follows
 */
stream.on("follow", function (event) {
	const name = event.source.name;
	const screenName = event.source.screen_name;

	if (screenName !== botName) {
		const status = "@" + screenName + " " + reply.get("follow").replace("{{name}}", name);
		tweet(status, err => {
			if (err) return log(err);
		});
		log("@" + screenName + " followed");
	}
});

/*
 * mention
 */
_stream("@" + botName, function (tweetObj) {
	const user = tweetObj.user;

	// is in reply to Bratwurstbot?
	const mentions = tweetObj.entities.user_mentions;
	let mentioned = false;
	for (let i = 0; i < mentions.length; i++) {
		if (mentions[i].screen_name == botName) {
			mentioned = true;
			break;
		}
	}
	if (!mentioned) return;

	const start = now(); // set timestamp of the request
	const message = tweetObj.text.toLowerCase();
	const messageHas = query => message.indexOf(query);
	const username = user.screen_name;

	// before going any further, check if this is not an echo or a retweet
	if (username === botName || /^rt/.test(message)) return;

	// now continue setting consts
	const tweetID = tweetObj.id_str;
	let ignored;
	database.isIgnored(username, _ignored => {
		if (_ignored) {
			ignored = true;
			console.log("ignored")
		} else {
			ignored = false;
			console.log("noticed")
		}
		gotIgnored();
	});
	function gotIgnored() {
		const returnValue = ["@" + username];

		tweetObj.entities.user_mentions.forEach(user => {
			if (user.screen_name !== botName)
				returnValue.push("@" + user.screen_name);
		});

		const baseValue = returnValue.join(" ");

		const send = () => {
			returnValue.push(`[${utils.time(start, now())}]`);
			tweet(returnValue.join(" "), {
				inReplyTo: tweetID
			}, err => {
				if (err) return log("ERROR: ", err);
			});
		};

		log(`MENTION: "${tweetObj.text}" by ${username}`);

		/**
		 * If first mention is bratwurst bot
		 */
		const bot_name = "@" + botName.toLowerCase();
		if (messageHas(bot_name) === 0) {
			const processed = message.replace(/@Bratwurst_Bot\s+/g, "");
			const has = (query, i) => {
				if (i !== void 0) return processed.indexOf(query) === i;
				return processed.indexOf(query) > -1;
			};

			if (has("ignore me", 0) && !ignored) {

				// Ignore user
				database.ref("ignored").child(user.id_str).set(username);
				log(`@${username} ignored`);
				returnValue.push("Sorry it had to come this far");

			} else if (has("notice me", 0) && ignored) {

				// Notice user
				database.ref("ignored").child(user.id_str).set(null);
				log(`@${username} noticed`);
				returnValue.push("Yay!");

			} else if (has("help", 0)) {

				// Return Help
				returnValue.push("There you go");
				returnValue.push(`[${utils.time(start, now())}]`);

				tweet(returnValue.join(" "), {
					media: ["images/help.jpg"],
					inReplyTo: tweetID
				}, err => {
					if (err) return log("ERROR: ", err);

					log(`@${username} requested help`);
				});
				return; // sending the tweet link it is => prevent script from sending twice

			} else if (has("?")) {

				/**
				 * Questions
				 */
				if (has("wurde die") && has("erfunden")) {

					// Wann wurde die Bratwurst erfunden
					returnValue.push(reply.get("invented"));

				} else if (has("wieso") && has("heißt") && has("bratwurst")) {

					// Wieso heißt die Bratwurst Bratwurst
					returnValue.push(reply.get("whyIsCalled"));

				} else if (has("senf oder") && has("ketchup")) {

					// Senf oder Ketchup
					returnValue.push("Senf!");

				} else if (has("wie") && (has("braten") || has("brät") || has("gebraten") || has("zubereiten")) && has("bratwurst")) {

					// Wie wird eine bratwurst gebraten
					returnValue.push("Mancher hat Angst vor geplatzter Wurst. Immer vorsichtig ganz kleine Rillen einkerben.");

				} else {

					// Default
					// returnValue.push("Auch meine Weisheit muss irgendwo ein Ende haben.");
					return;

				}

				log("ANSWER:", returnValue.join(" "));
			}
		}

		if (messageHas(bot_name + " random image") > -1) {

			// Random Image
			fs.readdir("images/bratwursts", (err, images) => {
				const index = Math.floor(Math.random() * images.length);

				returnValue.push("Have a bite");
				returnValue.push(`[${utils.time(start, now())}]`);
				tweet(returnValue.join(" "), {
					media: ["images/bratwursts/" + images[index]],
					inReplyTo: tweetID
				}, err => {
					if (err) return log("ERROR: ", err);

					log("@" + username + "requested an image. Given image /bratwursts/" + images[index]);
				});
			});
			return; // sending the tweet link it is => prevent script from sending twice

		} else if (messageHas(bot_name + " stats") > -1) {

			// Stats
			database.ref("tweets").once("value", snap => {
				const users = {};
				snap.forEach(tweet => {
					const id = tweet.child("user/id").val();
					users[id] ? users[id]++ : users[id] = 1;
				});

				const exists = !!users[user.id_str];

				const rank = [];
				let rankAt;
				Object.keys(users).forEach(key => rank.push(users[key]));
				rank.sort();
				rank.reverse();

				if (exists) {
					rankAt = rank.indexOf(users[user.id_str]) + 1;
					returnValue.push("In der Uptime von v2.0+ hast du " + users[user.id_str] + " mal über Bratwurst getwittert.");
					returnValue.push("\nDas macht dich zu Platz " + rankAt + " Weltweit");
				} else {
					returnValue.push("Du hast noch nie über Bratwurst geredet. Ich empfehle es zu versuchen.");
				}

				// tweet
				send();

				log("STATS:", returnValue.join(" "));
			});
			return;

		} else if (messageHas(bot_name + " random fact") > -1) {

			// Random fact
			returnValue.push(reply.get("random"));
			log("RANDOM FACT:", returnValue.join(" "));

		}

		// Send Tweet
		if (returnValue.join(" ") !== baseValue) {
			send();
		}
	}
});

// catch stream errors
stream.on("warning", function (warning) {
	log(warning);
	stream.stop();
	setTimeout(() => stream.start(), 10000);
});
stream.on("disconnect", function (disconnectMessage) {
	log(disconnectMessage);
	stream.stop();
	setTimeout(() => stream.start(), 10000);
});

log("Mentions worker is listening");