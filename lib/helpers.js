//======
// HELPERS
//======

var helpers = {}
var request = require('request')
var cheerio = require('cheerio')
var fetch = require('node-fetch')

//Generate guid
helpers.guid = () => {
  var s4 = () => (Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1))
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

// is it friday?
helpers.isItFriday = (asBool) => {
  var now = new Date()
  var today = now.getDay()
  var daywanted = 5
  var offset = today - daywanted
  if (asBool) return offset == 0 ? true : false
  switch (offset) {
    case -1:
    case 6:
      return ("Almost!")
    case 0:
      return ("Yep!")
    case 1:
    case -6:
      return ("You just missed it...")
    default:
      return ("Nope")
  }
}

// Random bad name
helpers.randomBadName = () => {
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
    "'re adopted!"
  ]
  return badnames[Math.floor(badnames.length * Math.random())]
}
// Returns day names
helpers.getDayName = (dStr) => {
  if (!dStr) dStr = new Date()
  var days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']
  var d = new Date(dStr)
  return days[d.getDay()]
}
// Random 8ball answers
helpers.eightBall = () => {
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
    "Very doubtful"
  ]
  return answers[Math.floor(answers.length * Math.random())]
}
// Plays craps
helpers.craps = (dice1, dice2) => {
  d1 = dice1 - 1
  d2 = dice2 - 1
  var
    one = ["Snake Eyes", "Ace Deuce", "Easy Four", "Fever Five", "Easy Six", "Seven Out"],
    two = [one[1], "Hard Four", one[3], one[4], one[5], "Easy Eight"],
    three = [one[2], one[3], "Hard Six", one[5], two[5], "Nina"],
    four = [one[3], one[4], one[5], "Hard Eight", three[5], "Easy Ten"],
    five = [one[4], one[5], two[5], three[5], "Hard Ten", "Yo-leven"],
    six = [one[5], two[5], three[5], four[5], five[5], "Boxcars"],
    eyes = {
      0: one,
      1: two,
      2: three,
      3: four,
      4: five,
      5: six
    }
  return eyes[d1][d2]
}

//Format uptime
helpers.formatUptime = function (uptime) {
  var unit = 'second'
  if (uptime > 60) {
    uptime = Math.round(uptime / 60)
    unit = 'minute'
  }
  if (uptime > 60) {
    uptime = uptime / 60
    unit = 'hour'
  }
  if (uptime != 1) {
    unit = unit + 's'
  }
  uptime = uptime + ' ' + unit
  return uptime
}

//Is Numeric
helpers.isNumeric = (n) => !isNaN(parseFloat(n)) && isFinite(n)

// Returns whether "Mannen" has fallen or not
helpers.mannen = (bot, message) => {
  fetch("http://harmannenfalt.no/api")
    .then(r => r.json().then(mannen => {
      var msg = mannen.falt_ned ? "JA, Mannen har falt!" : "Nei, Mannen har ikke falt."
      bot.reply(message, msg)
    })).catch(e => console.log(e))
}
// Returns the value of the Government Pension Fund (oljefondet)
helpers.nbim = (bot, message) => {
  fetch("https://www.nbim.no/LiveNavHandler/Current.ashx?key=" + this.guid())
    .then(r => r.json().then(j => {
      bot.reply(
        message, `Current value of The Government Pension Fund Global\n*${j.d.liveNavList[0].values[j.d.liveNavList[0].startSecond].Value} NOK*`
      )
    })).catch(e => console.log(e))
}
// Returns the price of an item from prisjakt.no
helpers.prisjakt = (query, bot, message) => {
  var productToFind = encodeURIComponent(query)
  console.log(`searching for "${productToFind}...`)
  if (productToFind) {
    fetch(`https://www.prisjakt.no/ajax/server.php?class=Search_Supersearch&method=search&modes=product&limit=1&q=${productToFind}`)
      .then(res => res.json()
        .then(jres => {
          prod = jres.message.product.items[0]
          if (prod) {
            bot.reply(message, `*${prod.name}*
*Pris: ${prod.price.display}*
*${prod.stock.title}*
${prod.url}`)
          } else {
            bot.reply(message, `Sorry, couldn't find any products matching *"${decodeURIComponent(productToFind)}"*`)
          }
        }))
  }
}

