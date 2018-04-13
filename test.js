const stats = require("./modules/stats");
const fs = require("fs");

async function main() {
    console.log("start");

    let getStats = await stats.month();
    let buf = (await getStats.getStats())[0];
    fs.writeFileSync("modules/stats/month/source.png", buf.source);
    fs.writeFileSync("modules/stats/month/global.png", buf.global);
    fs.writeFileSync("modules/stats/month/times.png", buf.times);

    console.log("end");
    process.kill(1);
}
main().catch(console.log);
