const twitter = require("../modules/twitter");
const stats = require("../modules/stats");
const database = require("../modules/database");
const utils = require("../modules/utils");
const log = require("../modules/log");
const cron = require("cron");

// TODO: annual stats
/*
 * tweet monthly stats
 */
async function year() {
    // // load tweets
    // const getStats = await stats.year();
    // // create stats and diagrams
    // const [bufs, info] = await getStats.getStats();
}
// cron new JOB
new cron.CronJob("0 0 1 0 *", () => {
    year().catch(err => log("Annual stats couldn't be created. Issue:", err));
}, null, true, "Europe/Berlin");

/*
 * tweet monthly stats
 */
async function month() {
    // load tweets
    const getStats = await stats.month();
    // create stats and diagrams
    const [bufs, info] = await getStats.getStats();
    // create a tweet text
    const roughTimeOfDay =
        info.times > 5 ?
            info.times > 11 ?
                info.times > 14 ?
                    info.times > 18 ?
                        info.times > 21 ?
                            "at night" :
                            "in the evening" :
                        "in the afternoon" :
                    "around noon" :
                "in the morning" :
            "at night";
    let string = `Bratwurst tweeters were most active ${roughTimeOfDay}. Most tweeters came from ${info.global.id} (${info.global.value}) #BratwurstStats`;

    // tweet the stats
    twitter.tweet(string, {
        media: [
            bufs.times,
            bufs.global,
            bufs.source
        ]
    }, err => {
        if (err) return log(err);
        log(string, (string.length + 23 <= 140));
    });

    // create best user GIF
    const { buf, user, value } = await getStats.getUser();
    // create tweet text
    string = "Top Bratwurst tweeter of the month is @" + user + " with " + value + " tweets. Congratulations!!!";
    // tweet best user
    twitter.tweet(string, {
        media: [buf]
    }, err => {
        if (err) return log(err);
        log(string, string.length <= 140 ? "shortened" : "");
    });
}
// cron new JOB
new cron.CronJob("0 0 1 * *", () => {
    month().catch(err => log("Monthly stats couldn't be created. Issue:", err));
}, null, true, "Europe/Berlin");

/**
 * Daily Report
 */
// TODO: fix issue with multiple being "best user of the day". Not a bug, just a equal chances thing

async function dailyReport() {
    const time = new Date();

    let [tweetsSnap, ignoredSnap] = await Promise.all([
        database.ref("tweets").orderByChild("timestamp").startAt(Date.now() - 1000 * 3600 * 24).once("value"),
        database.ref("ignored").once("value")
    ]);
    if (!tweetsSnap.exists()) throw new Error("No tweets were found.");

    tweetsSnap = tweetsSnap.val();
    ignoredSnap = ignoredSnap.val();

    const ignored = Object.keys(ignoredSnap);
    const tweets = Object.keys(tweetsSnap).map(key => tweetsSnap[key]);

    // new tweet objects will save the User ID instead of the screen_name, to
    // to go extra sure, but I still have to support screen_name-only entries
    let users = {};
    tweets.filter(tweet => {
        if (!ignored.includes(tweet.user.id))
            return true;
        return false;
    }).forEach(tweet => {
        const index = tweet.user.id || tweet.user.screen_name;
        if (users[index]) users[index].length++;
        else users[index] = {
            length: 1,
            id: tweet.user.id,
            name: tweet.user.screen_name
        };
    });
    users = Object.keys(users)
        .map(key => users[key])
        .sort((a, b) => {
            return b.length - a.length;
        }); // get first element

    if (!users[0] || !users[0].name) throw new Error("No best user could be found. Array length 0");
    
    const user = users[0];
    const { screen_name: name } = user.id ? await twitter.get("users/show", {
        user_id: user.id
    }) : { screen_name: user.name };
    // tweet data
    let string =
        `It is once again the end of the day. Top Bratwurst Tweeter of the last 24 hours is @${name} with ${user.length} ${user.length === 1 ? "tweet" : "tweets"} 🎉🎆. Congratulations!`;
    string += " [" + utils.time(time.getTime(), Date.now()) + "]";

    twitter.tweet(string, () => log(string));
}
// cron new JOB
new cron.CronJob("0 0 * * *", () => {
    dailyReport().catch(err => log("Daily Report couldn't be created. Reason", err));
}, null, true, "Europe/Berlin");

/**
 * Update Bio
 */
let numUsers = 0;
database.ref("users").once("value", snapshot => {
    numUsers = snapshot.numChildren();

    bio();
    setInterval(bio, 1000 * 60 * 30);
});
database.ref("users").on("child_added", () => {
    numUsers++;
});

function bio() {
    const description = `About all things Bratwurst. ${numUsers} users have tweeted about bratwurst. "@Bratwurst_bot help" for help. Bot by @LonelessArt. v${require("../package.json").version}`;

    twitter.updateBio({ description }, err => {
        if (err) log(err);
    });
}

log("Stats worker is listening");
