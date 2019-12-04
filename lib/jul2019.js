const jul2019 = {};
var request = require('request');

jul2019.getTeams = (bot, message) => {
    try {
        let teamsURL = `${process.env.JUL2019_API_ENDPOINT}/teams/all-rank`;
        let options = {url: teamsURL, headers:{accept:"application/json"}}
        console.log(`fetching top teams from kode24 julekalender at ${teamsURL}`)
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let teamsJson = JSON.parse(body)
                let topTen = teamsJson.filter((_t, i) => i < 10);
                let topStr = `#\tPoints\tTeam`;
                // TABS ARE HARD MKAY
                topTen.forEach(t => topStr += `\n${t.rank}\t\t${t.points}\t\t${t.nameStyled} (${t.memberCount})`)
                bot.reply(message, topStr)
            }
        });
    } catch (e) {
        console.log(e)
        bot.reply(message, `*Error while fetching jul2019 top teams:*\n${e}`)
    }
}


module.exports = jul2019;

