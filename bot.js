//=============================================
// BENDER the Pzl Slack bot
// Last updated 01.12.2017 by @damsleth
//===========================================

bender = `

            i@di      
             @CR       
             @SC       
             RSC      
             @KCi      
             #KC7i     
             RSCQ@i     
            @%GC(CC7Q/  
          #@K%C6QKCCCCC6@            
       (@%CC3%C3CCCC%CCCC6Q          
      GCCCC%C3CCCC66CCCsCCC@
     @6%CCCCCOC6CCCsCCC66O%s@     
     sCCC666CCCCC6%CCCC%CCsRG%#7     
     C6%C63CRQGC3C77CC%7(t((t((7Q^   
     sC3CC@C((CCt((7QG#K#@@@@@@@@G7Q 
     S6CCO#(t((@%/%O@@@@@@O(//R@@sCC
     QsCC6stCC(%@        RC      @@s@            
     @OCCC%((CC%R/       QC      @@7@       
     @s3CCCQC(CCt%%GQRQQQ##QGCG((7R    
     Gs6C6CCCCCCCCCCCCs6CC6CsssC3       
     /@CCC3Cs3GSQQQ#CCQRGQS@ss@Q       
      @3%C@@(@///%///(((((((()          
      @CCCCOR/(@(O%O%%((((((()       
      GCCCCs@%(@///%////(((()         
      CCCCCCG@(@%%CQ%%%%O(/#C        
      sC3C%CCCCGGQQ#QQGGG6CC#@       
    @((%@#3CC3CC%C3CC%CCCCsQC((Q7    
  #Qt((t((7%Q#R@CCQK@Q#QG37((t((7@ 
%7t((((t((((tt(((((((CC(t(tt(t((t((#C   

`;

//Check if there's a slack token, if not, we're probably debugging, so load dotenv
if (!process.env.SLACK_TOKEN) require('dotenv').config();

var botkit = require('botkit'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    fetch = require('node-fetch'),
    request = require('request'),
    os = require('os'),
    http = require('http'),
    slackToken = process.env.SLACK_TOKEN,
    witToken = process.env.WIT_SERVER_ACCESS_TOKEN,
    helpers = require('./lib/helpers'),
    wit = require('./lib/wit'),
    currency = require('./lib/currency'),
    fullcontact = require('./lib/fullcontact'),
    jira = require('./lib/jira'),
    jokes = require('./lib/jokes'),
    legacy = require('./lib/legacy'),
    sharepoint = require('./lib/sharepoint'),
    search = require('./lib/search');

var Wit = require('wit-js');
var client = new Wit.Client({
    apiToken: witToken
});

var mongoStorage = require('botkit-storage-mongo')({
    mongoUri: process.env.MONGOURI
}),
    controller = botkit.slackbot({
        debug: false,
        storage: mongoStorage
    }),
    bot = controller.spawn({
        token: slackToken
    });

//Start Slack RTM
bot.startRTM(function (err, bot, payload) { });

//Prepare the webhook
controller.setupWebserver(process.env.PORT || 3001, function (err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, () => { })
});

//Keepalive, else the dyno will fall asleep after some minutes.
setInterval(() => http.get("http://pzlbot.herokuapp.com"), 300000);

//===
// CONFIG 
//===

var __config = {
    Listeners: {
        All: ["ambient", "direct_message", "direct_mention", "mention"],
        NonAmbient: ["direct_message", "direct_mention", "mention"],
    }
}


//=======================
// GLOBAL HELPER METHODS
//=======================

// CHANNELS
function allChannels() {
    return fetch(`https://slack.com/api/channels.list?token=${slackToken}`).then(j => j.json().then(res => res.channels.filter(chan => chan.is_archived === false)));
}

// USERS
function allUsers() {
    return fetch(`https://slack.com/api/users.list?token=${slackToken}`).then(j => j.json().then(users => users.members.filter(user => user.deleted === false)));
}


//========================
// WIT.AI INTEGRATION - WIT-JS
//========================

