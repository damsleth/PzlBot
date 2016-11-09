//======
// HELPERS
//======

var helpers = {};

//Generate guid
helpers.guid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

//Random bad name
helpers.randomBadName = function() {
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
helpers.eightBall = function() {
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

//Format uptime
helpers.formatUptime = function(uptime) {
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
helpers.isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}