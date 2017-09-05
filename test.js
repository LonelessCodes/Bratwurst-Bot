const Canvas = require("canvas-prebuilt");
const database = require("./modules/database");

const r = 20.48;

const grey = "#4D4D4D";
const grey2 = "#4C4C4C";
const orange = "#FFC04D";
// const orange2 = "#F2A74C";
const green = "#78C07D";
const white = "#FFFFFF";

const opts = {
    dayName: "2017-04-01"
};

database
    .ref()
    .child("tweets")
    .orderByChild("timestamp")
    .startAt(new Date("2017-04-01").getTime())
    .endAt(new Date("2017-04-02").getTime())
    .once("value")
    .then(tweets => {
        tweets = tweets.val();
        tweets = Object.keys(tweets).map(key => tweets[key]);

        // new tweet objects will save the User ID instead of the screen_name, to
        // to go extra sure, but I still have to support screen_name-only entries
        let users = {};
        tweets.forEach(tweet => {
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
        console.log(users, users.length);

        const img = new Canvas(Math.floor(100 * r), Math.floor(150 * r));
        const ctx = img.getContext("2d");

        /**
         * BACKGROUND
         */
        ctx.fillStyle = white;
        ctx.fillRect(0, 0, img.width, img.height);

        /**
         * Time
         */
        ctx.fillStyle = grey;
        ctx.font = `bold ${1.8 * r}px regular`;
        ctx.fillText(opts.dayName, img.width - 2 * r - ctx.measureText(opts.dayName).width, 3.6 * r);

        /**
         * Users
         */
        ctx.font = `bold ${1.4 * r}px regular`;

        let x = 0;
        let y = 0;
        users.forEach((user, index) => {
            x = index % 4;
            y = Math.floor(index / 4);
            ctx.fillText("@" + user.name, 4 * r + x * r * 23, 5.6 * r + y * 2.4 * r);
        });

        var fs = require("fs")
            , out = fs.createWriteStream(__dirname + "/test.png")
            , stream = img.pngStream();

        stream.pipe(out);

        out.on("finish", function () {
            console.log("saved png");
            process.exit();
        });
    });