controller.hears(['wit (.*)', 'sentiment (.*)', 'analyze (.*)', 'ai (.*)'], __config.Listeners.All, function (bot, message) {
    var msg = message.match[1];
    client.message(msg, {}).then(response => {
        console.log(response.entities);
        wit.analyze(response, bot, message);
    }).catch(err => {
        console.error(err);
        bot.reply(message, "_[machine learning error!]_");
    })
});

//=========
// HELP 
//=========
controller.hears(["help", "-h", "--help", "what can you do", "commands", "usage"], __config.Listeners.NonAmbient, (bot, message) => {
    bot.reply(message, `*BENDER THE IN-HOUSE PZLBOT*
*Usage: [@bender] [command]* ((m) = requires @-mention of bender)

*8ball [question]*: Magic 8-ball!
*craps*: play craps
*dice*: throw dice
*dsssmenu* (m): returns today's cantina menu in the government quarters
*fullcontact* [email] (m): returns info on the specified email address from the fullcontact api
*giphy* [keyword] (m): returns a gif with the specified keyword
*guid* (m): generate a fresh guid
*insult* [user] (m): insult the specified user
*is it friday* (m): checks if it really is friday
*joke* (m): tell a joke
*mannen* (m): checks if Mannen has fallen
*oljefondet*: returns the value of the gov.pension fund
*postsecret* [message] , [channel] (m): posts a secret message on your behalf to the specified channel
*pris* [query] (m): returns the lowest price of an item from prisjakt
*russian roulette*: play russian roulette!
*shoot* [user]: russian roulette by proxy
*slap* [user]: slap user
*svada*: return some svada
*tacocat*: TACOCAT!
*uptime* (m): returns Bender's uptime
*valg2017* (m): returns the election results
*whoami*: Get current user info
*whois [username]*: Get a specific user's info
`);
});

//=======================
// SHAREPOINT INTEGRATION
//=======================
//Create SPSite
controller.hears(["new site (.*)", "create site (.*)", "Create-SPSite (.*)"], __config.Listeners.All, (bot, message) => sharepoint.createSPSite(bot, message));

//Create CRM Lead
controller.hears(["create lead (.*)", "new lead (.*)", "new recruit (.*)", "Create-CRMLead (.*)", "new lead"], __config.Listeners.All, (bot, message) => sharepoint.createCRMLead());


// 8==============D
// WHO AM I
// 8==============D

//list all props
controller.hears(["currentuserinfo"], __config.Listeners.All, (bot, message) => helpers.getUserInfoBlob(bot, message));

//list props nicely (not doing that right now)
controller.hears(["whoami", "who am i", "_spPageContextInfo.CurrentUser"], __config.Listeners.All, (bot, message) => helpers.getCurrentUserInfo(bot, message));

//Who is "user, f.ex U03QK793X"
controller.hears(["whois (.*)", "who is (.*)"], __config.Listeners.All, (bot, message) => helpers.getUserInfo(bot, message));

//Currency exchange rate
controller.hears(["currency (.*) in (.*)", "exhange rate for (.*) (.*)", "convert (.*) to (.*)", "how much is (.*) in (.*)"], __config.Listeners.NonAmbient, (bot, message) => currency.getExchangeRate(bot, message));
controller.hears(["IOTA", "IOT"], __config.Listeners.All, (bot, message) => message.text.length === 4 || message.text.length === 3 ? currency.getIOTA(bot, message) : null);

controller.hears(["crypto (.*)"], __config.Listeners.All, (bot, message) => currency.getExchangeRateCMC(bot, message));

controller.hears("SetTopic (.*)", __config.Listeners.NonAmbient, (bot, message) => helpers.setTopic(bot, message));

//===
//bot commands
//===

//Who's yo daddy?
controller.hears(["Who's yo daddy", "Who owns you", "whos your daddy", "who is your daddy", "who's your daddy"], __config.Listeners.All, (bot, message) => bot.reply(message, "Kimzter is!"));

