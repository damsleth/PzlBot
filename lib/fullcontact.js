//=====================
// FULLCONTACT COMMANDS
//=====================

var fullcontact = {};
var request = require('request');

fullcontact.getInfo = function (query, bot, message, isDebug) {
    var callback = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var reply = body;
            if (!isDebug) {
                if (isPerson) reply = fullcontact.personFormatter(body);
                else reply = fullcontact.personFormatter(body);
            }
            bot.reply(message, reply);
            bot.botkit.log("reply sent successfully!");
        } else if (response.statusCode == 404) {
            bot.reply(message, `Sorry, couldn't find any info on ${q}.`);
        } else {
            bot.botkit.log("Failed to fetch info from fullcontact");
            bot.botkit.log(error);
        }
    }
    var apiKey = process.env.FULLCONTACT_API_KEY;
    var isPerson;
    var endpointUrl;
    var strippedQuery = (str) => str.startsWith("<") ? str.substring(str.indexOf("|") + 1, str.length - 1) : str;
    var q = strippedQuery(query);
    console.log(`got fullcontact query for ${q}`)
    // we assume it's an encoded username
    if (q.startsWith("<@")) {
        console.log(`looking up slack user info`)
        var userToFind = q.substring(2, q.length);
        request.get(`https://slack.com/api/users.info?user=${userToFind}&token=${process.env.SLACK_TOKEN}`, (error, response, body) => {
            var user = "";
            if (!error) {
                var resJson = JSON.parse(body);
                if (resJson.user.name) {
                    isPerson = true;
                    user = resJson.user.name.toString();
                    console.log(`found twitter handle ${user}`);
                    endpointUrl = `https://api.fullcontact.com/v2/person.json\?twitter\=`;
                }
            } else {
                console.log(`Error retrieving user info for ${userToFind} on behalf of ${message.user}`)
            }
            request.get(`${endpointUrl}${user}&apiKey=${apiKey}`, callback)
        })
        // or we handle email addresses and domains
    } else {
        if (q.indexOf("@") > -1) {
            isPerson = true;
            if (q.startsWith("@")) {
                console.log(`looking up twitter handle ${q}`)
                //remove the @
                q = q.substring(1, q.length);
                endpointUrl = `https://api.fullcontact.com/v2/person.json\?twitter\=`;
            } else {
                console.log(`looking up email ${q}`)
                endpointUrl = `https://api.fullcontact.com/v2/person.json\?email\=`;
            }
        } else {
            isPerson = false;
            console.log(`looking up domain ${q}`)
            endpointUrl = `https://api.fullcontact.com/v2/company/lookup.json\?domain\=`;
        }
        console.log(`firing request to: ${endpointUrl}${q}&apiKey=${apiKey}`);
        request.get(`${endpointUrl}${q}&apiKey=${apiKey}`, callback);
    }
}


fullcontact.personFormatter = (res) => {
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