//======
// LUNCH aka DSS MENU
//======
var request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const lunch = {};

lunch.get = (bot, message) => {
    try {
        var menuUrl = process.env.DSSMENU_URL;
        console.log(`fetching menus from ${menuUrl}`)
        request(menuUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("got menu, parsing...")
                var dom = new JSDOM(body);
                var day = new Date().getDay() - 1; // corresponds to the index of the day menu array
                console.log(`today is day ${day.toString()}`)
                let menu = dom.window.document.querySelectorAll(".week-container .day")[day]
                let dishes = [].slice.call(menu.querySelectorAll(".row .title, .row .description"))
                    .map(d => d.textContent.trim()) // trim
                    .map((d, i) => i % 2 == 0 ? `*${d}*` : d) // add bold to "headers"
                    .join("\n") // join to string
                console.log(`menu`)
                console.log(dishes)
                bot.reply(message, dishes)
            }
        });
    } catch (e) {
        console.log(e)
        bot.reply(message, `*Error while fetching lunch menu:*\n${e}`)
    }
}

module.exports = lunch;