//Returns some svada
helpers.svada = () => {
  var s = ""
  var svada = [
    ["Gitt", "en integrert", "målsetting", "synliggjøres", "potensialet", "innenfor rammen av", "en samlet vurdering"],
    ["Under hensyntagen til", "en optimal", "effekt", "tas det høyde for", "risikofaktorene", "som en følge av", "forholdene"],
    ["I lys av", "en sømløs", "struktur", "iverksettes", "fokus", "for så vidt gjelder", "konseptet"],
    ["Vedrørende", "en implisitt", "agenda", "identifiseres", "synergieffekten", "med henblikk på", "ressurssituasjonen"],
    ["Grunnet", "en proaktiv", "tidshorisont", "initieres", "incitamentet", "i forhold til", "tilgjengeliggjøringen"],
    ["I betraktning av", "en betydelig", "overveielse", "lokaliseres", "forankringen", "hva angår", "føringene"],
    ["Forutsatt", "en økt", "mobilitet", "kommuniseres", "insentivene", "parallelt med", "evalueringen"],
    ["Med utgangspunkt i", "en vesentlig", "treffsikkerhet", "styrkes", "innsatsen", "i relasjon til", "implementeringen"],
    ["I forhold til", "en ikke ubetydelig", "innsats", "realiseres", "erfaringsutvekslingen", "i tilknytning til", "kjernevirksomheten"],
    ["Sett hen til", "en kostnadseffektiv", "kvalitetssikring", "effektueres", "informasjonsflyten", "på bakgrunn av", "visjonen"],
    ["I henhold til", "en avtagende", "problematikk", "forankres", "kriteriene", "avhengig av", "satsingsområdet"],
    ["Med tanke på", "en vedvarende", "ressursbruk", "maksimeres", "strategien", "hva gjelder", "problemstillingen"],
    ["Uavhengig av", "en tiltagende", "avveining", "konkretiseres", "økningen", "eller sagt på en annen måte:", "beskaffenheten"],
    ["Sett på bakgrunn av", "en gjeldende", "avklaring", "tilgjengeliggjøres", "egenarten", "på samme måte som", "vesentligheten"],
    ["Sammenholdt med", "en helhetlig", "implementering", "utvides", "tilstedeværelsen", "i motsetning til", "egenarten"],
    ["På grunn av", "en manglende", "styringsinnsats", "dokumenteres", "oppfølgingen", "innenfor", "målområdet"],
    ["Med hensyn til", "en særlig", "innovasjon", "spores", "resultatene", "i tillegg til", "verdiene"],
    ["Under forutsetning av", "en løpende", "effektivisering", "innhentes", "kunnskapene", "gjennom", "realitetsorienteringen"],
    ["Etter en totalvurdering av", "en langsiktig", "kvalitetsheving", "revitaliseres", "betydningen", "ut fra", "resultatoppnåelsen"],
    ["Uten hensyn til", "en bærekraftig", "utvikling", "stabiliseres", "kompetansehevingen", "med sikte på", "behovene"],
    ["Avhengig av", "en resultatorientert", "måloppnåelse", "genereres", "instrumentet", "på tvers av", "løsningen"],
    ["På grunnlag av", "en tverrfaglig", "oppgaveløsning", "stimuleres", "scenarioet", "på linje med", "parametrene"],
    ["I og med", "en kommunikativ", "arbeidsmodell", "balanseres", "spisskompetansen", "utenom", "ressursinnsatsen"],
    ["Under henvisning til", "en inkluderende", "organisasjon", "ivaretas", "relasjonene", "i forlengelsen av", "konsekvensaspektet"],
    ["Gitt", "en strategisk", "brukermedvirkning", "dannes", "bevaringsverdien", "innenfor rammen av", "fullelektronisk arkiv"],
    ["Under hensyntagen til", "en målrettet", "politikk", "utvikles", "dokumentfangsten", "som en følge av", "resultatoppnåelsen"],
    ["I lys av", "en aktiv", "applikasjonsportefølje", "koordineres", "informasjonen", "for så vidt gjelder", "den fremtidsrettede arkivutviklingen"],
    ["Grunnet", "en virksomhetskritisk", "journalføringspraksis", "prioriteres", "funksjonen", "i forhold til", "kassasjonsplanen"],
    ["I betraktning av", "en velfungerende", "innsynsløsning", "implementeres", "gjenfinningen", "hva angår", "etterspurt digitalt arkivinnhold"],
    ["Forutsatt", "en kvalitetssikret", "rapportmodul", "etableres", "kunnskapsbasen", "parallelt med", "erfaringsdelingen"],
    ["Med utgangspunkt i", "en relevant", "servicegrad", "forbedres", "tilgjengeligheten", "på tvers av", "det digitale Norge"],
    ["I forhold til", "en oppdatert", "Noarkstandard", "avklares", "klausuleringen", "i tilknytning til", "hele arkivsektoren"],
    ["Sett hen til", "en tilpasset", "inngangsportal", "samordnes", "informasjonsmengden", "med tanke på", "fagsakene"],
    ["I henhold til", "en treffsikker", "avleveringsrutine", "effektiviseres", "dokumentasjonen", "avhengig av", "innsatsfaktorene"],
    ["Uavhengig av", "en optimal", "journalenhet", "støttes", "søkefunksjonen", "med henblikk på", "egenforvaltningssakene"],
    ["Sett på bakgrunn av", "en fremtidsrettet", "graderingshjemmel", "konkretiseres", "ordningsprinsippet", "i relasjon til ", "den sømløse integrasjonen"],
    ["På grunn av", "en profilert", "plattform", "frigjøres", "ressursene", "innenfor", "arkivbegrensningen"],
    ["Med hensyn til", "en premissgivende", "kjerneprosess", "analyseres", "innsatsen", "hva gjelder", "arkivdelen"],
    ["Etter en totalvurdering av", "en positiv", "kapasitet", "adresseres", "driften", "ut fra", "arkivlandskapet"],
    ["Uten hensyn til", "en foretrukket", "deponering", "stabiliseres", "komplekset", "med sikte på", "handlingsrommet"],
    ["På grunnlag av", "en grundig", "gjennomgang", "utredes", "visjonen", "på linje med", "lagringsformatene"],
    ["Under henvisning til", "en proaktiv", "autentisering", "moderniseres", "proveniensprinsippet", "i forlengelsen av", "fagsystemene"]
  ]
  svada[0].forEach((n, i) => {
    s += svada[Math.floor(svada.length * Math.random())][i] + " "
  })
  return s
}
// Gets the average voting results from poll of polls
helpers.getAveragePoll = (bot, message) => {
  var pollUrl = process.env.POLLOFPOLLS_URL
  request(pollUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body),
        title = $('#content h1')[0].children[0].data,
        imgUrl = pollUrl + $('#content a img')[0].attribs.src
      bot.reply(message, title)
      bot.api.files.upload({
        file: request.get(imgUrl),
        channels: message.channel,
        filename: "latest polls",
        filetype: 'auto',
        mimetype: "image\/png",
      }, function (err, res) {
        if (err) {
          bot.botkit.log("Failed to upload poll image :(", err)
          bot.botkit.log(err)
        }
      })
    }
  })
}

