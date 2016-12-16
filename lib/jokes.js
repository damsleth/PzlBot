//======
// JOKES
//======

var jokes = {};

//Random bad name
jokes.getJoke = function () {
    var jokesList = [
        'Yo mama so fat, she stepped on the bathroom scale and went "Hey, thats my phone number!',
    ];
    return jokesList[Math.floor(jokesList.length * Math.random())];
}

module.exports = jokes;