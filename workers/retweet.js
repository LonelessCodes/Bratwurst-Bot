const { retweet, stream, botName } = require("../modules/twitter");
const database = require("../modules/database");
const log = require("../modules/log");
const SpamFilter = require("../modules/spam_filter");

const users = database.ref("users");
const tweets = database.ref("tweets");

// Retweet
const spamFilter = new SpamFilter();

// removed lastTweet thing, because RTs are thrown out anyway
// track plural as well (German and English)
stream(["bratwurst", "bratwürste", "bratwursts"], (tweetObj, user) => {
    if (user.screen_name === botName || !!tweetObj.possibly_sensitive) return;
    const message = tweetObj.text.toLowerCase();
    const tweetID = tweetObj.id_str;

    const badWords =
        message.indexOf("magst du bratwurst") > -1 ||
        message.indexOf("disgusting") > -1 ||
        message.indexOf(" hate ") > -1 ||
        message.indexOf("nazi") > -1 ||
        message.indexOf(" fucking") > -1;

    if (!/(bratwurst|bratwürste)/gi.test(message) ||
        /bot spotting/gi.test(user.name) || // to filter out this annoying collective of bot accounts "Bot Spotting"
        message.indexOf("@" + botName.toLowerCase()) > -1 ||
        /^rt/.test(message) ||
        badWords) return;

    database
        .isIgnored(user.id_str)
        .then(() => spamFilter.check(tweetObj)) // check for similar tweets in the last time to prevent spamming
        .then(() => retweet(tweetID))
        .then(() => {
            log(`"${tweetObj.text}" by @${user.screen_name} retweeted`);

            // custom objects
            users.child(user.id_str).set(new database.User(user));
            tweets.child(tweetID).set(new database.Tweet(tweetObj));
        })
        .catch(err => {
            log(`${err.name}: ${err.message} | "${tweetObj.text}" by @${user.screen_name} not retweeted`);
        });
}, 60);

log("Retweet worker is listening");
