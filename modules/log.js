const { appendFileSync } = require("fs");
const colors = require("colors");
const logPath = require("path").resolve(__dirname + "/../console.log");

/**
 * Fits the length of the input string to the specified length.
 * E.g. Useful to fit a 6bit string (each char either 1 or 0) to an 8bit string
 */
function toString(input, length) {
    input = input.toString ? input.toString() : input;
    let string = "";
    for (let i = 0; i < length - input.length; i++) string += "0";
    string += input;
    return string;
}

function getTimeString(blank) {
    const d = new Date();

    const time =
        toString(d.getMonth() + 1, 2) + "." +
        toString(d.getDate(), 2) + " " +
        toString(d.getHours(), 2) + ":" +
        toString(d.getMinutes(), 2) + ":" +
        toString(d.getSeconds(), 2) + ":" +
        toString(d.getMilliseconds(), 3);

    if (blank) return time + "> ";
    else return colors.red.bold(time) + "> ";
}

function convert(messages) {
    let string = "";
    for (let i = 0; i < messages.length; i++) {
        const elem = messages[i];
        if (elem !== void 0) {
            switch (typeof elem) {
            case "string":
                string += elem;
                break;
            case "number":
                string += elem.toString();
                break;
            case "boolean":
                string += elem ? "true" : "false";
                break;
            default:
                try { string += elem; } catch (err) { break; }
                break;
            }
        }
        if (i < messages.length - 1) string += "; ";
    }
    return string;
}

/**
 * Logger => in case of crashing device you always got a log file to show you what went wrong
 */
function log(...messages) {
    const string = convert(messages);
    console.log(getTimeString() + string);
    appendFileSync(logPath, getTimeString(true) + string + "\n");
}
module.exports = log;
