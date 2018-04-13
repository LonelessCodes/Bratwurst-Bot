let Canvas;
try {
    Canvas = require("canvas");
} catch (err) {
    Canvas = require("canvas-prebuilt");
}
const fs = require("fs");
const path = require("path");
const Font = require("../font");
const GIF = require("gifencoder");

const palette = require("./palette.json");

const bratwurst = new Font(path.join(__dirname, "..", "..", "images", "font", "bratwurst.json"));

function fontFile (name) {
    return path.join(__dirname, "..", "..", "lib", "fonts", name);
}
Canvas.registerFont(fontFile("Comfortaa-Regular.ttf"), { family: "comfortaa" });
Canvas.registerFont(fontFile("Comfortaa-Bold.ttf"), { family: "comfortaa", weight: "bold" });

/**
 * BEST USER
 */
function canvas(time, name) {
    try {
        // good stuff
        const width = 640; // 640px
        const height = 360; // 360px

        const encoder = new GIF(width, height);

        encoder.start();
        encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat 
        encoder.setDelay(300);  // frame delay in ms 
        encoder.setQuality(10); // image quality. 10 is default. 

        const img = Canvas.createCanvas(width, height);
        const ctx = img.getContext("2d");

        const textsub = bratwurst.text(time + "'s favorite", { spacing: 20, color: palette.yellow });
        const text = bratwurst.text("@" + name, { spacing: 20, color: palette.green });

        for (let frame = 0; frame < 4; frame++) {
            ctx.fillStyle = palette.white;
            ctx.fillRect(0, 0, width, height);

            const background = new Canvas.Image;
            background.src = fs.readFileSync(path.resolve(path.join(__dirname, "..", "..", "images", "stats", "user_" + time + "_frame_" + frame + ".png")));
            ctx.drawImage(background, 0, 0);

            // month's favourite label
            ctx.drawImage(textsub, (width - textsub.width / 6) / 2, 10, textsub.width / 6, textsub.height / 6);

            // username
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.rotate(-Math.PI / 20 + (frame < 2 ? 0.3 : 0));
            let iwidth = text.width / 2;
            let iheight = text.height / 2;
            if (iwidth > width) {
                iheight = iheight * (width / iwidth);
                iwidth = width;
            }
            ctx.drawImage(text, -iwidth / 2, -iheight / 2, iwidth, iheight);
            ctx.restore();

            /**
             * LOWER BANNER
             */
            ctx.save();
            ctx.scale(7, 7);
            ctx.fillStyle = palette.purple;
            ctx.fillRect(0, height / 7 - 3, width / 7, 3);

            ctx.fillStyle = palette.white;
            ctx.font = `${1.6}px comfortaa`;
            const te = ctx.measureText("@bratwurst_bot");
            ctx.fillText("@bratwurst_bot", width / 7 - te.width - 1, height / 7 - 1);
            ctx.restore();

            encoder.addFrame(ctx);
        }

        encoder.finish();

        return encoder.out.getData();
    } catch (err) {
        return err;
    }
}

module.exports = async function bestUserFunc(time, tweets) {
    // TODO: sort best user by id_str. Get username via Twitter API 
    // (to make sure user is @ even if they changed their usename)
    const users = {};
    tweets.forEach(tweet => {
        const thing = tweet.child("user/screen_name").val();
        users[thing] ? users[thing]++ : users[thing] = 1;
    });

    const usersArray = Object.keys(users).map(key => {
        return {
            value: users[key],
            name: key
        };
    }).sort(function (a, b) {
        return b.value - a.value;
    });
    if (!usersArray[0]) throw new Error("No best user could be found. Array length 0");

    const best = usersArray[0];
    const honorable_mentions = usersArray.slice(1);

    const buf = canvas(time, best.name);
    if (buf instanceof Error || !buf) throw buf;

    return {
        buf,
        best,
        honorable_mentions
    };
};