// 8 ball
controller.hears(['8ball', '8-ball', '8 ball', 'eightball', 'eight ball'], __config.Listeners.NonAmbient, (bot, message) => bot.reply(message, helpers.eightBall()));

// Jokes
controller.hears(['tell me a joke', 'joke'], __config.Listeners.NonAmbient, (bot, message) => bot.reply(message, jokes.getJoke()));

// Har mannen falt?
controller.hears(['Mannen', 'mannen', 'Har mannen falt'], __config.Listeners.NonAmbient, (bot, message) => helpers.mannen(bot, message));

// PostSecret
controller.hears(['postsecret (.*),(.*)', 'postsecret (.*), (.*)'], __config.Listeners.NonAmbient, (bot, message) => {
    var msg = message.match[1];
    var chn = message.match[2];
    message.channel = chn;
    console.log("Posting secretly on behalf of " + message.user);
    console.log("Message: '" + msg + "' in channel: " + chn);
    bot.reply(message, `ps: ${msg}`);
});

//========
// Jira integration
// =======

//Syntax help
controller.hears(['jira help', 'man jira', 'help jira'], __config.Listeners.All, (bot, message) => jira.help(bot, message));

// Create issue
controller.hears(['jira new (.*)', 'jira create (.*)'], __config.Listeners.All, (bot, message) => jira.createIssue(bot, message));

// Find issue
controller.hears(['jira get (.*)', 'jira find (.*)'], __config.Listeners.All, (bot, message) => jira.findIssue(bot, message));

// Transition issue
controller.hears(['jira set (.*)', 'jira transition (.*)'], __config.Listeners.All, (bot, message) => jira.transitionIssue(bot, message));

//Comment on issue
controller.hears(['jira comment (.*)'], __config.Listeners.All, (bot, message) => jira.commentOnIssue(bot, message));

//=====================
// END JIRA INTEGRATION
//=====================


//Call me "name"
controller.hears(['call me (.*)', 'my name is (.*)'], __config.Listeners.NonAmbient, (bot, message) => legacy.callMe(controller, bot, message));

//Google search
controller.hears(['google (.*)', 'google (.*) params:(.*)'], __config.Listeners.NonAmbient, (bot, message) => search.getSearchResultsJSON(bot, message));

//Return name from storage
controller.hears(['what is my name', 'who am i', 'whats my name'], __config.Listeners.NonAmbient, (bot, message) => legacy.whatsMyName(controller, bot, message));

//Uptime
controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], __config.Listeners.NonAmbient, (bot, message) => {
    var hostname = os.hostname(),
        uptime = helpers.formatUptime(process.uptime());
    bot.reply(message, "I'm " + bot.identity.name + ", bitch!" + " I've been running for " + uptime + ".");
});

//Slash commmand
controller.on('slash_command', (bot, message) => bot.replyPublic(message, 'Everyone can see the results of this slash command'));

//Order Pizza
controller.hears(['pizzatime'], __config.Listeners.NonAmbient, (bot, message) => legacy.pizzatime(bot, message));

//Reply to personal insults
controller.hears(['fuck'], __config.Listeners.NonAmbient, (bot, message) => bot.reply(message, "Hey <@" + message.user + "> \n :fu:"));

//Russian roulette
controller.hears("russian roulette", __config.Listeners.All, (bot, message) => {
    (Math.floor(6 * Math.random())) == 0 ?
        bot.reply(message, "*BANG*, <@" + message.user + ">, you're dead!") :
        bot.reply(message, "*click*. Whew, <@" + message.user + ">, you'll live.");
});

//Russian roulette by proxy
controller.hears("shoot (.*)", __config.Listeners.All, (bot, message) => {
    (Math.floor(6 * Math.random())) == 0 ?
        bot.reply(message, "*BANG*, " + message.match[1] + ", you're dead, and it's all <@" + message.user + ">'s fault") :
        bot.reply(message, "*click*. Whew, " + message.match[1] + ", you're lucky <@" + message.user + "> didn't have one in the chamber");
});

