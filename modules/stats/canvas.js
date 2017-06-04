let Canvas;
try {
	Canvas = require("canvas");
} catch (err) {
	Canvas = require("canvas-prebuilt");
}
const GIF = require("gifencoder");

// const path = require("path");

const grey = "#4D4D4D";
const grey2 = "#4C4C4C";
const orange = "#FFC04D";
// const orange2 = "#F2A74C";
const green = "#78C07D";
const white = "#FFFFFF";

// Cairo on Raspi has got problems with custom fonts I discovered, so I'm commenting them 
// until that's fixed
// const comfortaa_r = new Canvas.Font("regular_font", path.join(__dirname, "..", "..", "lib", "fonts", "Comfortaa-Regular.ttf"));
// const comfortaa_b = new Canvas.Font("bold_font", path.join(__dirname, "..", "..", "lib", "fonts", "Comfortaa-Bold.ttf"));

const r = 20.48;

/**
 * TIMES
 */
module.exports.times = function times(opts) {
	try {
		const img = new Canvas(Math.floor(100 * r), Math.floor(70 * r));
		const ctx = img.getContext("2d");
		// ctx.addFont(comfortaa_r);
		// ctx.addFont(comfortaa_b);

		/**
		 * BACKGROUND
		 */
		ctx.fillStyle = white;
		ctx.fillRect(0, 0, img.width, img.height);

		/**
		 * HEADER
		 */
		ctx.fillStyle = grey;
		ctx.font = `bold ${4.3 * r}px regular`;
		ctx.fillText(`Bratwurst Stats of ${opts.monthName}, ${opts.yearName}`, 4 * r, 8 * r);

		const piece = Math.PI * 2 / 12;
		/**
		 * POLAR DIAGRAM DAYTIME
		 */
		// pie *****************
		ctx.save();
		ctx.fillStyle = orange;
		for (let i = 0; i < opts.times.length; i++) {
			ctx.beginPath();
			ctx.moveTo(22 * r, 30 * r);
			const time = opts.times[i] / opts.maxTime;
			let angle = piece * i - Math.PI / 2;
			if (angle < 0) angle += Math.PI * 2;
			ctx.arc(22 * r, 30 * r, (time * 13 + 6) * r, angle, angle + piece);
			ctx.globalAlpha = time;
			ctx.fill();
		}

		ctx.beginPath();
		ctx.fillStyle = white;
		ctx.arc(22 * r, 30 * r, 6 * r, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		// legend **************
		const legend1 = ctx.createLinearGradient(0, 14 * r, 0, (35 + 14) * r);
		legend1.addColorStop(0, orange);
		legend1.addColorStop(1, white);

		ctx.fillStyle = legend1;
		ctx.fillRect(44 * r, 14.5 * r, 4 * r, 34.5 * r);
		// zero
		ctx.fillStyle = grey;
		ctx.font = `${2.8 * r}px regular`;
		ctx.fillText("0", 46 * r - ctx.measureText("0").width / 2, 50.5 * r);
		// max
		let text = Math.round(opts.maxTime).toString();
		ctx.fillText(text, 46 * r - ctx.measureText(text).width / 2, 14 * r);

		ctx.beginPath();
		ctx.fillStyle = white;
		ctx.arc(22 * r, 30 * r, 6 * r, 0, Math.PI * 2);
		ctx.fill();

		/**
		 * POLAR DIAGRAM MONTHS
		 */
		// pies ***************
		ctx.save();

		ctx.fillStyle = green;
		for (let i = 0; i < opts.months.length; i++) {
			ctx.beginPath();
			ctx.moveTo(img.width - 22 * r, 30 * r);
			const month = opts.months[i] / opts.maxMonth;
			let angle = piece * i - Math.PI / 2;
			if (angle < 0) angle += Math.PI * 2;
			ctx.arc(img.width - 22 * r, 30 * r, (month * 13 + 6) * r, angle, angle + piece);
			ctx.globalAlpha = month;
			ctx.fill();
		}
		ctx.restore();

		ctx.beginPath();
		ctx.fillStyle = white;
		ctx.arc(img.width - 22 * r, 30 * r, 6 * r, 0, Math.PI * 2);
		ctx.fill();

		// legend *************
		const legend2 = ctx.createLinearGradient(0, 14 * r, 0, (35 + 14) * r);
		legend2.addColorStop(0, green);
		legend2.addColorStop(1, white);

		ctx.fillStyle = legend2;
		ctx.fillRect(img.width - 48 * r, 14.5 * r, 4 * r, 34.5 * r);
		// zero
		ctx.fillStyle = grey;
		ctx.font = `${2.8 * r}px regular`;
		ctx.fillText("0", (img.width - 46 * r) - ctx.measureText("0").width / 2, 50.5 * r);
		// max
		text = Math.round(opts.maxMonth).toString();
		ctx.fillText(text, (img.width - 46 * r) - ctx.measureText(text).width / 2, 14 * r);

		/**
		 * PIE TEXT
		 */
		ctx.fillStyle = grey;
		ctx.font = `${1.2 * r}px regular`;
		// daytime
		for (let i = 0; i < 12; i++) {
			ctx.beginPath();
			const radius = 6 - 1.2;
			const angle = i * piece - Math.PI / 2;
			const x = radius * Math.cos(angle) + 22;
			const y = radius * Math.sin(angle) + 30 + .6;
			const text = (i * 2).toString();
			const tw = ctx.measureText(text);
			ctx.fillText(text, x * r - tw.width / 2, y * r);
		}
		// months
		const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		for (let i = 0; i < 12; i++) {
			ctx.beginPath();
			const radius = 6 - 1.2;
			const angle = i * piece + piece / 2 - Math.PI / 2;
			const x = radius * Math.cos(angle) + (img.width / r - 22);
			const y = radius * Math.sin(angle) + 30 + .6;
			const text = monthsShort[i];
			const tw = ctx.measureText(text);
			ctx.fillText(text, x * r - tw.width / 2, y * r);
		}

		/**
		 * BANNER
		 */
		ctx.fillStyle = green;
		ctx.fillRect(0, 53 * r, img.width, img.height - 53 * r);

		ctx.fillStyle = white;
		ctx.font = `${2.6 * r}px regular`;
		ctx.fillText("Average Bratwurst activity", 4 * r, (53 + 5) * r);
		ctx.fillText("by hours", 4 * r, (53 + 5 + 4.5) * r, 36 * r);

		ctx.fillText("Daily average Bratwurst", 59 * r, (53 + 5) * r);
		ctx.fillText("activity per month", 59 * r, (53 + 5 + 4.5) * r);

		/**
		 * LOWER BANNER
		 */
		ctx.fillStyle = grey;
		ctx.fillRect(0, img.height - 4 * r, img.width, 4 * r);

		ctx.fillStyle = white;
		ctx.font = `${1.6 * r}px regular`;
		const te = ctx.measureText("@bratwurst_bot");
		ctx.fillText("@bratwurst_bot", img.width - te.width - 1 * r, img.height - 1.4 * r);
		ctx.fillText(`generated in ${Date.now() - opts.renderTime}ms`, 1 * r, img.height - 1.4 * r);

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
		const img = new Canvas(Math.floor(106 * r), Math.floor(65 * r));
		const ctx = img.getContext("2d");

		// ctx.addFont(comfortaa_r);
		// ctx.addFont(comfortaa_b);

		/**
		 * BACKGROUND
		 */
		ctx.fillStyle = grey2;
		ctx.fillRect(0, 0, img.width, img.height);

		/**
		 * MAP
		 */
		ctx.save();
		ctx.strokeStyle = grey2;
		ctx.lineWidth = r * 0.05;
		// part of the data in this json is from https://github.com/gardaud/worldmap-canvas/blob/master/worldmap.js.
		// Thanks for providing this point by point data. I went insane when 
		// parsing SVG path data
		const map = require("../../lib/world.json");

		ctx.translate(10.5 * r, 0);

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
		ctx.translate(img.width - 7 * r, 12 * r);
		const h = 31 * r;
		const legend2 = ctx.createLinearGradient(0, 0, 0, h);
		legend2.addColorStop(0, orange);
		legend2.addColorStop(1, white);

		ctx.fillStyle = legend2;
		ctx.fillRect(0, 0, 3 * r, h);
		// zero
		ctx.fillStyle = white;
		ctx.font = `${2.5 * r}px regular`;
		ctx.fillText("0", 1.5 * r - ctx.measureText("0").width / 2, h + 3 * r);
		// max
		let text = Math.round(opts.max).toString();
		ctx.fillText(text, 1.5 * r - ctx.measureText(text).width / 2, -r);
		ctx.restore();

		/**
		 * PIE
		 */
		ctx.save();
		const radius = 10;
		ctx.translate(r * (5.5 + radius), r * (31 + radius));

		ctx.strokeStyle = grey2;
		ctx.lineWidth = r * 0.05;
		ctx.beginPath();
		// ctx.arc(0, 0, radius * r, 0, Math.PI * 2);

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
			ctx.arc(0, 0, radius * r,
				progress * digit - Math.PI / 2,
				(sorted[i].value + progress) * digit - Math.PI / 2);

			ctx.fill();
			ctx.stroke();

			if (sorted[i].value / total > .03) {

				ctx.font = `bold ${2 * r}px regular`;
				ctx.fillStyle = grey2;
				const angle = (progress + sorted[i].value / 2) * digit - Math.PI / 2;
				const w = ctx.measureText(sorted[i].id).width;
				if (sorted[i].value / total > .2) {
					ctx.fillText(sorted[i].id,
						radius / 2 * Math.cos(angle) * r - w / 2,
						radius / 2 * Math.sin(angle) * r + r * 0.8);
				} else {
					ctx.fillText(sorted[i].id,
						radius / 1.7 * Math.cos(angle) * r - w / 2,
						radius / 1.7 * Math.sin(angle) * r + r * 0.8);
				}
			}

			progress += sorted[i].value;
		}

		ctx.restore();

		/**
		 * HEADER
		 */
		ctx.fillStyle = white;
		ctx.font = `bold ${3 * r}px regular`;
		text = `Number of Bratwurst tweets with geo tag sent in ${opts.monthName}, ${opts.yearName} by country`;
		const m = ctx.measureText(text);
		if (m.width > (img.width - 8 * r))
			ctx.font = `bold ${3 * r * ((img.width - 8 * r) / m.width)}px regular`;
		ctx.fillText(text, 4 * r, 57 * r);

		/**
		 * LOWER BANNER
		 */
		ctx.fillStyle = white;
		ctx.fillRect(0, img.height - 4 * r, img.width, 4 * r);

		ctx.fillStyle = grey2;
		ctx.font = `${1.6 * r}px regular`;
		const te = ctx.measureText("@bratwurst_bot");
		ctx.fillText("@bratwurst_bot", img.width - te.width - 1 * r, img.height - 1.4 * r);
		ctx.fillText(`generated in ${Date.now() - opts.renderTime}ms`, 1 * r, img.height - 1.4 * r);

		return img.toBuffer();
	} catch (err) {
		return err;
	}
};

