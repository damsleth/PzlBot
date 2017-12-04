//======
// WIT COMMANDS
//======

var wit = {};


wit.analyze = function (response, bot, message) {
    var entities = [];
    for (entity in response.entities) {
        if (response.entities.hasOwnProperty(entity)) {
            Object.assign(response.entities[entity][0], {
                "name": entity
            });
            entities.push(response.entities[entity][0]);
        }
    };
    var firstEntity = entities.sort((a, b) => a.confidence < b.confidence)[0];
    wit[firstEntity.name](firstEntity, bot, message);
}

wit.greetings = (entity, bot, message) => bot.reply(message, "Hey yourself!")
wit.positive = (entity, bot, message) => bot.reply(message, `That's positive! _(with ${entity.confidence * 10000 / 100}% confidence)_`)
wit.negative = (entity, bot, message) => bot.reply(message, `That's negative! _(with ${entity.confidence * 10000 / 100}% confidence)_`)
wit.curse = (entity, bot, message) => bot.reply(message, `That's a curse word! _(with ${entity.confidence * 10000 / 100}% confidence)_`)

module.exports = wit;