//GIPHY
controller.hears(["giphy (.*)", "gif (.*)", "(.*).gif"], __config.Listeners.NonAmbient, (bot, message) => {
    var q = message.match[1];
    if (q) helpers.giphy(q, bot, message);
    else bot.reply(message, "You gotta specify a keyword for your giphy, dummy");
});

//Slap user
controller.hears("slap (.*)", __config.Listeners.All, (bot, message) => bot.reply(message, "*_slaps " + message.match[1] + " around a bit with a big trout_*"));

//Svada
controller.hears("Svada", __config.Listeners.NonAmbient, (bot, message) => bot.reply(message, helpers.svada()));

//Craps
controller.hears(["two dices", "craps"], __config.Listeners.All, (bot, message) => {
    var dice1 = Math.floor(6 * Math.random() + 1);
    var dice2 = Math.floor(6 * Math.random() + 1);
    var name = helpers.craps(dice1, dice2);
    var total = dice1 + dice2;
    bot.reply(message, "CRAPS: <@" + message.user + ">, you threw " + dice1 + " and " + dice2 + " for a total of " + total + ". " + helpers.craps(dice1, dice2).toUpperCase());
});

//Throw Dice
controller.hears("dice", __config.Listeners.All, (bot, message) => bot.reply(message, `<@${message.user}>, you threw a ${(Math.floor(6 * Math.random()) + 1)}`));

//Battery nagging
controller.hears("batteries", __config.Listeners.All, (bot, message) => bot.reply(message, "Oh my god stop whining about those god damn batteries!"));

//TACOCAT
controller.hears(["tacocat", "taco cat", "TACOCAT", "TACO CAT"], __config.Listeners.All, (bot, message) => bot.reply(message, ":taco: :smile_cat:  *_TACOCAT_*  :smile_cat: :taco:"));

//OLJEFONDET
controller.hears(["oljefondet", "nbim", "cash money", "how rich am i", "pensjonsfondet"], __config.Listeners.All, (bot, message) => helpers.nbim(bot, message));

//Pizza Party
controller.hears(["pizza party", "pizzaparty"], __config.Listeners.All, (bot, message) => bot.reply(message, ":pizza: PIZZA PARTY! :pizza: "));

// get channels by name
controller.hears(["GetChannelByName (.*)"], __config.Listeners.NonAmbient, (bot, message) => {
    var channelName = message.match[1];
    console.log("getting channel " + channelName)
    fetch(`https://slack.com/api/channels.list?token=${slackToken}`).then(j => j.json().then(res => {
        var channel = res.channels.filter(chan => (chan.name == channelName))[0];
        console.log(channel);
        if (channel) bot.reply(message, JSON.stringify(channel));
        else bot.reply(message, `couldn't find channel with name ${channelName}`);
    }))
});

controller.hears("GetAllChannels()", __config.Listeners.NonAmbient, (bot, message) => allChannels().then(all => bot.reply(message, JSON.stringify(all))));
controller.hears("GetAllUsers()", __config.Listeners.NonAmbient, (bot, message) => allUsers().then(all => bot.reply(message, JSON.stringify(all))));

// Nei / Jo - disabled because annoying
//controller.hears("n(.*)i", __config.Listeners.NonAmbient, (bot, message) => (message.text.length === 3 || message.text.indexOf("nei") > -1) ? bot.reply(message, "Jo") : null);

//SKAM
controller.hears("SKAM", __config.Listeners.NonAmbient, (bot, message) => {
    request('http://skam.p3.no', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var updates = $('.byline').text();
            bot.reply(message, "Siste SKAM-oppdateringer \n" + updates);
        }
    });
});

//DSSMENU
controller.hears(["DSSMENU", "menu", "meny"], __config.Listeners.NonAmbient, (bot, message) => {
    request('http://regjering.delimeeting.imaker.no/menyer/ukesmeny', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var menu = $('.ukesmeny td:nth-child(' + new Date().getDay() + ')').text();
            bot.reply(message, "MENY FOR " + helpers.getDayName().toUpperCase() + " \n" + menu);
        }
    });
});

