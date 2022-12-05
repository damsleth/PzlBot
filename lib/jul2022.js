//=====================
// KODE24 KODEKALENDER COMMANDS
//=====================

// SYNTAX:
// @bender kodekalender|kode24|jul2022
// @bender kodekalender|kode24|jul2022 team TEAMNAME

const jul2022 = {}
var request = require('request')

jul2022.getTeams = (bot, message) => {
  try {
    let key = message.match[1]
    let val = message.match[2]
    let teamsURL = `${process.env.JUL2022_API_ENDPOINT}/highscore`
    let options = { url: teamsURL, headers: { accept: "application/json" } }
    console.log(`fetching top teams from kode24 julekalender at ${teamsURL}`)
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let allJson = JSON.parse(body)
        let teamsJson = allJson.teamScores
        if (key && val) {
          console.log(`key: ${key}`)
          console.log(`val: ${val}`)
          return jul2022.teamDetails(bot, message, val, allJson)
        } else {
          // could also use teamsJson.rank, but this is faster since they're already sorted
          let topTen = teamsJson.filter((_t, i) => i < 10)
          let topStr = `#\tPoints\tTeam`
          topTen.forEach(t => topStr += `\n${t.rank}\t\t${t.points}\t\t${t.nameStyled} (${t.memberCount})`)
          bot.reply(message, topStr)
        }
      }
    })
  } catch (e) {
    console.log(e)
    bot.reply(message, `*Error while fetching jul2019 top teams:*\n${e}`)
  }
}

jul2022.teamDetails = (bot, message, val, allTeamsJson) => {
  bot.reply(message, `Team details are not implemented for Jul2022, sorry!`)
  try {
    let teamName = val.trim().toUpperCase()
    let teamStr = ""
    let teamDetails = allTeamsJson.filter(team => team.nameStyled == teamName)[0]
    if (!teamDetails) { bot.reply(message, `no team with name ${teamName} found`) }
    teamStr += `*TEAM ${teamName}*\n*Rank:* ${teamDetails.rank}\n*Points:* ${teamDetails.points}\n*Members:* ${teamDetails.memberCount}\n`
    teamDetails.members.forEach(member => teamStr += ` ${member} |`)
    bot.reply(message, teamStr)
  } catch (e) {
    console.log(e)
    bot.reply(message, `Error fetching team details`)
  }
}


module.exports = jul2022;

