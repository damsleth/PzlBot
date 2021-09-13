/** 
 * Norwegian election stats feature for Kommunevalg 2019
 * TODO: Stortingsvalg 2021
 */
var request = require('request')
const jsdom = require("jsdom")
const { JSDOM } = jsdom

const election = {}

election.get = (bot, message) => {
    if (message.match[0].toLowerCase().trim().indexOf("stortingsvalg") > -1) {
        stortingsvalg(bot, message)
    }
    else {
        kommunevalg(bot, message)
    }
}

function kommunevalg(bot, message) {
    var kommunenavn = message.match[1].toLowerCase().trim()
    console.log(`Getting latest polls from ${kommunenavn}`)
    var pollUrl = process.env.POLLOFPOLLS_KOMMUNEVALG_URL
    // Get all kommuner
    request(pollUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var dom = new JSDOM(body)
            var kommuner = {}
            let kOptions = dom.window.document.querySelectorAll("#content form p select option")
            console.log(`got ${kOptions["length"]} values`)
            kOptions.forEach(a => {
                let num = a["value"]
                let txt = a.innerHTML
                if (txt) {
                    let name = txt.toLowerCase().trim()
                    kommuner[name] = num
                }
            })
            console.log(`Kommune: ${kommunenavn} - nummer: ${kommuner[kommunenavn]} `)
            var kommuneUrl = `${pollUrl}&kommune=${kommuner[kommunenavn]}`
            request(kommuneUrl, function (error, response, kbody) {
                if (!error && response.statusCode == 200) {

                    // WORKS FOR KOMMUNEVALG 2019 RESULTS AS OF 10.9.19
                    console.log(`Got polls from ${kommunenavn}`)
                    var kdom = new JSDOM(kbody)
                    var results = {}
                    var allRows = [].slice.call(kdom.window.document.querySelectorAll("#content .table-wrapper:first-of-type tr")).splice(2)
                    allRows.forEach(row => {
                        var partyTH = row.querySelector("th")
                        var percentTD = row.querySelector("td:nth-of-type(6)")
                        if (partyTH && percentTD) {
                            var party = partyTH.textContent
                            var percent = percentTD.textContent
                            results[party] = percent
                        }
                    })
                    let msg = `*Kommunevalg 2019 results from ${kommunenavn[0].toUpperCase()}${kommunenavn.substring(1)}*\n`
                    Object.keys(results).forEach(p => { msg += (`*${p}*: ${results[p]}\n`) })
                    bot.reply(message, msg)
                }
            })
        }
    })
}

function stortingsvalg(bot, message) {
    var pollUrl = process.env.POLLOFPOLLS_STORTINGSVALG_URL
    // Get all kommuner
    request(pollUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var dom = new JSDOM(body)
            let parties = dom.window.document.querySelector(".table-wrapper tr").textContent.replace(/\n/g, ';').split(';').slice(2,-1)
            let results = dom.window.document.querySelector(".table-wrapper tr:nth-child(2)").textContent.replace(/\n/g, ';').split(';').slice(2,-1)
            let res = parties.map((p, i) => `*${parties[i]}*: ${results[i]}`).join("\n")
            let msg = `* Latest Stortingsvalg polls:*\n${res}`
            bot.reply(message, msg)
        }
    })
}

module.exports = election