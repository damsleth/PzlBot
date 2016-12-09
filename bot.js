//===
// BENDER the Pzl Slack bot v1.0 June 2016
// Last updated 9.11.2016 by @damsleth
//===

//Check if there's a slack token, if not, exit
if (!process.env.SLACK_TOKEN) {
    console.log('Error: Specify SLACK_TOKEN in environment');
    process.exit(1);
}

//Spawn bot
var Botkit = require('botkit');
var request = require('request');
var os = require('os');
var http = require('http');
var controller = Botkit.slackbot({ debug: false });
var slackToken = process.env.SLACK_TOKEN;
var bot = controller.spawn({ token: slackToken });
var helpers = require('./lib/helpers');
var jokes = require('./lib/jokes');
var fs = require('fs');
var cheerio = require('cheerio');
var Q = require('q');

//Start Slack RTM
bot.startRTM(function (err, bot, payload) {
    // handle errors...
});

//Prepare the webhook
controller.setupWebserver(process.env.PORT || 3001, function (err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function () {
        // handle errors, or nah.
    });
});

//Keepalive, else the dyno will fall asleep after some minutes.
setInterval(function () {
    http.get("http://pzlbot.herokuapp.com");
}, 300000);

//===
//bot commands
//===

//Say Hi
controller.hears(['hello', 'hey', 'hi', 'hei', 'yo', 'sup', 'wassup', 'hola'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, "Hi!");
});

//Who's yo daddy?
controller.hears(["Who's yo daddy", "Who owns you", "whos your daddy", "who is your daddy", "who's your daddy"], ['direct_message', 'direct_mention', 'mention', 'ambient'], function (bot, message) {
    bot.reply(message, "Kimzter is!");
});

// 8 ball
controller.hears(['8ball', '8-ball', '8 ball', 'eightball', 'eight ball'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, helpers.eightBall());
});

//Call me "name"
controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function (err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function (err, id) {
            bot.reply(message, "Got it. I'll call you " + user.name + " from now on.");
        });
    });
});

//Return name from storage
controller.hears(['what is my name', 'who am i', 'whats my name', 'whoami'], 'direct_message,direct_mention,mention', function (bot, message) {

    controller.storage.users.get(message.user, function (err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function (err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function (response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function (response, convo) {
                                    //Since no further messages are queued after this,
                                    //The conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function (response, convo) {
                                    //Stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function (response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, { 'key': 'nickname' }); //Store the results in a field called nickname

                    convo.on('end', function (convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function (err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function (err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            //This happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, whatever then!');
                        }
                    });
                }
            });
        }
    });
});


//Uptime
controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function (bot, message) {

        var hostname = os.hostname();
        var uptime = helpers.formatUptime(process.uptime());

        bot.reply(message,
            "I'm " + bot.identity.name + ", bitch!" + " I've been running for " + uptime + ".");

    });

controller.on('slash_command', function (bot, message) {
    //Reply to slash command
    bot.replyPublic(message, 'Everyone can see the results of this slash command');
});


//Order Pizza
controller.hears(['pizzatime'], ['ambient'], function (bot, message) {
    bot.startConversation(message, askFlavor);
});

askFlavor = function (response, convo) {
    convo.ask("What flavor of pizza do you want?", function (response, convo) {
        convo.say("Awesome.");
        askSize(response, convo);
        convo.next();
    });
}
askSize = function (response, convo) {
    convo.ask("What size do you want?", function (response, convo) {
        convo.say("Ok.")
        askWhereDeliver(response, convo);
        convo.next();
    });
}
askWhereDeliver = function (response, convo) {
    convo.ask("So where do you want it delivered?", function (response, convo) {
        convo.say("Smooth. Be there in a jiffy!");
        convo.next();
    });
}

//Insult OKMS
controller.hears(['okms', 'OKMS'], ['ambient'], function (bot, message) {
    bot.startConversation(message, okmsWho);
});

okmsWho = function (response, convo) {
    convo.ask("OKMS... remind me again, who's that?", function (response, convo) {
        convo.say("Aaah, right.");
        okmsBought(response, convo);
        convo.next();
    });
}
okmsBought = function (response, convo) {
    convo.ask("Yeah, and he bought like, a pair of QC35's at full price right?", function (response, convo) {
        convo.say("LOL!")
        convo.next();
    });
}

