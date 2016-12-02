//======
// JOKES
//======

var jokes = {};

//Random bad name
jokes.getJoke = function () {
    var jokesList = [];
    return jokesList[Math.floor(jokesList.length * Math.random())];
}

module.exports = jokes;