//======
// COUNT - keep track of numbers and stuff
//======
var puppeteer = require("puppeteer")
var fs = require("fs")
var streamifier = require("streamifier")
var pollen = {};

pollen.get = (bot, message) => {
    bot.reply(message, "Pollenvarsel");
    puppeteer.launch().then(browser => {
        browser.newPage().then(page => {
            page.setViewport({ width: 1000, height: 600, deviceScaleFactor: 2 });
            page.goto('https://www.yr.no/pollen/', { waitUntil: 'networkidle2' }).then(_done => {

                async function takeScreenshot(selector, padding = 10) {
                    const rect = await page.evaluate(selector => {
                        const element = document.querySelector(selector);
                        const { x, y, width, height } = element.getBoundingClientRect();
                        return { left: x, top: y, width, height, id: element.id };
                    }, selector);

                    console.log("got selector, returning screen shot buffer -----------------------------")

                    return await page.screenshot({
                        encoding: "binary",
                        clip: {
                            x: rect.left - padding,
                            y: rect.top - padding,
                            width: rect.width + padding * 2,
                            height: rect.height + padding * 2
                        }
                    });
                }
                takeScreenshot('.yr-table-pollen').then(screenshotBuffer => {
                    browser.close();
                    console.log("got screenshotbuffer, uploading file -----------------------------")
                    // let imageReadStream = streamifier.createReadStream(screenshotBuffer);
                    let imageReadStream = fs.createReadStream(`${process.cwd()}/pollen.png`)
                    bot.api.files.upload({
                        file: imageReadStream,
                        filename: "yr-pollen",
                        filetype: 'auto',
                        mimetype: "image\/png",
                        channels: message.channel,
                    })
                })
            })
        })
    })
}


module.exports = pollen;
