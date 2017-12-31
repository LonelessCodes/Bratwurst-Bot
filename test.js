const stats = require("./modules/stats");
const fs = require("fs");

async function main() {
    console.log("start");

    let getStats = await stats.month();
    let buf = (await getStats.getUser()).buf;
    fs.writeFileSync("modules/stats/month/user.gif", buf);

    console.log("end");
    process.kill(1);
}
main().catch(console.log);
