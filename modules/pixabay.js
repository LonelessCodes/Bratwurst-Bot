const { key } = require("../keys/pixabay.json");
const { promisify } = require("util");
const request = promisify(require("request"));

let cache = {};

async function get(parameters) {
    let string = [];
    for (let key in parameters) {
        string.push(encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key]));
    }
    string = string.join("&");

    if (!cache[string]) {
        cache = (await request({
            url: `https://pixabay.com/api/?key=${key}&${string}`,
            json: true
        })).body;
        setTimeout(() => delete cache[string], 1000 * 3600 * 24); // cache for 24 hours
    }
    return cache;
}

async function randomWurst() {
    const result = (await get({
        q: "bratwurst",
        image_type: "photo",
        order: "popular",
        per_page: "100" // top 100 most popular images
    })).hits;

    const random = result[Math.floor(Math.random() * result.length)];

    const url = random.webformatURL;
    const source = random.pageURL;
    
    const requestSettings = {
        url,
        method: "GET",
        encoding: null
    };
    const image = (await request(requestSettings)).body;

    return {
        image,
        source
    };
}

module.exports.randomWurst = randomWurst;
