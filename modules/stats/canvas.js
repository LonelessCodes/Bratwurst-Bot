const Canvas = require("canvas-prebuilt");
const GIF = require("gifencoder");
const fs = require("fs");

const path = require("path");

const grey = "#4D4D4D";
const grey2 = "#4C4C4C";
const orange = "#FFC04D";
const orange2 = "#F2A74C";
const green = "#78C07D";
const white = "#FFFFFF";

const comfortaa_r = new Canvas.Font("regular", path.join(__dirname, "..", "..", "lib", "fonts", "Comfortaa-Regular.ttf"));
const comfortaa_b = new Canvas.Font("bold", path.join(__dirname, "..", "..", "lib", "fonts", "Comfortaa-Bold.ttf"));

const r = 20.48;

/**
 * TIMES
 */
module.exports.times = function times(opts) {
	try {
		const img = new Canvas(Math.floor(100 * r), Math.floor(70 * r));
		const ctx = img.getContext("2d");
		ctx.addFont(comfortaa_r);
		ctx.addFont(comfortaa_b);

		/**
		 * BACKGROUND
		 */
		ctx.fillStyle = white;
		ctx.fillRect(0, 0, img.width, img.height);

		/**
		 * HEADER
		 */
		ctx.fillStyle = grey;
		ctx.font = `${4.3 * r}px bold`;
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

		ctx.addFont(comfortaa_r);
		ctx.addFont(comfortaa_b);

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
		const map = require("./../../lib/world.json");

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

				ctx.font = `bold ${2 * r}px bold`;
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
		ctx.font = `${3 * r}px bold`;
		text = `Number of Bratwurst tweets with geo tag sent in ${opts.monthName}, ${opts.yearName} by country`;
		const m = ctx.measureText(text);
		if (m.width > (img.width - 8 * r))
			ctx.font = `${3 * r * ((img.width - 8 * r) / m.width)}px bold`;
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

		ctx.addFont(comfortaa_r);
		ctx.addFont(comfortaa_b);

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
		ctx.lineWidth = 0.2 * r;
		let progress = 0;
		for (let i = 0; i < opts.data.length; i++) {
			const percent = opts.data[i].value / total;

			ctx.fillStyle = white;
			ctx.beginPath();
			const y = (progress / total) * h * r;
			const height = percent * h * r;
			ctx.rect(0, y, 60 * r, height);
			ctx.fill();
			ctx.stroke();

			if (height > 2 * r) {
				const f = Math.min(4 * r, height - 0.5*r);
				ctx.font = `bold ${f}px bold`;
				ctx.fillStyle = green;
				const text = (percent * 100).toFixed(1) + "%";
				const w = ctx.measureText(text).width;
				ctx.fillText(text, 30 * r - w / 2, y + height / 2 + f / 2.6);
			}

			if (height > 1.2 * r) {
				const f = Math.min(3.5 * r, height);
				ctx.font = `bold ${f}px bold`;
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
		ctx.font = `${3 * r}px bold`;
		text = `Most used apps to tweet about Bratwursts in ${opts.monthName}, ${opts.yearName}`;
		const m = ctx.measureText(text);
		if (m.width > (img.width - 8 * r))
			ctx.font = `${3 * r * ((img.width - 8 * r) / m.width)}px bold`;
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
module.exports.user = function user(opts) {
	try {
		const r = 6.4;
		const encoder = new GIF(640, 360);

		encoder.start();
		encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat 
		encoder.setDelay(40);  // frame delay in ms 
		encoder.setQuality(10); // image quality. 10 is default. 

		const img = new Canvas(640, 360);
		const ctx = img.getContext("2d");

		ctx.addFont(comfortaa_r);
		ctx.addFont(comfortaa_b);

		for (let frame = 0; frame < 1; frame++) {

			/**
			 * BACKGROUND
			 */
			ctx.fillStyle = white;
			ctx.fillRect(0, 0, img.width, img.height);

			/**
			 * LOWER BANNER
			 */
			ctx.fillStyle = grey;
			ctx.fillRect(0, img.height - 4 * r, img.width, 4 * r);

			ctx.fillStyle = white;
			ctx.font = `${1.6 * r}px regular`;
			const te = ctx.measureText("@bratwurst_bot");
			ctx.fillText("@bratwurst_bot", img.width - te.width - 1 * r, img.height - 1.4 * r);

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