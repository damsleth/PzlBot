//===
//BENDER the Puzzlepart Slack bot
//===

//Check if there's a slack token, if not, exit
if (!process.env.SLACK_TOKEN) {
    console.log('Error: Specify SLACK_TOKEN in environment');
    process.exit(1);
}

//Spawn bot
var Botkit = require('botkit');
var os = require('os');
var controller = Botkit.slackbot({
 debug: false
});
var bot = controller.spawn({
  token: process.env.SLACK_TOKEN
});

// start Slack RTM
bot.startRTM(function(err,bot,payload) {
  // handle errors...
});

//prepare the webhook
controller.setupWebserver(process.env.PORT || 3001, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        // handle errors...
    });
});



//===
//bot commands
//===

controller.hears(['hello','hi','hey'],['direct_message','direct_mention','mention'],function(bot,message) {
    bot.reply(message,"Hi!");
});

controller.hears(["Who's yo daddy"],['direct_message','direct_mention','mention','ambient'],function(bot,message) {
    bot.reply(message,"Kimzter is!");
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, "Got it. I'll call you " + user.name + " from now on.");
        });
    });
});


controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            "I'm " + bot.identity.name + ", bitch!" + " I've been running for " + uptime + ".");

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = Math.round(uptime / 60);
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}


controller.on('slash_command',function(bot,message) {
  // reply to slash command
  bot.replyPublic(message,'Everyone can see the results of this slash command');
});



// pizzatime!
controller.hears(['pizzatime'],['ambient'],function(bot,message) {
  bot.startConversation(message, askFlavor);
});

askFlavor = function(response, convo) {
  convo.ask("What flavor of pizza do you want?", function(response, convo) {
    convo.say("Awesome.");
    askSize(response, convo);
    convo.next();
  });
}
askSize = function(response, convo) {
  convo.ask("What size do you want?", function(response, convo) {
    convo.say("Ok.")
    askWhereDeliver(response, convo);
    convo.next();
  });
}
askWhereDeliver = function(response, convo) { 
  convo.ask("So where do you want it delivered?", function(response, convo) {
    convo.say("Smooth. Be there in a jiffy!");
    convo.next();
  });
}

//OKMS
controller.hears(['okms','OKMS'],['ambient'],function(bot,message) {
  bot.startConversation(message, okmsWho);
});

okmsWho = function(response, convo) {
  convo.ask("OKMS... remind me again, who's that?", function(response, convo) {
    convo.say("Aaah, right.");
    okmsBought(response, convo);
    convo.next();
  });
}
okmsBought = function(response, convo) {
  convo.ask("Yeah, and he bought like, a pair of QC35's at full price right?", function(response, convo) {
    convo.say("LOL!")
    convo.next();
  });
}

//Russian roulette
controller.hears("russian roulette","ambient",function(bot,message){
var roulette = Math.floor(6*Math.random())+1;
if(roulette == 1){
bot.reply(message,"*BANG*, <@"+ message.user +">, you're dead!");
}
else{
bot.reply(message,"*click*. Whew, <@"+ message.user +">, you'll live.");
}
});

//Dice
controller.hears("dice","ambient",function(bot,message){
var dice = Math.floor(6*Math.random())+1;
bot.reply(message,"<@"+ message.user +">, you threw a " + dice);
});

//Cursing
//TODO: Get message.user to be the real user @, not some random ID
controller.hears(['fuck','shit','piss','cunt','faen'],['ambient'],function(bot,message) {
    bot.reply(message, "Whoa whoa whoa, watch the language, <@"+ message.user +">");
});

//Insult user
controller.hears('insult (.*)',['direct_message','direct_mention','mention'],function(bot,message){
    var userToInsult = message.match[1];
    var badname = randomBadName();
    bot.reply(message, "Hey "+userToInsult+", you're a "+ badname +". <@"+ message.user+"> sends his regards." )
});


//Generate guid
controller.hears(['guid','generate guid','give me a guid','i need a guid'],['direct_message','direct_mention','mention','ambient'],function(bot,message){
    var uuid = guid();
        bot.reply(message, "I've got a fresh guid for ya, <@"+ message.user +">: "+ uuid);
});


// HELPERS
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

//random bad name
function randomBadName(){
    var badnames = ["cunt","dickhead","twat","piece of shit","cockmongler","very very stupid individual","dweeb"];
    return badnames[Math.floor(badnames.length*Math.random())];
}