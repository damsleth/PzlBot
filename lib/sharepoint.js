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
        uri: "https://prod-26.westeurope.logic.azure.com:443/workflows/f5467c0caf5f4b2c89c99d0cc178c450/triggers/manual/run?api-version=2015-08-01-preview&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mmepSJpLDsrmRA8DpRYQoc_dlSXXL3qNHEn4NkdVToA",
        props: ["firstname", "lastname", "email", "city", "country", "phone", "handle"],
        triggers: ["create lead (.*)", "new lead (.*)", "new recruit (.*)", "Create-CRMLead (.*)", "new lead"],
        helptext: "*New recruit*\n*Usage:* Create-CRMLead [Firstname],[Lastname],[Email],[City],[Country],[Phone],[Handle]",
    },
    CreateSite: {
        title: "CreateSite",
        uri: "https://prod-07.westeurope.logic.azure.com/workflows/09028edc18fd4db490b1c2df8cdf682d/triggers/manual/run?api-version=2015-08-01-preview&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=PiQ1nCxm1uR2_UMFlVE0zsG_AV9VXGKK07zkAcECzVY",
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
        else bot.reply(message, `Site ${payload.json.title} requested! \n see https://appsters2017.sharepoint.com/sites/directory/Lists/Sites for status`);
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