// private draw function
function Draw(ctx, code, map) {
	const p = map[code].path;
	const iRatio = r * 0.01065 * 0.85;

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
		const img = new Canvas(Math.floor(100 * r), Math.floor(100 * r));
		const ctx = img.getContext("2d");

		// ctx.addFont(comfortaa_r);
		// ctx.addFont(comfortaa_b);

		let text = "";

		/**
		 * BACKGROUND
		 */
		ctx.fillStyle = grey2;
		ctx.fillRect(0, 0, img.width, img.height);

		/**
		 * BOX
		 */
		ctx.save();
		ctx.translate(4 * r, 4 * r);

		const h = 79;
		let total = 0;
		opts.data.forEach(e => total += e.value);

		ctx.strokeStyle = grey;
		let progress = 0;
		for (let i = 0; i < opts.data.length; i++) {
			const percent = opts.data[i].value / total;

			ctx.fillStyle = white;
			ctx.beginPath();
			const y = (progress / total) * h * r;
			const height = Math.max(1, percent * h * r - 0.2 * r);
			ctx.rect(0, y, 60 * r, height);
			ctx.fill();

			if (height > 2 * r) {
				const f = Math.min(4 * r, height - 0.5 * r);
				ctx.font = `bold ${f}px regular`;
				ctx.fillStyle = green;
				const text = (percent * 100).toFixed(1) + "%";
				const w = ctx.measureText(text).width;
				ctx.fillText(text, 30 * r - w / 2, y + height / 2 + f / 2.6);
			}

			if (height > 1.2 * r) {
				const f = Math.min(3.5 * r, height);
				ctx.font = `bold ${f}px regular`;
				ctx.fillStyle = white;
				ctx.fillText(opts.data[i].name, 63 * r, y + height / 2 + f / 2.6);
			}

			progress += opts.data[i].value;
		}
		ctx.restore();

		/**
		 * HEADER
		 */
		ctx.fillStyle = green;
		ctx.fillRect(0, 86 * r, img.width, 10 * r);

		ctx.fillStyle = white;
		ctx.font = `bold ${3 * r}px regular`;
		text = `Most used apps to tweet about Bratwursts in ${opts.monthName}, ${opts.yearName}`;
		const m = ctx.measureText(text);
		if (m.width > (img.width - 8 * r))
			ctx.font = `bold ${3 * r * ((img.width - 8 * r) / m.width)}px regular`;
		ctx.fillText(text, 4 * r, 92 * r);

		/**
		 * LOWER BANNER
		 */
		ctx.fillStyle = white;
		ctx.fillRect(0, img.height - 4 * r, img.width, 4 * r);

		ctx.fillStyle = grey2;
		ctx.font = `${1.6 * r}px regular`;
		const te = ctx.measureText("@bratwurst_bot");
		ctx.fillText("@bratwurst_bot", img.width - te.width - 1 * r, img.height - 1.4 * r);
		ctx.fillText(`generated in ${Date.now() - opts.renderTime}ms`, 1 * r, img.height - 1.4 * r);

		return img.toBuffer();
	} catch (err) {
		return err;
	}
};

