//===========================
// CRYPTOCOMPARE API COMMANDS
//===========================

var currency = {};
var fetch = require('node-fetch');

currency.getExchangeRate = (bot, message) => {
    var fromcur = message.match[1].toUpperCase();
    console.log(`From currency ${fromcur}`)
    var amount = parseInt(fromcur.split(" ")[0], 10) || 1;
    if (fromcur.split(" ").length === 2) fromcur = fromcur.split(" ")[1];
    var tocur = message.match[2].toUpperCase();
    console.log(`to currency ${tocur}`)
    if (!fromcur || !tocur) bot.reply(message, `You need to specify two currencies, e.g. BTC NOK`);
    fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fromcur}&tsyms=${tocur}`).then(d => d.json().then(rate => {
        if (rate.Response === "Error") {
            if (fromcur == "NOK") bot.reply(message, "Can't convert from NOK to other currencies, sorry.")
            else bot.reply(message, rate.Message);
        }
        var conversion = (parseFloat(rate[fromcur][tocur], 10)) * amount;
        var value = conversion.toString().replace(".", ",");
        if (amount === 1) bot.reply(message, `${tocur} pr. ${amount} ${fromcur} : *${value},-*`)
        else bot.reply(message, `${amount} ${fromcur} in ${tocur}: *${value},-*`);
    }));
};

module.exports = currency;