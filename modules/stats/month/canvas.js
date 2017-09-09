let Canvas;
try {
    Canvas = require("canvas");
} catch (err) {
    Canvas = require("canvas-prebuilt");
}

const grey = "#4D4D4D";
const grey2 = "#4C4C4C";
const orange = "#FFC04D";
const green = "#78C07D";
const white = "#FFFFFF";

const r = 20.48;

/**
 * TIMES
 */
module.exports.times = function times(opts) {
    try {
        const height = 70;
        const width = 100;
        const img = new Canvas(Math.floor(width * r), Math.floor(height * r));
        const ctx = img.getContext("2d");

        // just use percentage later on. That's easier. So we have to scale the matrix first
        ctx.scale(r, r);

        /**
         * BACKGROUND
         */
        ctx.fillStyle = white;
        ctx.fillRect(0, 0, width, height);

        /**
         * HEADER
         */
        ctx.fillStyle = grey;
        ctx.font = `bold ${4.3}px regular`;
        ctx.fillText(`Bratwurst Stats of ${opts.monthName}, ${opts.yearName}`, 4, 8);

        const piece = Math.PI * 2 / 12;
        /**
         * POLAR DIAGRAM DAYTIME
         */
        // pie *****************
        ctx.save();
        ctx.fillStyle = orange;
        for (let i = 0; i < opts.times.length; i++) {
            ctx.beginPath();
            ctx.moveTo(22, 30);
            const time = opts.times[i] / opts.maxTime;
            let angle = piece * i - Math.PI / 2;
            if (angle < 0) angle += Math.PI * 2;
            ctx.arc(22, 30, time * 13 + 6, angle, angle + piece);
            ctx.globalAlpha = time;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = white;
        ctx.arc(22, 30, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // legend **************
        const legend1 = ctx.createLinearGradient(0, 14, 0, 35 + 14);
        legend1.addColorStop(0, orange);
        legend1.addColorStop(1, white);

        ctx.fillStyle = legend1;
        ctx.fillRect(44, 14.5, 4, 34.5);
        // zero
        ctx.fillStyle = grey;
        ctx.font = `${2.8}px regular`;
        ctx.fillText("0", 46 - ctx.measureText("0").width / 2, 50.5);
        // max
        let text = Math.round(opts.maxTime).toString();
        ctx.fillText(text, 46 - ctx.measureText(text).width / 2, 14);

        ctx.beginPath();
        ctx.fillStyle = white;
        ctx.arc(22, 30, 6, 0, Math.PI * 2);
        ctx.fill();

        /**
         * POLAR DIAGRAM MONTHS
         */
        // pies ***************
        ctx.save();

        ctx.fillStyle = green;
        for (let i = 0; i < opts.months.length; i++) {
            ctx.beginPath();
            ctx.moveTo(width - 22, 30);
            const month = opts.months[i] / opts.maxMonth;
            let angle = piece * i - Math.PI / 2;
            if (angle < 0) angle += Math.PI * 2;
            ctx.arc(width - 22, 30, month * 13 + 6, angle, angle + piece);
            ctx.globalAlpha = month;
            ctx.fill();
        }
        ctx.restore();

        ctx.beginPath();
        ctx.fillStyle = white;
        ctx.arc(width - 22, 30, 6, 0, Math.PI * 2);
        ctx.fill();

        // legend *************
        const legend2 = ctx.createLinearGradient(0, 14, 0, (35 + 14));
        legend2.addColorStop(0, green);
        legend2.addColorStop(1, white);

        ctx.fillStyle = legend2;
        ctx.fillRect(width - 48, 14.5, 4, 34.5);
        // zero
        ctx.fillStyle = grey;
        ctx.font = `${2.8}px regular`;
        ctx.fillText("0", width - 46 - ctx.measureText("0").width / 2, 50.5);
        // max
        text = Math.round(opts.maxMonth).toString();
        ctx.fillText(text, width - 46 - ctx.measureText(text).width / 2, 14);

        /**
         * PIE TEXT
         */
        ctx.fillStyle = grey;
        ctx.font = `${1.2}px regular`;
        // daytime
        for (let i = 0; i < 12; i++) {
            ctx.beginPath();
            const radius = 6 - 1.2;
            const angle = i * piece - Math.PI / 2;
            const x = radius * Math.cos(angle) + 22;
            const y = radius * Math.sin(angle) + 30 + .6;
            const text = (i * 2).toString();
            ctx.fillText(text, x - ctx.measureText(text).width / 2, y);
        }
        // months
        const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 0; i < 12; i++) {
            ctx.beginPath();
            const radius = 6 - 1.2;
            const angle = i * piece + piece / 2 - Math.PI / 2;
            const x = radius * Math.cos(angle) + (width - 22);
            const y = radius * Math.sin(angle) + 30 + .6;
            const text = monthsShort[i];
            ctx.fillText(text, x - ctx.measureText(text).width / 2, y);
        }

        /**
         * BANNER
         */
        const offsetY = 53;

        ctx.fillStyle = green;
        ctx.fillRect(0, offsetY, width, height - offsetY);

        ctx.fillStyle = white;
        ctx.font = `${2.6}px regular`;
        ctx.fillText("Average Bratwurst activity", 4, offsetY + 5);
        ctx.fillText("by hours", 4, offsetY + 5 + 4.5, 36);

        ctx.fillText("Daily average Bratwurst", 59, offsetY + 5);
        ctx.fillText("activity per month", 59, offsetY + 5 + 4.5);

        /**
         * LOWER BANNER
         */
        ctx.fillStyle = grey;
        ctx.fillRect(0, height - 4, width, 4);

        ctx.fillStyle = white;
        ctx.font = `${1.6}px regular`;
        const te = ctx.measureText("@bratwurst_bot");
        ctx.fillText("@bratwurst_bot", width - te.width - 1, height - 1.4);
        ctx.fillText(`generated in ${Date.now() - opts.renderTime}ms`, 1, height - 1.4);

        return img.toBuffer();
    } catch (err) {
        return err;
    }
};

/**
 * GLOBAL
 */
module.exports.global = function global(opts) {
    try {
        const width = 106;
        const height = 65;
        const img = new Canvas(Math.floor(width * r), Math.floor(height * r));
        const ctx = img.getContext("2d");

        ctx.scale(r, r);

        /**
         * BACKGROUND
         */
        ctx.fillStyle = grey2;
        ctx.fillRect(0, 0, width, height);

        /**
         * MAP
         */
        ctx.save();
        ctx.strokeStyle = grey2;
        ctx.lineWidth = 0.05;
        // part of the data in this json is from https://github.com/gardaud/worldmap-canvas/blob/master/worldmap.js.
        // Thanks for providing this point by point data. I went insane when 
        // parsing SVG path data
        const map = require("../../../lib/world.json");

        ctx.translate(10.5, 0);

        // draw "plain" countries
        Object.keys(map).forEach(code => {
            if (map[code].path) {
                if (opts.data[code]) {
                    ctx.fillStyle = mix(white, orange, opts.data[code] / opts.max);
                } else {
                    ctx.fillStyle = white;
                }
                Draw(ctx, code, map);
            }
        });

        ctx.restore();

        /**
         * LEGEND
         */
        ctx.save();
        ctx.translate(width - 7, 12);
        const h = 31;
        const legend2 = ctx.createLinearGradient(0, 0, 0, h);
        legend2.addColorStop(0, orange);
        legend2.addColorStop(1, white);

        ctx.fillStyle = legend2;
        ctx.fillRect(0, 0, 3, h);
        // zero
        ctx.fillStyle = white;
        ctx.font = `${2.5}px regular`;
        ctx.fillText("0", 1.5 - ctx.measureText("0").width / 2, h + 3);
        // max
        let text = Math.round(opts.max).toString();
        ctx.fillText(text, 1.5 - ctx.measureText(text).width / 2, -1);
        ctx.restore();

        /**
         * PIE
         */
        ctx.save();
        const radius = 10;
        ctx.translate(5.5 + radius, 31 + radius);

        ctx.strokeStyle = grey2;
        ctx.lineWidth = 0.05;
        ctx.beginPath();

        let total = 0;
        const sorted = Object.keys(opts.data).map(key => {
            total += opts.data[key];
            return {
                id: key,
                value: opts.data[key]
            };
        }).sort((a, b) => (b.value - a.value));
        const digit = Math.PI * 2 / total;
        let progress = 0;
        for (let i = 0; i < sorted.length; i++) {
            ctx.fillStyle = white;
            ctx.beginPath();

            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius,
                progress * digit - Math.PI / 2,
                (sorted[i].value + progress) * digit - Math.PI / 2);

            ctx.fill();
            ctx.stroke();

            if (sorted[i].value / total > .03) {

                ctx.font = `bold ${2}px regular`;
                ctx.fillStyle = grey2;
                const angle = (progress + sorted[i].value / 2) * digit - Math.PI / 2;
                const w = ctx.measureText(sorted[i].id).width;
                if (sorted[i].value / total > .2) {
                    ctx.fillText(sorted[i].id,
                        radius / 2 * Math.cos(angle) - w / 2,
                        radius / 2 * Math.sin(angle) + 0.8);
                } else {
                    ctx.fillText(sorted[i].id,
                        radius / 1.7 * Math.cos(angle) - w / 2,
                        radius / 1.7 * Math.sin(angle) + 0.8);
                }
            }

            progress += sorted[i].value;
        }

        ctx.restore();

        /**
         * HEADER
         */
        ctx.fillStyle = white;
        ctx.font = `bold ${3}px regular`;
        text = `Number of Bratwurst tweets with geo tag sent in ${opts.monthName}, ${opts.yearName} by country`;
        const m = ctx.measureText(text);
        if (m.width > (width - 8))
            ctx.font = `bold ${3 * ((width - 8) / m.width)}px regular`;
        ctx.fillText(text, 4, 57);

        /**
         * LOWER BANNER
         */
        ctx.fillStyle = white;
        ctx.fillRect(0, height - 4, width, 4);

        ctx.fillStyle = grey2;
        ctx.font = `${1.6}px regular`;
        const te = ctx.measureText("@bratwurst_bot");
        ctx.fillText("@bratwurst_bot", width - te.width - 1, height - 1.4);
        ctx.fillText(`generated in ${Date.now() - opts.renderTime}ms`, 1, height - 1.4);

        return img.toBuffer();
    } catch (err) {
        return err;
    }
};

