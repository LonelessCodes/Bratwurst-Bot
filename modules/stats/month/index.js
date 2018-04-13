let time;
let lastMonthTime;
let monthName;
let yearName;
const database = require("../../database"),
    canvas = require("./canvas"),
    bestUser = require("../best_user");

/**
 * fixes
 */
Array.prototype.max = function () {
    return Math.max.apply(null, this);
};
Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

Number.prototype.getHour = function () {
    var a = new Date(this);
    return a.getHours();
};
Number.prototype.getDate = function () {
    var a = new Date(this);
    return a.getDate();
};
Number.prototype.getMonth = function () {
    var a = new Date(this);
    return a.getMonth();
};

String.prototype.template = function (params) {
    let string = this;
    for (let key in params) {
        string = string.replace(`{{${key}}}`, params[key]);
    }
    return string;
};

/**
 * Create Dir for Maps
 */
Number.prototype.toMonth = function () {
    if (this < 12) {
        const name = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
        return name[this];
    }
    return this;
};

Number.prototype.getDaysOfLastMonth = function () {
    var time = new Date(this);
    var year = time.getFullYear();
    var month = time.getMonth();
    if (month == 0) {
        month = 12;
        year = year - 1;
    }
    return new Date(year, month, 0).getDate();
};
Number.prototype.getDaysOfMonth = function () {
    var a = new Date(this);
    var year = a.getFullYear();
    var month = a.getMonth();
    return new Date(year, month, 0).getDate();
};

/**
 * SOURCES
 */
async function sourceFunc(tweets) {
    const localTime = new Date();
    /**
     * Render Sources
     */
    const sources = {};

    tweets.forEach(tweet => {
        if (!tweet.child("source").exists()) return;
        let s = tweet.child("source").val().split(">");
        s = (s.length === 1 ? s[0] : s[1]).split("<")[0].replace("Twitter ", "").replace("for ", "");
        sources[s] ? sources[s]++ : sources[s] = 1;
    });

    const data = Object.keys(sources).map(key => {
        return {
            value: sources[key],
            name: key
        };
    }).sort(function (a, b) {
        return b.value - a.value;
    });
    if (data.length === 0) throw new Error("Not enough data for monthly stats. Data length is 0");

    const buf = canvas.source({
        data,
        monthName,
        yearName,
        renderTime: localTime.getTime()
    });
    if (buf instanceof Error || !buf) throw new Error(buf);

    return { buf, best: data[0]["name"] };
}

/**
 * TIMES
 */
async function timesFunc(tweets) {
    const localTime = new Date();

    const stats = await database.ref().child("stats/month").once("value");
    const times = [];
    const hours = {};
    const days = {};
    tweets.forEach(tweet => {
        let offset = -7200;
        if (tweet.child("offset").exists())
            offset += tweet.child("offset").val();
        const timestamp = new Date(tweet.child("timestamp").val() + offset * 1000);
        times.push(timestamp);

        const hour = timestamp.getHours();
        if (!hours[hour]) hours[hour] = 0;
        hours[hour]++;

        const date = timestamp.getDate();
        if (!days[date]) days[date] = 0;
        days[date]++;
    });

    days.length = Object.keys(days).length;

    const finalHours = [];
    for (let i = 0; i < 12; i++) {
        const first = hours[(i * 2).toString()];
        const second = hours[(i * 2 + 1).toString()];
        finalHours.push((
            (first ? first : 0) +
            (second ? second : 0)
        ) / days.length);
    }

    const finalMonth = [];
    for (var i = 0; i < 12; i++) {
        if (lastMonthTime.getMonth() === i) {
            let month = days.length > 0 && tweets.numChildren() > 0 ? tweets.numChildren() / days.length : 0;
            finalMonth.push(month);
            database.ref("stats/month").child(i.toMonth()).set(month);
        } else {
            const result = stats.child(i.toMonth());
            finalMonth.push(result.exists() ? result.val() : 0);
        }
    }

    const buf = canvas.times({
        times: finalHours,
        months: finalMonth,
        maxTime: finalHours.max(),
        maxMonth: finalMonth.max(),
        monthName,
        yearName,
        renderTime: localTime.getTime()
    });
    if (buf instanceof Error) throw new Error("Chart creation failed: " + buf);

    const reversed = Object.keys(hours).map(key => {
        return {
            value: hours[key],
            name: key
        };
    }).sort(function (a, b) {
        return b.value - a.value;
    })[0];

    return { buf, best: reversed ? parseInt(reversed.name) : null };
}

/**
 * GLOBAL
 */
async function globalFunc(tweets) {
    const localTime = new Date();

    const data = {};
    tweets.forEach(tweet => {
        if (!tweet.child("place").exists()) return;
        const s = tweet.child("place").val();
        if (!data[s]) data[s] = 0;
        data[s]++;
    });

    const max = Object.keys(data).map(a => data[a]).max();

    const buf = canvas.global({
        data,
        max,
        monthName,
        yearName,
        renderTime: localTime.getTime()
    });
    if (buf instanceof Error || !buf) throw buf;

    const finalArray = Object.keys(data).map(code => {
        return {
            id: code,
            value: data[code]
        };
    }).sort((a, b) => {
        return b.value - a.value;
    });

    return { buf, best: finalArray[0] };
}

function getTweets() {
    const query = database
        .ref()
        .child("tweets")
        .orderByChild("timestamp")
        .startAt(time.getTime() - (time.getTime().getDaysOfLastMonth() * 24 * 3600 * 1000))
        .endAt(time.getTime());
    return query.once("value");
}

async function createStats() {
    // set time of creation begin
    time = new Date();
    // set month it's all about
    lastMonthTime = new Date(time.getTime() - 1000 * 3600 * 24 * time.getTime().getDaysOfLastMonth());

    // set human readable month name
    monthName = ((time.getMonth() - 1 == -1) ?
        12 :
        (time.getMonth() - 1)).toMonth();
    // set human readable year name
    yearName = ((time.getMonth() - 1 == -1) ?
        time.getFullYear() - 1 :
        time.getFullYear());

    // get all tweets from last month
    const tweets = await getTweets();

    // return functions to process this data
    return {
        async getStats() {
            const [
                { buf: source_buf, best: source_best },
                { buf: global_buf, best: global_best },
                { buf: times_buf, best: times_best }
            ] = await Promise.all([
                sourceFunc(tweets),
                globalFunc(tweets),
                timesFunc(tweets)
            ]);
            
            return [{
                source: source_buf,
                global: global_buf,
                times: times_buf
            }, {
                source: source_best,
                global: global_best,
                times: times_best
            }];
        },
        getUser() {
            return bestUser("month", tweets);
        }
    };
}

module.exports = createStats;