// FULLCONTACT info retrieval - gets info on an email address or domain
controller.hears("fullcontact (.*)", __config.Listeners.NonAmbient, (bot, message) => {
    if (message.match[1]) {
        var query = message.match[1];
        fullcontact.getInfo(query, bot, message)
    }
});

// FULLCONTACT info retrieval - gets info on an email address or domain
controller.hears("fullcontactdebug (.*)", __config.Listeners.NonAmbient, (bot, message) => {
    if (message.match[1]) {
        var query = message.match[1].toLowerCase();
        fullcontact.getInfo(query, bot, message, true)
    }
});

//AIBELMENU
controller.hears(["AIBELMENU", "Aibel menu", "Aibel meny", "Aibel"], __config.Listeners.NonAmbient, (bot, message) => {
    request('http://www.coor.no/serviceside-aibel/lunch-menu/', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var reply = "";
            var daytrs = {
                1: [1, 2, 3],
                2: [4, 5, 6],
                3: [7, 8, 9],
                4: [10, 11, 12],
                5: [13, 14, 15]
            }
            var trs = daytrs[new Date().getDay()]
            var kantine = $(".kantine").each(function (i, k) {
                kantineNr = i + 1;
                title = $(k).find("p>strong").text();
                reply += "\n\n" + title;
                trs.forEach(function (tr) {
                    var txt = $("#kantine" + kantineNr + " tr:nth-of-type(" + tr + ") td:nth-of-type(2)").text();
                    if (txt.length > 1) {
                        reply += "\n";
                        reply += txt;
                    }
                });
            })
            bot.reply(message, "AIBEL KANTINEMENY FOR " + helpers.getDayName().toUpperCase() + " \n" + reply);
        }
    });
});

//Latest polls
controller.hears(["polls", "valg2017", "valg 2017", "what are the poll numbers", "latest polls", "stortingsvalg", "heia Erna", "give me the latest numbers"], __config.Listeners.NonAmbient, (bot, message) => {
    bot.reply(message, "Hang on, fetching latest polls...");
    helpers.getAveragePoll(bot, message);
});

//Prisjakt
controller.hears(["prisjakt (.*)", "pris (.*)", "get me the price on (.*)", "how much is (.*)"], __config.Listeners.NonAmbient, (bot, message) => {
    bot.reply(message, "Hang on, fetching prices...");
    var productToFind = message.match[1];
    helpers.prisjakt(productToFind, bot, message);
});

//Generate guid
controller.hears(['guid', 'generate guid', 'give me a guid', 'i need a guid'], __config.Listeners.NonAmbient, (bot, message) =>
    bot.reply(message, `I've got a fresh guid for ya, <@${message.user}>: ${(helpers.guid())}`));

//Insult user
controller.hears('insult (.*)', __config.Listeners.NonAmbient, (bot, message) => {
    var userToInsult = message.match[1];
    var badname = helpers.randomBadName();
    bot.reply(message, "Hey " + userToInsult + ", you" + badname + ". <@" + message.user + "> sends his regards.")
});

// Is it friday?
controller.hears(['is it friday'], __config.Listeners.All, (bot, message) => {
    var iif = helpers.isItFriday();
    var iifBool = helpers.isItFriday(true);
    if (iifBool) {
        helpers.giphy("friday", bot, message);
    }
    bot.reply(message, helpers.isItFriday());
});

//Say Hi
controller.hears(['hello', 'hey', 'hi', 'hei', 'yo', 'sup', 'wassup', 'hola'], __config.Listeners.NonAmbient, (bot, message) => bot.reply(message, "Hi!"));

//Mirror mirror
controller.hears(["mirror mirror on the wall, who's the fairest one of all"], __config.Listeners.NonAmbient, (bot, message) => {
    bot.reply(message, "Famed is thy beauty, <@" + message.user + ">. But hold, a lovely maid I see. Rags cannot hide her gentle grace. Alas, Nina is more fair than thee.");
});