//======
// HELPERS
//======

var helpers = {};

//Generate guid
helpers.guid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

// is it friday?
helpers.isItFriday = function (asBool) {
    var now = new Date();
    var today = now.getDay();
    var daywanted = 5;
    var offset = today - daywanted;
    if (asBool) {
        return offset == 0 ? true : false;
    }
    switch (offset) {
        case -1:
        case 6:
            return ("Almost!");
        case 0:
            return ("Yep!");
        case 1:
        case -6:
            return ("You just missed it...");
        default:
            return ("Nope");
    }
}

//Random bad name
helpers.randomBadName = function () {
    var badnames = ["'re a cunt",
        "'re a dickhead",
        "'re a twat",
        "'re a piece of shit",
        "'re a cockmongler",
        "'re a very very stupid individual",
        "'re a dweeb",
        "'re a moron",
        " should go work for Tata Consulting",
        "'re an inspiration for birth control",
        " should take a shower",
        "'re adopted!"];
    return badnames[Math.floor(badnames.length * Math.random())];
}

//Random 8ball answers
helpers.eightBall = function () {
    var answers = [
        "It is certain",
        "It is decidedly so",
        "Without a doubt",
        "Yes, definitely",
        "You may rely on it",
        "As I see it, yes",
        "Most likely",
        "Outlook good",
        "Yes",
        "Signs point to yes",
        "Reply hazy try again",
        "Ask again later",
        "Better not tell you now",
        "Cannot predict now",
        "Concentrate and ask again",
        "Don't count on it",
        "My reply is no",
        "My sources say no",
        "Outlook not so good",
        "Very doubtful"];
    return answers[Math.floor(answers.length * Math.random())];
}

helpers.craps = function (dice1, dice2) {
    d1 = dice1 - 1;
    d2 = dice2 - 1;
    var
        one = ["Snake Eyes", "Ace Deuce", "Easy Four", "Fever Five", "Easy Six", "Seven Out"],
        two = [one[1], "Hard Four", one[3], one[4], one[5], "Easy Eight"],
        three = [one[2], one[3], "Hard Six", one[5], two[5], "Nina"],
        four = [one[3], one[4], one[5], "Hard Eight", three[5], "Easy Ten"],
        five = [one[4], one[5], two[5], three[5], "Hard Ten", "Yo-leven"],
        six = [one[5], two[5], three[5], four[5], five[5], "Boxcars"],
        eyes = { 0: one, 1: two, 2: three, 3: four, 4: five, 5: six };
    return eyes[d1][d2];
}

//Format uptime
helpers.formatUptime = function (uptime) {
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

//Is Numeric
helpers.isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

helpers.giphy = function (query) {
    var img = "";
    var q = req.swagger.params.q.value;
    if (q !== "" && q !== "undefined") {
        console.log("Got giphy request for '" + q + "'");
        request("http://api.giphy.com/v1/gifs/search?q=" + q + "&api_key=dc6zaTOxFJmzC", function (error, response, body) {
            var data = JSON.parse(body);
            var max = data.data.length;
            var min = 0;
            var randomNumber = Math.floor(Math.random() * (max - min)) + min;
            var gifUrl = data.data[randomNumber].images.downsized.url;
            console.log("Got json of images, number of images is " + max + ".\nFetching image with url " + gifUrl);
            return (request.get(gifUrl));
        });
    }
}

helpers.giphyUrl = function (query) {
    var img = "";
    var q = req.swagger.params.q.value;
    if (q !== "" && q !== "undefined") {
        console.log("Got giphy request for '" + q + "'");
        request("http://api.giphy.com/v1/gifs/search?q=" + q + "&api_key=dc6zaTOxFJmzC", function (error, response, body) {
            var data = JSON.parse(body);
            var max = data.data.length;
            var min = 0;
            var randomNumber = Math.floor(Math.random() * (max - min)) + min;
            return data.data[randomNumber].images.downsized.url;
        });
    }
}

helpers.urlGetter = function (url) {
    if (url !== "" && url !== "undefined") {
        request("http://api.giphy.com/v1/gifs/search?q=" + url + "&api_key=dc6zaTOxFJmzC", function (error, response, body) {
            console.log("giphy requested with keyword " + url);
            var data = JSON.parse(body);
            var max = data.data.length;
            var min = 0;
            var randomNumber = Math.floor(Math.random() * (max - min)) + min;
            gifUrl = data.data[randomNumber].images.downsized.url;
            console.log("got gif with url " + gifUrl);
            replyMessage = gifUrl;
            bot.reply(message, replyMessage);
        });
    } else {
        bot.reply(message, "You gotta specify a keyword for your giphy, dummy");
    }
};

module.exports = helpers;