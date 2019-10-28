//======
// LUNCH aka DSS MENU
//======

var request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const lunch = {};

lunch.get = (bot, message) => {
    var day = new Date().getDay() - 1; // corresponds to the index of the day menu array
    if (day > 4) { bot.reply(message, "No lunch on weekends, bruh") } else {
        var menuUrl = process.env.DSSMENU_URL;
        request(menuUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var dom = new JSDOM(body);
                let dayMenus = dom.window.document.querySelectorAll(".week-container .day")
                let menu = dayMenus[day];
                if (menu.innerHTML) {
                    let menuStr = menu.innerText;
                    bot.reply(message, menuStr)
                }
            }
        });
    }
}

module.exports = lunch;