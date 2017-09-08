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

        const canvas = new Canvas(width, height);
        const ctx = canvas.getContext("2d");
        let x = 0;
        for (let i = 0; i < text.length; i++) {
            const coord = coords[text.charAt(i)];
            if (!coord) continue;
            ctx.drawImage(sheet, coord.x, coord.y, coord.width, coord.height, x, 0, coord.width, coord.height);
            x += coord.width - options.spacing;
        }

        return canvas;
    }
}

module.exports = Font;
