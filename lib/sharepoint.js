//======
// SHAREPOINT COMMANDS
//======

var sharepoint = {};

var request = require('request');

//=======================
// SHAREPOINT REQUEST CONFIGS
//=======================
var __commands = {
    CreateCRMLead: {
        title: "CreateCRMLead",
        uri: "NOT IN USE",
        props: ["firstname", "lastname", "email", "city", "country", "phone", "handle"],
        triggers: ["create lead (.*)", "new lead (.*)", "new recruit (.*)", "Create-CRMLead (.*)", "new lead"],
        helptext: "*New recruit*\n*Usage:* Create-CRMLead [Firstname],[Lastname],[Email],[City],[Country],[Phone],[Handle]",
    },
    CreateSite: {
        title: "CreateSite",
        uri: "NOT IN USE",
        props: ["title", "description"],
        triggers: ["new site (.*)", "create site (.*)", "Create-SPSite (.*)"],
        helptext: "*Create-SPSite* \n" + "*Usage:* Create-SPSite [Title], [Description]",
    }
}

var getRequestPayload = function (requestType, url, query) {
    var q = query.split(',');
    var json = {};
    var payloadArr = q.map((r, i) => {
        json[__config[requestType].props[i]] = r;
    });
    return options = {
        headers: {
            "content-type": "application/json"
        },
        uri: __config[requestType].uri,
        method: 'POST',
        json
    };
}

//=======================
// SHAREPOINT INTEGRATION
//=======================

//Create SPSite
sharepoint.createSPSite = function (bot, message) {
    if (!message.match[1]) {
        bot.reply(message, __commands.CreateSite.helptext);
        return;
    }
    var payload = getRequestPayload(__config.Commands.CreateSite.title, __config.CreateSite.uri, message.match[1]);
    request(options, function (error, response, body) {
        if (error) bot.reply(message, `ERROR:\n${error}`)
        else bot.reply(message, `Site ${payload.json.title} requested!`);
    });
}

//Create CRM Lead
sharepoint.createCRMLead = function (bot, message) {
    if (message.match[1] && message.match[1].length > 1) {
        var payload = getRequestPayload(__config.CreateCRMLead.title, __config.CreateCRMLead.uri, message.match[1]);
        request(payload, function (error, response, body) {
            if (!error) {
                bot.reply(message, `Potential recruit ${payload.json.firstname} ${payload.json.lastname} registered`);
            } else {
                console.log(error.toString());
                bot.reply(message, "Sorry, couldn't register recruit! Maybe they've changed something? Look for dejavu's!");
                bot.reply(message, "Sorry, couldn't register recruit! Maybe they've changed something? Look for dejavu's!");
            }
        });
    } else {
        bot.reply(message, __commands.CreateCRMLead.helptext);
    }
};

module.exports = sharepoint;