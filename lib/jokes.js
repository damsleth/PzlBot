//======
// JOKES
//======

var jokes = {};

//Random joke
jokes.getJoke = () => jokesList[Math.floor(jokesList.length * Math.random())];

var jokesList = [
    'Yo mamma.... Yo mamma like a bowling ball... she gets picked up. Fingered. Thrown in the gutter...... still comes back for more',
    'Yo mama so fat, she stepped on the bathroom scale and went "Hey, thats my phone number!"',
]

module.exports = jokes;