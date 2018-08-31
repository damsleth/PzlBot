var tlf = {};
var moment = require("moment");
var jwtsimple = require("jwt-simple");
var store = require("store");
var fetch = require("node-fetch");

tlf.endpoint = process.env.TLF_ENDPOINT;
var debug = false;

tlf.tlfQuery = (bot, message) => {
    var query = message.match[1];
    console.log(`Got tlf query for "${query}"`)
    if (query) {
        // debug mode
        if (query.indexOf("--debug") > -1) {
            debug = true;
            console.log(`Debug mode, returning uncached raw JSON`)
            var cleanQuery = query.substring(0, query.indexOf(" --debug"));
            tlf.fetchData(cleanQuery).then(data => bot.reply(message, JSON.stringify(data)))
        } else {
            var cachedResult = tlf.tryGetResultFromCache(query)
            if (query.indexOf("--uncached") > -1) {
                query = query.substring(0, query.indexOf(" --uncached"));
                cachedResult = false;
                console.log("--uncached parameter passed, requesting data from endpoint")
            }
            //returning cached response from store
            if (cachedResult) bot.reply(message, tlf.getResults(cachedResult))
            else {
                console.log(`Passing query: ${query} to tlf.fetchData()`)
                tlf.fetchData(query).then(data => {
                    //caching response
                    tlf.cacheResult(query, JSON.stringify(data))
                    console.log(`Data retrieved, parsing results`)
                    bot.reply(message, tlf.getResults(data))
                })
            }
        }
    } else bot.reply(message, "No tlf query specified")
}

function Person(Firstname, Lastname, Phone, Gender, Birthdate, StreetAddress, LatLong) {
    this.Firstname = Firstname;
    this.Lastname = Lastname;
    this.Phone = Phone;
    this.Gender = Gender;
    this.Birthdate = Birthdate;
    this.StreetAddress = StreetAddress;
    this.Location = LatLong;
}

tlf.getResults = (res) => {
    var props = ["Firstname", "Lastname", "Gender", "Birthdate", "StreetAddress", "ContactPoints"]
    if (res.Hits) {
        var results = []
        res.Hits.forEach(hit => {
            // Person - TODO: BUSINESSES
            if (hit.Person) {
                var person = new Person()
                var personHit = hit.Person
                props.forEach(prop => {
                    if (personHit[prop]) {
                        if (prop === "ContactPoints") person.Phone = `tel://${personHit[prop][0].Value}`;
                        else if (prop === "Birthdate") person.Birthdate = new Date(personHit[prop]).toDateString();
                        else if (prop === "StreetAddress") {
                            var addr = personHit[prop]
                            person.StreetAddress = `${addr.StreetName} ${addr.HouseNumber}${addr.HouseLetter}, ${addr.PostalCode} ${addr.PostalArea}`
                            if (addr.Coordinate) person.Location = `https://www.google.com/maps/search/${addr.Coordinate.Latitude},${addr.Coordinate.Longitude}`
                        } else person[prop] = personHit[prop]
                    }
                })
                results.push(person)
            }
        })
        return tlf.composeReply(results)
    }
}

tlf.composeReply = (results) => {
    let reply = "";
    results.forEach(res => {
        console.log("composing reply for hit:");
        console.log(res);
        [...Object.keys(res)].forEach(key => {
            if (res[key]) reply += "*" + key + "*: " + res[key] + "\n";
        });
        reply += "\n\n"
    })
    return reply;
}

tlf.fetchData = (q) => {
    console.log(`fetching data on ${q}`)
    return fetch(`${tlf.endpoint}unit?QueryString=${q}`, {
        headers: {
            "Authorization": tlf.getToken(),
            "X-VK1881-API-CLIENT": process.env.TLF_CLIENT,
        }
    }).then(r => r.json().then(result => result))
}

tlf.cacheResult = (query, result) => {
    store.set(`TLF ${query}`, result)
    console.log(`Cache entry for ${query} stored`)
}

tlf.tryGetResultFromCache = (query) => {
    var cachedResult = store.get(`TLF ${query}`)
    if (cachedResult) {
        console.log(`Returning cache entry for ${query}`)
        return JSON.parse(cachedResult)
    } else {
        console.log(`No cache entry for ${query}, fetching from tlf endpoint`)
        return false
    }
}

tlf.getToken = () => {
    if (tlf.needsTokenRefresh() || !store.get("TlfToken")) {
        console.log("JWT token stale or uncached")
        var token = `JWT ${tlf.createToken(process.env.TLF_USER, process.env.TLF_HASH)}`
        store.set("TlfToken", token)
        store.set("LastTokenRefresh", new Date().toString())
    }
    console.log("Getting stored JWT token")
    return store.get("TlfToken")
}

tlf.needsTokenRefresh = () => {
    var lastTokenRefresh = store.get("LastTokenRefresh")
    if (lastTokenRefresh) return (new Date() - new Date(lastTokenRefresh) > 86400000)
    else return true
}

//Creates a JWT token that is valid for 1 day
tlf.createToken = (user, secret) => {
    console.log("Generating JWT token")
    var now = parseInt(moment.utc().format("X"));
    var expires = parseInt(moment.utc().add(1, 'day').format("X"));
    var jwt = jwtsimple.encode({
        VK1881Identity: user,
        iss: "VK1881Issuer",
        aud: "VK1881Services",
        exp: expires,
        nbf: now
    }, secret);
    return jwt;
}

module.exports = tlf;