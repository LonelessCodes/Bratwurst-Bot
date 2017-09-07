let Canvas;
try {
    Canvas = require("canvas");
} catch (err) {
    Canvas = require("canvas-prebuilt");
}
const GIF = require("gifencoder");

const grey = "#4D4D4D";
const grey2 = "#4C4C4C";
const orange = "#FFC04D";
// const orange2 = "#F2A74C";
const green = "#78C07D";
const white = "#FFFFFF";

const r = 20.48;

// exports

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
