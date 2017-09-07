let time;
let lastMonthTime;
let monthName;
let yearName;
const database = require("../database"),
    canvas = require("./canvas");

/**
 * fixes
 */
Array.prototype.max = function () {
    return Math.max.apply(null, this);
};
Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

Number.prototype.toZeros = function () {
    if (this < 100) {
        if (this < 10) return "00" + this;
        return "0" + this;
    }
    return "" + this;
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

// async functions

function getTweets() {
    const query = database
        .ref()
        .child("tweets")
        .orderByChild("timestamp")
        // get days of year
        .startAt(time.getTime() - (time.getTime().getDaysOfLastMonth() * 24 * 3600 * 1000));
    return query.once("value");
}

async function createStats() {
    // set time of creation begin
    time = new Date();
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
            return bestUserFunc(tweets);
        }
    };
}

module.exports = createStats;
