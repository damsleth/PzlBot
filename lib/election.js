/** 
 * Norwegian election stats feature for Kommunevalg 2019
 * TODO: Stortingsvalg 2021
 */
var cheerio = require('cheerio');
var request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const election = {}

election.get = (bot, message) => {
    var kommunenavn = message.match[1].toLowerCase().trim();
    console.log(`Getting latest polls from ${kommunenavn}`)
    var pollUrl = process.env.POLLOFPOLLS_KOMMUNEVALG_URL;
    // Get all kommuner
    request(pollUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var dom = new JSDOM(body);
            var kommuner = {};
            let kOptions = dom.window.document.querySelectorAll("#content form p select option")
            console.log(`got ${kOptions["length"]} values`)
            kOptions.forEach(a => {
                let num = a["value"];
                let txt = a.innerHTML
                if (txt) {
                    let name = txt.toLowerCase().trim();
                    kommuner[name] = num
                }
            })
            console.log(`Kommune: ${kommunenavn} - nummer: ${kommuner[kommunenavn]} `)
            var kommuneUrl = `${pollUrl}&kommune=${kommuner[kommunenavn]}`;
            request(kommuneUrl, function (error, response, kbody) {
                if (!error && response.statusCode == 200) {
                    console.log(`Got polls from ${kommunenavn}`)
                    var kdom = new JSDOM(kbody);
                    var headerRow = kdom.window.document.querySelector("#content .table-wrapper tr")
                    var parties = [].slice.call(headerRow.children).map(h => h.textContent)
                    parties.shift();
                    parties.pop();
                    var lastMeasurementRow = kdom.window.document.querySelector("#content .table-wrapper tr:nth-of-type(5)")
                    var latest = [].slice.call(lastMeasurementRow.children).map(m => m.textContent)
                    latest.pop()
                    latest.shift()
                    var results = {};
                    parties.forEach((h, i) => { results[h] = latest[i] })
                    let msg = `*Latest polls from ${kommunenavn[0].toUpperCase()}${kommunenavn.substring(1)}*\n`
                    Object.keys(results).forEach(party => { msg += (`*${party}*: ${results[party]}\n`) })
                    bot.reply(message, msg)
                }
            })
        }
    });
}

module.exports = election