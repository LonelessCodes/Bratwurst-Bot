/**
 * interface for sprite sheet based font drawing
 */
const fs = require("fs");
const path = require("path");
let Canvas;
try {
    Canvas = require("canvas");
} catch (err) {
    Canvas = require("canvas-prebuilt");
}

class Font {
    constructor(json) {
        this.opts = fs.readFileSync(path.resolve(json), "utf8");
        this.opts = JSON.parse(this.opts);
        const sheet = new Canvas.Image;
        sheet.src = fs.readFileSync(path.join(path.dirname(json), this.opts.source));
        this.sheet = sheet;
    }

    text(text, options) {
        text = text.toUpperCase();
        const sheet = this.sheet;
        const coords = this.opts.coords;
        let width = 0;
        let height = this.opts.height;
        for (let i = 0; i < text.length; i++) {
            const coord = coords[text.charAt(i)];
            if (!coord) continue;
            width += coord.width;
        }
        width -= options.spacing * (text.length - 1);

        const canvas = new Canvas(width, height);
        const ctx = canvas.getContext("2d");
        let x = 0;
        for (let i = 0; i < text.length; i++) {
            const coord = coords[text.charAt(i)];
            if (!coord) continue;
            ctx.drawImage(sheet, coord.x, coord.y, coord.width, coord.height, x, 0, coord.width, coord.height);
            x += coord.width - options.spacing;
        }

        if (options.color) {
            const imagedata = ctx.getImageData(0, 0, width, height);
            const rgb = hexToRgb(options.color);
            const data = imagedata.data;
            for (let i = 0; i < data.length; i += 4) {
                data[i + 0] = lerp(255, rgb.r, (255 - data[i + 0]) / 255);
                data[i + 1] = lerp(255, rgb.g, (255 - data[i + 1]) / 255);
                data[i + 2] = lerp(255, rgb.b, (255 - data[i + 2]) / 255);
            }
            ctx.putImageData(imagedata, 0, 0);
        }

        return canvas;
    }
}

function lerp(x0, x1, v) {
    return (x1 - x0) * v + x0;
}

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

module.exports = Font;