// private draw function
function Draw(ctx, code, map) {
    const p = map[code].path;
    const iRatio = 0.01065 * 0.85;

    ctx.beginPath();

    // loop through paths
    for (let iPath = 0; iPath < p.length; iPath++) {
        ctx.moveTo(p[iPath][0][0] * iRatio, p[iPath][0][1] * iRatio);
        for (let iCoord = 1; iCoord < p[iPath].length; iCoord++) {
            ctx.lineTo(p[iPath][iCoord][0] * iRatio, p[iPath][iCoord][1] * iRatio);
        }
        ctx.closePath();
        ctx.fill();

        ctx.stroke();
    }

    // awful hack for Lesotho / South Africa (draw Lesotho again, kids!)
    if (p == "ZA") {
        // loop through paths
        ctx.beginPath();
        for (let iPath = 0; iPath < map["LS"].path.length; iPath++) {
            ctx.moveTo((map["LS"].path[iPath][0][0] * iRatio), (map["LS"].path[iPath][0][1] * iRatio));
            for (let iCoord = 1; iCoord < map["LS"].path[iPath].length; iCoord++) {
                ctx.lineTo((map["LS"].path[iPath][iCoord][0] * iRatio), (map["LS"].path[iPath][iCoord][1] * iRatio));
            }
            ctx.closePath();
            ctx.fill();

            ctx.stroke();
        }
    }
}

