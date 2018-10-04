var fetch = require("node-fetch")
const alternaliv = {}

alternaliv.get = (bot, message) => {
    let user = message.match[1];
    let place = message.match[2];
    let preposition = "in"
    // "på" instead of "i"
    if (place.toLowerCase().startsWith("på")) { preposition = "on" }
    // Remove duplicate "på / i "
    if (place.indexOf(" ") > -1 && place.indexOf(" ") < 4) {
        place = place.substring(place.indexOf(" ") + 1, place.length).trim()
    }
    console.log(`fetching alternaliv for`)
    console.log(user)
    console.log(`growing up in`)
    console.log(place)
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