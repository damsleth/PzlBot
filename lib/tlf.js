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
            query = query.substring(0, query.indexOf("--debug"));
            tlf.fetchData(query).then(data => bot.reply(message, JSON.stringify(data)))
        } else {
            var cachedResult = tlf.tryGetResultFromCache(query)
            //returning cached response from store
            if (cachedResult) bot.reply(message, tlf.parseResults(cachedResult))
            else {
                console.log(`Passing query: ${query} to tlf.fetchData()`)
                tlf.fetchData(query).then(data => {
                    //caching response
                    tlf.cacheResult(query, JSON.stringify(data))
                    console.log(`Data retrieved, parsing results`)
                    bot.reply(message, tlf.parseResults(data))
                })
            }
        }
    } else bot.reply(message, "No tlf query specified")
}


// Parsing JSON response
// TODO: Generic unit parsing || Company specific parsing
tlf.parseResults = (res) => {
    var props = ["Firstname", "Lastname", "Gender", "Birthdate", "StreetAddress", "ContactPoints"]
    var parsedRes = "";

    function addProp(key, val) {
        if (key && val) {
            if (debug) console.log(`Adding property ${key} with value ${val}`)
            parsedRes += "*" + key + "*: " + cleanVal + "\n";
        }
    }
    if (res.Hits) {
        res.Hits.forEach(hit => {
            // Person
            if (hit.Person) {
                var person = hit.Person
                props.forEach(prop => {
                    if (person[prop]) {
                        //ContactPoints. Just returning the first one for now
                        if (prop === "ContactPoints") addProp("Phone", person[prop][0].Value)
                        // StreetAddress
                        else if (prop === "StreetAddress") {
                            var addr = person[prop]
                            addProp("Address", `${addr.StreetName} ${addr.HouseNumber}${addr.HouseLetter}, ${addr.PostalCode} ${addr.PostalArea}`)
                            //Regular prop
                        } else addProp(prop, person[prop]);
                    }
                })
            }
        })
    }
    return parsedRes;
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
    return store.get("TlfToken")
}

tlf.needsTokenRefresh = () => {
    var lastTokenRefresh = store.get("LastTokenRefresh")
    if (lastTokenRefresh) return (new Date() - new Date(lastTokenRefresh) < 86400000)
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