//Russian roulette
controller.hears("russian roulette", "ambient", function (bot, message) {
    var roulette = Math.floor(6 * Math.random()) + 1;
    if (roulette == 1) {
        bot.reply(message, "*BANG*, <@" + message.user + ">, you're dead!");
    }
    else {
        bot.reply(message, "*click*. Whew, <@" + message.user + ">, you'll live.");
    }
});

//Russian roulette by proxy
controller.hears("shoot (.*)", "ambient", function (bot, message) {
    var userToShoot = message.match[1];
    var roulette = Math.floor(6 * Math.random()) + 1;
    if (roulette == 1) {
        bot.reply(message, "*BANG*, " + userToShoot + ", you're dead, and it's all <@" + message.user + ">'s fault");
    }
    else {
        bot.reply(message, "*click*. Whew, " + userToShoot + ", you're lucky <@" + message.user + "> didn't have one in the chamber");
    }
});

//GIPHY
controller.hears(["giphy (.*)", "gif (.*)", "(.*).gif"], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var q = message.match[1];
    if (q) { helpers.giphy(q, bot, message); }
    else { bot.reply(message, "You gotta specify a keyword for your giphy, dummy"); }
});

//Slap user
controller.hears("slap (.*)", ['ambient', 'direct_mention', 'mention'], function (bot, message) {
    var userToSlap = message.match[1];
    bot.reply(message, "*_slaps " + userToSlap + " around a bit with a big trout_*");
});

//Throw two Dice
controller.hears(["two dices", "craps"], ["ambient", "direct_message", "mention", "direct_mention"], function (bot, message) {
    var dice1 = Math.floor(6 * Math.random() + 1);
    var dice2 = Math.floor(6 * Math.random() + 1);
    var name = helpers.craps(dice1, dice2);
    var total = dice1 + dice2;
    bot.reply(message, "CRAPS: <@" + message.user + ">, you threw " + dice1 + " and " + dice2 + " for a total of " + total + ". " + helpers.craps(dice1, dice2).toUpperCase());
});

//Throw Dice
controller.hears("dice", "ambient", function (bot, message) {
    var dice = Math.floor(6 * Math.random()) + 1;
    bot.reply(message, "<@" + message.user + ">, you threw a " + dice);
});

//Battery nagging
controller.hears("batteries", "ambient", function (bot, message) {
    bot.reply(message, "Oh my god stop whining about those god damn batteries!");
});

//Pizza Party
controller.hears(["pizza party", "pizzaparty"], ["ambient", "direct_message", "mention", "direct_mention"], function (bot, message) {
    bot.reply(message, ":pizza: PIZZA PARTY! :pizza: ");
});

//SKAM
controller.hears("SKAM", ["direct_message", "mention", "direct_mention"], function (bot, message) {
    Q.fcall(helpers.getSKAMUpdates()).then(function (updates) {
        if (updates) {
            console.log("got updates \n" + updates);
            bot.reply(message, updates);
        }
    }, function (err) { console.log(err) });
});

//Generate guid
controller.hears(['guid', 'generate guid', 'give me a guid', 'i need a guid'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var uuid = helpers.guid();
    bot.reply(message, "I've got a fresh guid for ya, <@" + message.user + ">: " + uuid);
});

//Insult user
controller.hears('insult (.*)', ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var userToInsult = message.match[1];
    var badname = helpers.randomBadName();
    bot.reply(message, "Hey " + userToInsult + ", you" + badname + ". <@" + message.user + "> sends his regards.")
});

// Is it friday?
controller.hears(['is it friday'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    var iif = helpers.isItFriday();
    var iifBool = helpers.isItFriday(true);
    if (iifBool) {
        helpers.giphy("friday");
    }
    bot.reply(message, helpers.isItFriday());
});

//WORKS!!!!
controller.hears(['doit'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    console.log("requested gif, uploading to slack");
    bot.api.files.upload({
        file: request.get("https://dl.dropboxusercontent.com/u/516927/gif/dooit.gif"),
        channels: message.channel,
        filename: 'do it',
        filetype: 'auto',
        mimetype: "image\/gif",
    }, function (err, res) {
        if (err) {
            bot.botkit.log("Failed to add gif :(", err);
            bot.botkit.log(data);
        }
    });
    console.log("successfully(?) uploaded file");
});

//Mirror mirror
controller.hears(["mirror mirror on the wall, who's the fairest one of all"], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    bot.reply(message, "Famed is thy beauty, <@" + message.user + ">. But hold, a lovely maid I see. Rags cannot hide her gentle grace. Alas, Nina is more fair than thee.");
});