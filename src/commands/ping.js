const { BOT_EMOJI } = require("../config")
const {extractDataFromMessage} = require('../utils')

const description = '*/ping* Envia um Pong!'

const action = async (bot, baileysMessage)=>{
    const { remoteJid } = extractDataFromMessage(baileysMessage)
    return bot.sendMessage(remoteJid, {
        text: `${BOT_EMOJI} PONG!`
    })
}

module.exports = {
    description,
    action
}