/**
 * SOURCE
 */
module.exports.source = function source(opts) {
    try {
        const width = 100;
        const height = 100;
        const img = new Canvas(Math.floor(width * r), Math.floor(height * r));
        const ctx = img.getContext("2d");

        ctx.scale(r, r);

        let text = "";

        /**
         * BACKGROUND
         */
        ctx.fillStyle = grey2;
        ctx.fillRect(0, 0, width, height);

        /**
         * BOX
         */
        ctx.save();
        ctx.translate(4, 4);

        const h = 79;
        let total = 0;
        opts.data.forEach(e => total += e.value);

        ctx.strokeStyle = grey;
        let progress = 0;
        for (let i = 0; i < opts.data.length; i++) {
            const percent = opts.data[i].value / total;

            ctx.fillStyle = white;
            ctx.beginPath();
            const y = (progress / total) * h;
            const height = Math.max(1, percent * h - 0.2);
            ctx.rect(0, y, 60, height);
            ctx.fill();

            if (height > 2) {
                const f = Math.min(4, height - 0.5);
                ctx.font = `bold ${f}px regular`;
                ctx.fillStyle = green;
                const text = (percent * 100).toFixed(1) + "%";
                const w = ctx.measureText(text).width;
                ctx.fillText(text, 30 - w / 2, y + height / 2 + f / 2.6);
            }

            if (height > 1.2) {
                const f = Math.min(3.5, height);
                ctx.font = `bold ${f}px regular`;
                ctx.fillStyle = white;
                ctx.fillText(opts.data[i].name, 63, y + height / 2 + f / 2.6);
            }

            progress += opts.data[i].value;
        }
        ctx.restore();

        /**
         * HEADER
         */
        ctx.fillStyle = green;
        ctx.fillRect(0, 86, width, 10);

        ctx.fillStyle = white;
        ctx.font = `bold ${3}px regular`;
        text = `Most used apps to tweet about Bratwursts in ${opts.monthName}, ${opts.yearName}`;
        const m = ctx.measureText(text);
        if (m.width > (width - 8))
            ctx.font = `bold ${3 * ((width - 8) / m.width)}px regular`;
        ctx.fillText(text, 4, 92);

        /**
         * LOWER BANNER
         */
        ctx.fillStyle = white;
        ctx.fillRect(0, height - 4, width, 4);

        ctx.fillStyle = grey2;
        ctx.font = `${1.6}px regular`;
        const te = ctx.measureText("@bratwurst_bot");
        ctx.fillText("@bratwurst_bot", width - te.width - 1, height - 1.4);
        ctx.fillText(`generated in ${Date.now() - opts.renderTime}ms`, 1, height - 1.4);

        return img.toBuffer();
    } catch (err) {
        return err;
    }
};

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function mix(c1, c2, v) {
    c1 = hexToRgb(c1);
    c2 = hexToRgb(c2);
    return rgbToHex(
        Math.round(255 - (c1.r - c2.r) * v),
        Math.round(255 - (c1.g - c2.g) * v),
        Math.round(255 - (c1.b - c2.b) * v)
    );
}
