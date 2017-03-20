const fs = require("fs");
const Canvas = require("./lib/pureimage");

const img = new Canvas(500, 500, { fill: "white" });
const ctx = img.getContext("2d");

const grey = "#4D4D4D";
const orange = "#FFC04D";
const orange2 = "#F2A74C";
const green = "#78C07D";
const white = "#FFFFFF";

ctx.fillStyle = orange;
ctx.fillRect(0-1, 0-1, img.width+2, img.height+2);

ctx.strokeStyle = white;
ctx.globalAlpha = 0.5;
ctx.arc(250, 250, 200, 0, Math.PI * 2);
ctx.stroke();

fs.writeFileSync("img.png", Canvas.encodePNGSync(img));