helpers.dingthebell = (bot, message) => {
  bot.api.files.upload({
    file: request.get("https://media.giphy.com/media/65GPOPT1BCmMTcrHq8/giphy.gif"),
    channels: message.channel,
    filename: "ding_the_bell",
    filetype: 'auto',
    mimetype: "image\/gif",
  }, function (err, res) {
    if (err) {
      bot.botkit.log("Failed to add 'ding the bell'-gif :(", err)
    }
  })
  bot.reply(message, "ding the bell")
}

helpers.overninethousand = (bot, message) => {
  bot.api.files.upload({
    file: request.get("https://i.imgur.com/Rpsq1ha.gif"),
    channels: message.channel,
    filename: "9001",
    filetype: 'auto',
    mimetype: "image\/gif",
  }, function (err, res) {
    if (err) {
      bot.botkit.log("Failed to add 'over 9000'-gif :(", err)
    } else {
      bot.reply(message, "_*IT'S OVER NINE THOUSAND!!!*_")
    }
  })
}

helpers.violin = (bot, message) => {
  bot.api.files.upload({
    file: request.get("https://i.imgur.com/4ROulm2.png"),
    channels: message.channel,
    filename: "worlds_smallest_violin",
    filetype: 'auto',
    mimetype: "image\/png",
  }, function (err, res) {
    if (err) {
      bot.botkit.log("Failed to add the world's smallest violin :(", err)
    }
  })
}

