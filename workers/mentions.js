const twitter = require("../modules/twitter");
const database = require("../modules/database");
const utils = require("../modules/utils");
const log = require("../modules/log");
const fs = require("fs");
const { promisify } = require("util");

const now = time => {
    if (time !== void 0) return new Date(time).getTime();
    else return Date.now();
};

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
            "Thanks for the follow, {{name}}! 🎉 \"@" + twitter.botName + " help\" for more bot information."
        ]
    },
    get(type) {
        return reply.replies[type][Math.floor(Math.random() * reply.replies[type].length)];
    }
};

/*
 * mention
 */
async function ontweet(tweetObj, user) {
    const start = now(); // set timestamp of the request
    let message = tweetObj.text.toLowerCase();
    const messageHas = message.indexOf;
    const username = user.screen_name;

    if (username === twitter.botName || /^rt/.test(message)) return;

    // some people accidentially use double spaces for weird reasons :/
    while (message.indexOf("  ") > -1) message = message.replace("  ", " ");

    const tweetID = tweetObj.id_str;
    const ignored = await database.isIgnoredNoThrow(username);

    const returnValue = ["@" + username];
    for (let user of tweetObj.entities.user_mentions)
        if (user.screen_name !== twitter.botName)
            returnValue.push("@" + user.screen_name);
    const baseValue = returnValue.join(" ");

    // send function
    const params = {
        inReplyTo: tweetID
    };
    function send() {
        returnValue.push(`[${utils.time(start, now())}]`);
        return twitter.tweet(returnValue.join(" "), params).catch(err => {
            if (err) return log("ERROR: ", err);
        });
    }

    log(`MENTION: "${tweetObj.text}" by ${username}`, "Ignored:", ignored);

    /**
     * If first mention is bratwurst bot
     */
    const bot_name = "@" + twitter.botName.toLowerCase();
    if (messageHas(bot_name) === 0) {
        const processed = message.replace(new RegExp(`(\@${twitter.botName} )`, "gi"), "");
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
                return;

            }

            log("ANSWER:", returnValue.join(" "));
        }
    }

    // if else group that allows for tweets like "@Silvea12 @LonelessArt @Bratwurst_bot random image". 
    // So it works when put in the middle of tweet
    if (messageHas(bot_name + " help") > -1) {

        // Return Help
        returnValue.push("There you go");
        params.media = ["images/help.jpg"];
        log(`@${username} requested help`);
        return; // prevent script from sending twice

    } else if (messageHas(bot_name + " random image") > -1) {

        // Random Image
        const images = await promisify(fs.readdir)("images/bratwursts");
        const index = Math.floor(Math.random() * images.length);

        returnValue.push("Have a bite");
        params.media = ["images/bratwursts/" + images[index]];
        log("@" + username + "requested an image. Given image /bratwursts/" + images[index]);
        return; // sending the tweet link it is => prevent script from sending twice

    } else if (messageHas(bot_name + " stats") > -1) {

        // Stats
        const tweets = await database.ref("tweets").once("value");
        const users = {};
        tweets.forEach(tweet => {
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

        log("STATS:", returnValue.join(" "));

    } else if (messageHas(bot_name + " random fact") > -1) {

        // Random fact
        returnValue.push(reply.get("random"));
        log("RANDOM FACT:", returnValue.join(" "));

    }

    // Send Tweet
    if (returnValue.join(" ") !== baseValue) await send();
}
twitter.stream("@" + twitter.botName, (...a) => {
    ontweet(...a).catch(err => log("ERROR:", err));
}, 30);

const stream = twitter.client.stream("user");

/*
 * Follows
 */
stream.on("follow", function (event) {
    const name = event.source.name;
    const screenName = event.source.screen_name;

    const status = "@" + screenName + " " + reply.get("follow").replace("{{name}}", name);
    twitter.tweet(status, err => {
        if (err) return log(err);
    });
    log("@" + screenName + " followed");
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
