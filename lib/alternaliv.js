var fetch = require("node-fetch")
const alternaliv = {}

alternaliv.get = (bot, message) => {
    let user = message.match[1];
    let place = message.match[2];
    let preposition = "in"
    if (place.startsWith("på")) { preposition = "on" }
    if (place.indexOf(" ") > -1 && place.indexOf(" ") < 4) {
        place = place.substring(place.indexOf(" ") + 1, place.length).trim()
    }
    fetch(`http://alternaliv.no/api?type=text&name=${encodeURIComponent(user)}&place=${encodeURIComponent(place)}&preposition=${preposition}`).then(res => {
        res.json().then(liv => {
            let lifeStory = liv.text
                .replace(/_/g, "")
            console.log(lifeStory)
            bot.reply(message, lifeStory)
        })
    })

}

module.exports = alternaliv;