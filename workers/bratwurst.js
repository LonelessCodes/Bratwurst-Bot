const fs = require("fs");
const path = require("path");
const { tweet, stream, botName } = require("../modules/twitter");
const log = require("../modules/log");
const utils = require("../modules/utils");
const curve = require("../modules/curve");

let Canvas;
try {
    Canvas = require("canvas");
} catch (err) {
    Canvas = require("canvas-prebuilt");
}
const palette = require("../modules/stats/palette.json");
const grey = "#5B4A3E";

stream("#onabratwurst", tweetObject => {
    try {
        const start = Date.now();
        
        const message = tweetObject.text.toLowerCase();
        const tweetID = tweetObject.id_str;
        const username = tweetObject.user.screen_name;

        // before going any further, check if this is not an echo or a retweet
        if (username === botName || /^rt/.test(message)) return;

        let text = tweetObject.text.split("\"");
        // return if there are less than 2 quotation marks
        if (text.length < 3) return;
        text = text[1];

        /**
         * Now draw
         */
        let width = 3072 / 2 - 420;
        let height = 2048 / 2 - 340;
        const r = width / 100;
        const img = new Canvas(width, height);
        const ctx = img.getContext("2d");
        
        // width /= r;
        // height /= r;

        // ctx.scale(r, r);

        ctx.save();
        ctx.translate(-300, -200);

        const background = new Canvas.Image;
        background.src = fs.readFileSync(path.join(__dirname, "..", "images", "message.jpg"));
        ctx.drawImage(background, 0, 0, background.width / 2, background.height / 2);

        /**
         * Overlay canvas
         */
        const overlay = new Canvas(width, height);
        const overctx = overlay.getContext("2d");

        overctx.save();
        overctx.translate(-300, -200);

        const dark = new Canvas.Image;
        dark.src = fs.readFileSync(path.join(__dirname, "..", "images", "message_dark.jpg"));
        overctx.drawImage(dark, 0, 0, dark.width / 2, dark.height / 2);

        const darkData = overctx.getImageData(0, 0, width, height);

        overctx.restore();
        overctx.clearRect(0, 0, width, height);
        overctx.save();
        overctx.translate(-300, -200);

        overctx.font = "50px regular";
        let length = overctx.measureText(text).width;
        if (length > width - 300) {
            overctx.font = `${50 * ((width - 300) / (length / 2))}px regular`;
            length = length * ((width - 300) / (length / 2));
            const t = text.length;
            const v = (width - 300) / length;
            const char = Math.floor(v * t);
            const text1 = text.substring(0, char);
            const text2 = text.substring(char, t);
            curve(overctx, text1, [147, 131, 225, 234, 467, 227, 522, 214].map(v => v * 2.5));
            curve(overctx, text2, [147, 161, 225, 264, 467, 257, 522, 244].map(v => v * 2.5));
        } else {
            curve(overctx, text, [147, 151, 225, 254, 467, 247, 522, 234].map(v => v * 2.5));
        }

        const textData = overctx.getImageData(0, 0, width, height);

        for (let i = 0; i < darkData.data.length; i += 4) {
            darkData.data[i + 1] *= 0.8;
            darkData.data[i + 2] *= 0.8;
            darkData.data[i + 3] = textData.data[i + 3];
        }

        overctx.putImageData(darkData, 0, 0);

        ctx.restore();
        ctx.drawImage(overlay, 0, 0);

        /**
         * LOWER BANNER
         */
        ctx.fillStyle = grey;
        ctx.fillRect(0, height - 4*r, width, 4*r);

        ctx.fillStyle = palette.white;
        ctx.font = `${1.6*r}px regular`;
        const te = ctx.measureText("@bratwurst_bot");
        ctx.fillText("@bratwurst_bot", width - te.width - 1*r, height - 1.4*r);

        const stream = img.jpegStream({
            bufsize: 4096, // output buffer size in bytes, default: 4096 
            quality: 75, // JPEG quality (0-100) default: 75 
            progressive: false // true for progressive compression, default: false 
        });

        const bufs = [];
        stream.on("data", function (chunk) {
            bufs.push(chunk);
        });

        stream.on("end", function () {
            /**
             * send it off to the user
             */
            // now continue setting consts
            const returnValue = ["@" + username];

            tweetObject.entities.user_mentions.forEach(user => {
                if (user.screen_name !== botName)
                    returnValue.push("@" + user.screen_name);
            });
            returnValue.push(`@${username} "${text}"`);
            let response = returnValue.join(" ");
            const timestamp = ` [${utils.time(start, Date.now())}]`;

            // handle these 140 characters
            if ((response.length + timestamp.length) > 140) {
                response = response.substring(0, 140 - 3 - timestamp.length) + "...";
            }

            tweet(response + timestamp, {
                media: [Buffer.concat(bufs)],
                inReplyTo: tweetID
            }, err => {
                if (err) return log(err);
                log(`@${username} "${text}" sent`);
            });
        });
    } catch (err) {
        console.log(err);
    }
}, 30);

log("Bratwurst worker is listening");
