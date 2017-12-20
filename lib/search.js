var search = {},
    fetch = require('node-fetch'),
    __searchconfig = {
        baseurl: "https://www.googleapis.com/customsearch/v1?",
        apikey: process.env.G_API_KEY,
        cx: process.env.G_SEARCH_ENGINE_ID,
    };

var baseQueryURL = `${__searchconfig.baseurl}key=${__searchconfig.apikey}&cx=${__searchconfig.cx}&q=`;

search.getSearchResultsJSON = (bot, message) => {
    var response = "",
        query = message.match[1],
        params = message.match[2] || "";
    fetch(`${baseQueryURL}${query}&${params}`).then(j => j.json().then(searchResults => searchResults.items.forEach(result => response += `\n*${result.title}*\n${result.link}\n${result.snippet}\n`)))
        .then(() => bot.reply(message, response));
}

module.exports = search;