// used by e.g. the "is it friday?"-command
helpers.uploadFile = (bot, message, url, fname, type = "image\/gif") => {
  bot.api.files.upload({
    file: request.get(url),
    channels: message.channel,
    filename: fname,
    filetype: 'auto',
    mimetype: "image\/gif",
  }, function (err, res) {
    if (err) { bot.botkit.log(`Failed to add file ${url} :(`, err) }
  })
}

// Posts a giphy with the specified query to the current channel where it was requested
helpers.giphy = (query, bot, message) => {
  request("http://api.giphy.com/v1/gifs/search?q=" + query + "&api_key=dc6zaTOxFJmzC", function (error, response, body) {
    console.log("giphy requested with keyword " + query)
    var data = JSON.parse(body)
    var max = data.data ? data.data.length : data.length
    var min = 0
    var randomNumber = Math.floor(Math.random() * (max - min)) + min
    if (max > 0) {
      let gifUrl = data.data[randomNumber].images.downsized.url
      console.log("got gif with url " + gifUrl)
      bot.api.files.upload({
        file: request.get(gifUrl),
        channels: message.channel,
        filename: query,
        filetype: 'auto',
        mimetype: "image\/gif",
      }, function (err, res) {
        if (err) {
          bot.botkit.log("Failed to add gif :(", err)
          bot.botkit.log(data)
        }
      })
    } else {
      bot.reply(message, `Sorry, couldn't find any gifs matching ${query} `)
    }
  })
}
// Gets current user info
helpers.getCurrentUserInfo = (bot, message) => {
  request.get(`https://slack.com/api/users.info?user=${message.user}&token=${process.env.SLACK_TOKEN}`, function (error, response, body) {
    if (!error) {
      console.log(`retrieved currentUserInfo on behalf of ${message.user}`)
      var formattedBody = body.replace(/,/g, ",\n")
      formattedBody = formattedBody.replace(/{/g, "{\n")
      bot.reply(message, `Here's your info: \n  ${formattedBody} `)
    } else {
      bot.reply(message, "Something went wrong... \n*Error:*" + error)
      console.log(`Error retrieving currentUserInfo on behalf of ${message.user}`)
    }
  })
}
// Gets user info
helpers.getUserInfo = (bot, message) => {
  var userToFind = message.match[1]
  //user @'ed person to find info on.
  if (userToFind.startsWith("<@")) {
    userToFind = userToFind.substring(2, userToFind.length - 1)
    request.get(`https://slack.com/api/users.info?user=${userToFind}&token=${process.env.SLACK_TOKEN}`, function (error, response, body) {
      if (!error) {
        console.log(`retrieved user info for ${userToFind} on behalf of ${message.user}`)
        var formattedBody = body.replace(/,/g, ",\n")
        formattedBody = formattedBody.replace(/{/g, "{\n")
        bot.reply(message, `Here's your info: \n  ${formattedBody} `)
      } else {
        bot.reply(message, "Something went wrong... \n*Error:*" + error)
        console.log(`Error retrieving user info for ${userToFind} on behalf of ${message.user}`)
      }
    })
  } else {
    request.get(`https://slack.com/api/users.list?token=${process.env.SLACK_TOKEN}`, function (error, response, body) {
      if (!error) {
        console.log(`retrieved Users list on behalf of ${message.user}, looking for ${userToFind}.`)
        // It's like "search, yo"
        var userInfo = JSON.stringify(JSON.parse(body).members.filter(function (user) {
          return user.name == userToFind.toLowerCase() ||
            user.real_name == userToFind ||
            user.profile.email == userToFind ||
            user.profile.phone == userToFind ||
            user.profile.phone == userToFind.substring(3, userToFind.length)
        })[0])
        if (userInfo) {
          var formattedBody = userInfo.replace(/,/g, ",\n")
          formattedBody = formattedBody.replace(/{/g, "{\n")
          bot.reply(message, `Here's what i have on *${userToFind}* : \n ${formattedBody} `)
        } else
          bot.reply(message, `Sorry, couldn't find any info on ${userToFind}`)
      } else {
        bot.reply(message, "Something went wrong... \n*Error:*" + error)
        console.log(`Error retrieving UserInfo on ${userToFind} on behalf of ${message.user}`)
      }
    })
  }
}
module.exports = helpers