//=====================
// FULLCONTACT COMMANDS
//=====================

var fullcontact = {};
var request = require('request');

fullcontact.getInfo = function (query, bot, message, isDebug) {
    var isPerson;
    var endpointUrl;
    var strippedQuery = (str) => str.startsWith("<") ? str.substring(str.indexOf("|") + 1, str.length - 1) : str;
    var q = strippedQuery(query);
    console.log(`got fullcontact query for ${q}.`)
    if (q.indexOf("@") > -1) {
        isPerson = true;
        if (q.startsWith("@")) {
             endpointUrl = `https://api.fullcontact.com/v2/person.json\?twitter\=`;
        } else {
            endpointUrl = `https://api.fullcontact.com/v2/person.json\?email\=`;
        }
    } else {
        isPerson = false;
        endpointUrl = `https://api.fullcontact.com/v2/company/lookup.json\?domain\=`;
    }
    var apiKey = process.env.FULLCONTACT_API_KEY;
    var options = {
        url: endpointUrl + q,
        headers: {
            'X-FullContact-APIKey': apiKey
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var reply = body;
            if (!isDebug) {
                if (isPerson) reply = fullcontact.personFormatter(body);
                else reply = fullcontact.personFormatter(body);
            }
            bot.reply(message, reply);
            bot.botkit.log(body);
        } else if (response.statusCode == 404) {
            bot.reply(message, `Sorry, couldn't find any info on ${q}.`);
        } else {
            bot.botkit.log("Failed to fetch info from fullcontact");
            bot.botkit.log(error);
        }
    }
    request(options, callback);
}

fullcontact.personFormatter = function (res) {
    if (typeof (res) == "string") res = JSON.parse(res);
    var formatted = "";
    var work,
        contactInfo,
        bio = "",
        demographics,
        location,
        digitalFootprint,
        organizations,
        formerWorkplaces,
        photos,
        socialProfiles;
    if (res.contactInfo) {
        if (res.contactInfo.fullName) {
            formatted = `*${res.contactInfo.fullName}*`;
        }
    } else {
        formatted = `*Name unknown*`;
    }
    if (res.demographics) {
        demographics = res.demographics;
        if (demographics.gender) formatted += ` - ${demographics.gender}`;
        if (demographics.locationDeduced) location = demographics.locationDeduced;
        if (location.city) formatted += `, living in *${location.city.name}*`
        if (location.country) formatted += `, *${location.country.name}*`;
    }
    if (res.organizations) {
        work = res.organizations[0];
        formatted += `\n*${work.title}* at *${work.name}*`;
        if (work.startDate) formatted += ` since ${work.startDate}`;
        if (res.organizations.length > 1) {
            res.organizations.forEach(function (org, i) {
                if (i == 0) return;
                formatted += `\n Former ${org.title} at ${org.name}`
                if (org.startDate) formatted += ` from ${org.startDate}`;
                if (org.endDate) formatted += ` to ${org.endDate}`;
            })
        }
    };
    if (res.contactInfo) {
        if (res.contactInfo.websites) formatted += `\nOwner of ${res.contactInfo.websites[0].url}`;
    }
    if (res.digitalFootprint) {
        if (res.digitalFootprint.topics) formatted += `\nKnows about `;
        res.digitalFootprint.topics.forEach(function (topic) {
            formatted += `*${topic.value};* `;
        });
    }
    if (res.photos) {
        formatted += "\n_*Photos:*_"
        res.photos.forEach(function (photo) {
            formatted += `\n${photo.url}`;
        })
    }
    if (res.socialProfiles) {
        formatted += `\n_*Social Profiles:*_`;
        res.socialProfiles.forEach(function (profile) {
            formatted += `\n*${profile.typeName}:*`;
            formatted += ` - ${profile.url}`;
            if (profile.username) formatted += ` - ${profile.username}`;
            if (profile.bio) bio += `${profile.bio}.`;
        })
    }
    if (bio) formatted += `\n_*Bio:*_ _${bio}_`;
    return formatted;
}

module.exports = fullcontact;