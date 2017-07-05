const { retweet, stream, botName } = require("../modules/twitter");
const database = require("../modules/database");
const log = require("../modules/log");
const SpamFilter = require("../modules/spam_filter");

/*
 * Database Objects
 */
const { User, Tweet } = require("../modules/database_objects");

const users = database.ref("users");
const tweets = database.ref("tweets");

// Retweet
const spamFilter = new SpamFilter();

let lastTweet;
// forgot to track the plural as well
stream(["bratwurst", "bratwürste", "bratwursts"], (tweetObj, user) => {
    if (user.screen_name === botName || !!tweetObj.possibly_sensitive) return;
    const message = tweetObj.text.toLowerCase();
    const tweetID = tweetObj.id_str;

    const badWords =
        message.indexOf("magst du bratwurst") > -1 ||
        message.indexOf("disgusting") > -1 ||
        message.indexOf(" hate ") > -1 ||
        message.indexOf(" nazi") > -1 ||
        message.indexOf(" fucking") > -1;

    if (lastTweet === tweetID ||
        !/(bratwurst|bratwürste)/gi.test(message) ||
        message.indexOf("@" + botName.toLowerCase()) > -1 ||
        /^rt/.test(message) ||
        badWords) return;

    database.isIgnored(user.id_str)
        // TODO: spam filter is having some problems	
        // .then(() => spamFilter.check(tweetObj)) // check for similar tweets in the last time to prevent spamming
        .then(() => retweet(tweetID))
        .then(data => {
            // prevent a feedback loop. It's a RT, so it should get filtered out, but
            // just for reference
            lastTweet = data.id_str;
            log(`"${tweetObj.text}" by @${user.screen_name} retweeted`);

            users.child(user.id_str).set(new User(user));
            tweets.child(tweetID).set(new Tweet(tweetObj));
        })
        .catch(err => {
            log(`${err.name}: ${err.message} | "${tweetObj.text}" by @${user.screen_name} not retweeted`);
        });
}, 60);

log("Retweet worker is listening");
