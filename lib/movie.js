var movie = {}
var imdb = require("imdb-api")

movie.apikey = process.env.IMDB_API_KEY;
movie.get = (bot, message) => {
    var query = message.match[1];
    var key = movie.apikey;
    console.log(`Got IMDB query for ${query}`)
    imdb.get({ name: query }, { apiKey: key, timeout: 10000 }).then(data => {
        console.log("IMDB RESULTS FOR "+query)
        console.log(data)
        if(data.imdburl) bot.reply(message, data.imdburl)
    })
}

module.exports = movie;