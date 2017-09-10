const database = require("../../database");

async function bestUser(time, tweetsSnap, ignoredSnap) {
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

    // there's probabaly multiple users having the same amount of tweets and sorting those by
    // name is unfair. Let's just pick one at random
    const arr = [];
    for (let user of users)
        if (user.length === users[0].length)
            arr.push(user);
    const user = arr[Math.floor(Math.random() * arr.length)];

    return {
        name: user.name,
        value: user.length
    };
}

async function createStats() {
    // get all tweets from last month
    const time = new Date();
    let [tweetsSnap, ignoredSnap] = await Promise.all([
        database.ref("tweets")
            .orderByChild("timestamp")
            .startAt(time.getTime() - 1000 * 3600 * 24)
            .endAt(time.getTime())
            .once("value"),
        database.ref("ignored").once("value")
    ]);
    if (!tweetsSnap.exists()) throw new Error("No tweets were found.");
    // return functions to process this data
    return {
        getUser() {
            return bestUser(time, tweetsSnap, ignoredSnap);
        }
    };
}

module.exports = createStats;
