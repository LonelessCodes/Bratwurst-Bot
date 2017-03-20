const {exec} = require("child_process");
const path = require("path");
const renameSync = require("fs").renameSync;
let PATH;

const Queue = require("./queue");
const queue = new Queue();

class BlenderJob {
	constructor(blendFile) {
		if (blendFile === void 0) {
			throw new Error("To process a blend file you have to pass it's path!");
		}
		this.blendFile = blendFile;
	}
	python(pyFile) {
		if (pyFile === void 0) {
			throw new Error("To include a python script in the blend file you'll have to pass the file's path :/");
		}
		this.pyFile = pyFile;
		return this;
	}
	frame(frameStart, frameEnd, frameStep) {
		this.frameStart = frameStart;
		this.frameEnd = frameEnd;
		this.frameStep = frameStep;
		return this;
	}
	engine(engine) {
		this.engine = engine;
		return this;
	}
	format(format) {
		this.format = format;
		return this;
	}
	save(output, callback) {
		var singleFrame = !this.frameStart;
		var execString = PATH + "-b " + this.blendFile;
		if (this.pyFile) execString += " -P " + this.pyFile;
		if (typeof output === "string") {
			execString += " -o " + output.split(".")[0];
			var format;
			switch (path.extname(output)) {
			case ".png":
				format = "PNG";
				break;
			case ".jpg":
				format = "JPEG";
				break;
			case ".jpeg":
				format = "JPEG";
				break;
			case ".tif":
				format = "TIFF";
				break;
			case ".tiff":
				format = "TIFF";
				break;
			case ".bmp":
				format = "BMP";
				break;
			}
			if (format) execString += " -F " + format;
		}
		if (!singleFrame) {
			if (this.frameEnd) {
				execString += " -s " + this.frameStart + " -e " + this.frameEnd + (this.frameStep ? " -j " + this.frameStep : "");
				execString += " -a";
			} else {
				singleFrame = true;
				execString += " -f " + this.frameStart;
			}
		} else {
			this.frameStart = 1;
			execString += " -f " + this.frameStart;
		}

		queue.push(done => {
			exec(execString, { maxBuffer: 1024 * 5000 }, err => {
				if (err) {
					done();
					return callback(err);
				}

				if (singleFrame) {
					var f = this.frameStart.toString(); // number
					var str = "";
					for (var i = 0; i < Math.max(0, 4 - f.length); i++) str += "0";
					str += f;
					var name = output.split(".")[0] + str + path.extname(output);
					renameSync(name, output);
				}

				if (this.frameEnd === void 0) {
					done();
					if (callback) callback(null);
				} else {
					exec(`convert -delay ${(100 / 25)} -loop 0 ${output.split(".")[0]}*.${output.split(".")[1]} ${output.split(".")[0]}.gif`, { maxBuffer: 1024 * 5000 }, err => {
						if (err) return callback(err);
						if (callback) callback(null);
						done();
					});
				}
			});
		});
	}
}

module.exports = function init(path) {
	PATH = path ? path + " " : "blender ";

	return BlenderJob;
};
