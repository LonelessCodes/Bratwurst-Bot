module.exports.roll = function roll(array, roller, end) {
    let index = 0;
    const next = () => {
        index++;
        if (index < array.length) {
            roller(array[index], index, () => next());
        } else {
            if (end) end();
        }
    };
    if (array.length === 0) return end();
    roller(array[index], index, next);
};

module.exports.time = function (t1, t2) {
    const t = t2 - t1;
    let result;
    if (t < 1) result = (t * 1000).toFixed(3) + "ns";
    else if (t < 1000) result = t.toFixed(0) + "ms";
    else if (t < 30000) result = (t / 1000).toFixed(1) + "s";
    else result = (t / 60000).toFixed(1) + "m";
    return result;
};

module.exports.cleanText = function (tweet) {
    // remove special characters
    let str = tweet.text;
    const ent = tweet.entities;
    Object.keys(ent).forEach(key => {
        ent[key].forEach(object => {
            str = str.replace(object.text || object.screen_name || object.url, "");
        });
    });

    str = str.replace(/[^a-zA-Z0-9ß.,:;?!&%\(\)äöü'" ]/g, "").replace(/&amp;/g, "&");

    str = str.replace(/\&amp/g, "&");

    while (/ \ /g.test(str))
        str = str.replace(/ \ /g, " ");
    if (str.charAt(str.length - 1) === " ")
        str = str.slice(0, str.length - 1);
    if (str.charAt(0) === " ")
        str = str.slice(1, str.length);
    
    return str;
};
