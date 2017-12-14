//===========================
// CRYPTOCOMPARE API COMMANDS
//===========================

var currency = {};
var fetch = require('node-fetch'),
    helpers = require('./helpers');

currency.getIOTA = (bot, message) => {
    fetch('https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=10', {
        headers: {
            'Cache-Control': 'no-cache'
        }
    }).then(j => j.json().then(d => {
        let price = d.filter(c => c.id == "iota")[0].price_usd;
        bot.reply(message, `IOT pr. USD: *${price}*`);
    }));
}

currency.getExchangeRate = (bot, message, setTopic) => {
    var fromcur = message.match[1].toUpperCase()
    fromcur = fromcur.replace(",", ",/")
    console.log(`From currency ${fromcur}`)
    var amount = parseInt(fromcur.split(" ")[0], 10) || 1
    if (fromcur.split(" ").length === 2) fromcur = fromcur.split(" ")[1]
    var tocur = message.match[2].toUpperCase()
    console.log(`to currency ${tocur}`)
    if (!fromcur || !tocur) bot.reply(message, `You need to specify two currencies, e.g. BTC NOK`)
    console.log(`fetching: https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fromcur}&tsyms=${tocur}`)

    fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fromcur}&tsyms=${tocur}`).then(d => d.json().then(rate => {
        if (rate.Response === "Error") {
            if (fromcur == "NOK") bot.reply(message, "Can't convert from NOK to other currencies, sorry.")
            else bot.reply(message, rate.Message)
        }
        var conversion = (parseFloat(rate[fromcur][tocur], 10)) * amount
        var value = conversion.toString().replace(".", ",")
        if (amount === 1) {
            fromcur.split(",").forEach(coinObj => {
                bot.reply(message, `${coinObj} pr. ${tocur} : *${rate[coinObj][tocur]}*`);
                // if (setTopic) helpers.setTopic(bot, `${coinObj} pr. ${tocur} : *${rate[coinObj][tocur]}*`);
            })
        } else {
            bot.reply(message, `${amount} ${fromcur} in ${tocur}: *${value}*`)
        }
    }));
};

module.exports = currency;