/**
 * BEST USER
 */
function randomRange(v0, v1) {
	return Math.random() * (v1 - v0) + v0;
}

module.exports.user = function user(opts) {
	try {
		class Vector {
			constructor(x, y) {
				this.x = x;
				this.y = y;
			}
		}
		const g = 0.15;
		class Particle extends Vector {
			constructor(x, y, vx, vy, color) {
				super(x, y);
				this.origx = x;
				this.origy = y;
				this.origvx = vx;
				this.origvy = vy;
				this.color = color;
				this.rot = Math.random() * 2 * Math.PI;
				this.rot2 = Math.random() * 2 * Math.PI;
				this.reset();
			}

			reset() {
				this.x = this.origx;
				this.y = this.origy;
				this.vx = this.origvx;
				this.vy = this.origvy;
				this.g = g;
			}

			update() {
				this.g += g / 2;
				this.vy += this.g;
				this.x += this.vx;
				this.y += this.vy;
			}

			render(ctx) {
				ctx.fillStyle = this.color;
				ctx.save();
				// rotation first
				ctx.translate(this.x, this.y);
				ctx.rotate(this.rot);

				// than scale
				ctx.scale(Math.cos(this.rot2) * 0.2 + 0.8, Math.cos(this.rot) * 0.2 + 0.8); // squish it to 2/3 vertical size

				ctx.fillRect(0, 0, 12 * r, 12 * r);
				ctx.restore();
			}
		}

		// good stuff
		const width = 640;
		const height = 360;
		const r = width / 100;

		const encoder = new GIF(width, height);

		encoder.start();
		encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat 
		encoder.setDelay(40);  // frame delay in ms 
		encoder.setQuality(10); // image quality. 10 is default. 

		const img = new Canvas(width, height);
		const ctx = img.getContext("2d");

		// ctx.addFont(comfortaa_b);

		const colors = ["#FF83FC", "#FF83FC", "#FF7659", "#FF7659", "#BEFF50", "#4DFFC5", "#54A6FF", "#54A6FF"];

		const particles = new Array(20).fill(null).map(() => new Particle(
			randomRange(-50, -40), randomRange(-20, 20),
			randomRange(0, 20), randomRange(-10, 5),
			colors[Math.floor(Math.random() * colors.length)]
		)).concat(new Array(20).fill(null).map(() => new Particle(
			randomRange(width + 40, width + 50), randomRange(-20, 20),
			randomRange(-20, 0), randomRange(-10, 5),
			colors[Math.floor(Math.random() * colors.length)]
		)));

		for (let frame = 0; frame < 70; frame++) {
			console.log(frame);

			/**
			 * BACKGROUND
			*/
			ctx.fillStyle = white;
			ctx.fillRect(0, 0, img.width, img.height);

			/**
			 * PARTICLES
			 */
			for (let i = 0; i < particles.length; i++) {
				const vec = particles[i];
				vec.update();
				vec.render(ctx);
			}

			/**
			 * TEXT
			 */
			ctx.fillStyle = grey;
			ctx.font = `bold ${8 * r}px regular`;
			const text = "@" + opts.user;
			const m = ctx.measureText(text);
			if (m.width > width - 8 * r) {
				const mult = (width - 8 * r) / m.width;
				ctx.font = `bold ${8 * r * mult}px regular`;
				m.width *= mult;
			}
			ctx.fillText(
				"@" + opts.user,
				width / 2 - m.width / 2,
				(height - 4 * r) / 2 + 8 / 3 * r
			);

			/**
			 * LOWER BANNER
			 */
			ctx.fillStyle = grey;
			ctx.fillRect(0, height - 4 * r, width, 4 * r);

			ctx.fillStyle = white;
			ctx.font = `${1.6 * r}px regular`;
			const te = ctx.measureText("@bratwurst_bot");
			ctx.fillText("@bratwurst_bot", width - te.width - 1 * r, height - 1.4 * r);

			encoder.addFrame(ctx);
		}

		encoder.finish();

		return encoder.out.getData();
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