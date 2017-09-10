let time;
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

Number.prototype.getDaysOfMonth = function () {
    var a = new Date(this);
    var year = a.getFullYear();
    var month = a.getMonth();
    return new Date(year, month, 0).getDate();
};



function getTweets() {
    const year = new Date(time.getTime());
    year.setMonth(-1);
    year.setMonth(1);
    yearName = year.getFullYear();
    const days = year.getTime().getDaysOfMonth() === 28 ? 365 : 366;

    const query = database
        .ref()
        .child("tweets")
        .orderByChild("timestamp")
        .startAt(time.getTime() - (days * 24 * 3600 * 1000))
        .endAt(time.getTime());
    return query.once("value");
}

async function createStats() {
    // set time of creation begin
    time = new Date();
    // get all tweets from last month
    const tweets = await getTweets();
    // return functions to process this data
    return {
        getUser() {
            return bestUser("year", tweets);
        }
    };
}

module.exports = createStats;
