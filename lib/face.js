var face = {};
var fetch = require('node-fetch');

// Request parameters.
const params = {
    'returnFaceId': 'true',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes': 'age,gender,smile,facialHair,glasses,emotion,hair,makeup,accessories'
};
const apiHeaders = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': process.env.AZURE_FACE_KEY,
}

face.analyze = (bot, message) => {
    var imgUrl = message.match[1];
    imgUrl = imgUrl.substring(1, imgUrl.length - 1); // remove '<' and '>' which is added to urls in slack
    face.queryFaceApi(imgUrl).then(jsonData => {
        if (jsonData.error) bot.reply(message, "*Error:*" + jsonData.error.code + "\n" + jsonData.error.message);
        else bot.reply(message, face.composeReply(jsonData))
    })
}

face.queryFaceApi = (imgUrl) => {
    var query = Object.keys(params).map(k => k + '=' + params[k]).join('&');
    console.log(`Querying the Face API...`)
    console.log(`ImageUrl: ${imgUrl}`)
    var faceUrl = `${process.env.AZURE_FACE_API_ENDPOINT}?${query}`
    return fetch(faceUrl, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
            url: imgUrl
        }),
    }).then(r => r.json().then(data => data))
}

face.composeReply = (faces) => {
    class Person {
        constructor(age, gender, smile, facialHair, glasses, emotion, hair, makeup, accessories) {
            this.Age = age
            this.Gender = gender
            this.Smile = smile
            this.FacialHair = facialHair
            this.Glasses = glasses
            this.Emotion = emotion
            this.Hair = hair
            this.Makeup = makeup
            this.Accessories = accessories
        }
    }
    var people = [];
    faces.forEach(face => {
        var person = new Person()
        if (face.faceAttributes) {
            Object.keys(face.faceAttributes).forEach(faceAttr => {
                person[faceAttr] = face.faceAttributes[faceAttr]
            })
        }
        people.push(person)
    })

    if (people.length) {
        var reply = "*Facial analysis results:*\n";

        people.forEach(person => {
            console.log(person);
            [...Object.keys(person)].forEach(key => {
                var attr = person[key];
                if (attr) {
                    if (typeof (attr) !== "object") {
                        if (parseFloat(attr, 10) < 1) {
                            attr = (Math.round(attr * 100)) + "%";
                        }
                        reply += "*" + key + "*: " + attr + "\n";
                    } else {
                        [...Object.keys(attr)].forEach(childKey => {
                            var childAttr = attr[childKey];
                            if (childAttr) {
                                if (parseFloat(childAttr, 10) < 1) {
                                    childAttr = (Math.round(childAttr * 100)) + "%";
                                }
                                if (typeof (childAttr) !== "object") {
                                    reply += "*" + childKey + "*: " + childAttr + "\n";
                                }
                            }
                        })
                    }
                }
            });
            reply += "\n\n"
        })
        return reply;
    }
    else return "*No faces detected*"
}

module.exports = face;