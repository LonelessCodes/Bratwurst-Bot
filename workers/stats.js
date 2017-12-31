const twitter = require("../modules/twitter");
const stats = require("../modules/stats");
const database = require("../modules/database");
const log = require("../modules/log");
const { CronJob } = require("cron");

// TODO: add anniversary tweet job

/*
 * tweet annual stats
 * TODO: everything
 */
async function year() {
    let string;
    // load tweets
    const getStats = await stats.year();
    // const [bufs, info] = await getStats.getStats();
    // // create a tweet text
    // const roughTimeOfDay =
    //     info.times > 5 ?
    //         info.times > 11 ?
    //             info.times > 14 ?
    //                 info.times > 18 ?
    //                     info.times > 21 ?
    //                         "at night" :
    //                         "in the evening" :
    //                     "in the afternoon" :
    //                 "around noon" :
    //             "in the morning" :
    //         "at night";
    // string = `Bratwurst tweeters were most active ${roughTimeOfDay}. Most tweeters came from ${info.global.id} (${info.global.value}) #BratwurstStats`;

    // // tweet the stats
    // twitter.tweet(string, {
    //     media: [
    //         bufs.times,
    //         bufs.global,
    //         bufs.source
    //     ]
    // }, err => {
    //     if (err) return log(err);
    //     log(string, (string.length + 23 <= twitter.limit));
    // });

    // create best user GIF
    const { buf, best, honorable_mentions } = await getStats.getUser();
    string = `Happy New Year ${(new Date()).getFullYear()}!
    Top Bratwurst tweeter of the year is @${best.name} with ${best.value} ${best.value === 1 ? "tweet" : "tweets"}. Congratulations!!! 🎆✨🌭🍻`;
    const tweet = await twitter.tweetPromise(string, { media: [buf] });
    log(string);

    // honorable mentions
    string = `@${twitter.botName} honorable mentions: `;
    const arr = [];
    for (let user of honorable_mentions) {
        const str = `@${user.name} (${user.value}`;
        if (string + [...arr, str].join(", ").length > twitter.limit) break;
        arr.push(str);
    }
    string += arr.join(", ");

    await twitter.tweetPromise(string, { inReplyTo: tweet.id_str });
    log(string);
}
new CronJob("0 0 1 0 *", () => {
    year().catch(err => log("Monthly stats couldn't be created. Issue:", err));
}, null, true, "Europe/Berlin");

/*
 * tweet monthly stats
 */
async function month() {
    // load tweets
    const getStats = await stats.month();
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
        log(string, (string.length + 23 <= twitter.limit));
    });

    // create best user GIF
    const { buf, best, honorable_mentions } = await getStats.getUser();
    string = `Top Bratwurst tweeter of the month is @${best.name} with ${best.value} ${best.value === 1 ? "tweet" : "tweets"}. Congratulations!!! 🎆✨🌭`;
    const tweet = await twitter.tweetPromise(string, { media: [buf] });
    log(string);

    // honorable mentions
    string = `@${twitter.botName} honorable mentions: `;
    const arr = [];
    for (let user of honorable_mentions) {
        const str = `@${user.name} (${user.value}`;
        if (string + [...arr, str].join(", ").length > twitter.limit) break;
        arr.push(str);
    }
    string += arr.join(", ");

    await twitter.tweetPromise(string, { inReplyTo: tweet.id_str });
    log(string);
}
new CronJob("0 0 1 * *", () => {
    month().catch(err => log("Monthly stats couldn't be created. Issue:", err));
}, null, true, "Europe/Berlin");

/**
 * Weekly Report
 */
async function week() {
    // load tweets
    const getStats = await stats.week();
    const {
        buf,
        best,
        honorable_mentions
    } = await getStats.getUser();
    let string =
        `Top Bratwurst tweeter of the week is @${best.name} with ${best.value} ${best.value === 1 ? "tweet" : "tweets"}. Congratulations!!!`;
    const tweet = await twitter.tweetPromise(string, { media: [buf] });
    log(string);

    // honorable mentions
    string = `@${twitter.botName} honorable mentions: `;
    const arr = [];
    for (let user of honorable_mentions) {
        const str = `@${user.name} (${user.value}`;
        if (string + [...arr, str].join(", ").length > twitter.limit) break;
        arr.push(str);
    }
    string += arr.join(", ");

    await twitter.tweetPromise(string, { inReplyTo: tweet.id_str });
    log(string);
}
new CronJob("0 1 * * 1", () => {
    week().catch(err => log("Monthly stats couldn't be created. Issue:", err));
}, null, true, "Europe/Berlin");

/**
 * Daily Report
 */
async function day() {
    // load tweets
    const getStats = await stats.day();
    const best = await getStats.getUser();
    let string =
        `It is once again the end of the day. Top Bratwurst Tweeter of the last 24 hours is @${best.name} with ${best.value} ${best.value === 1 ? "tweet" : "tweets"} 🎉🎆. Congratulations!`;
    await twitter.tweetPromise(string);
    log(string);
}
new CronJob("0 0 * * *", () => {
    day().catch(err => log("Daily Report couldn't be created. Reason", err));
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
