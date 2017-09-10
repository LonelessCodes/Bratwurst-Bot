const database = require("../../database"),
    bestUser = require("../best_user");

function getTweets(time) {
    const query = database
        .ref()
        .child("tweets")
        .orderByChild("timestamp")
        .startAt(time.getTime() - (7 * 24 * 3600 * 1000))
        .endAt(time.getTime());
    return query.once("value");
}

async function createStats() {
    // get all tweets from last month
    const tweets = await getTweets(new Date());
    // return functions to process this data
    return {
        getUser() {
            return bestUser("week", tweets);
        }
    };
}

module.exports = createStats;
