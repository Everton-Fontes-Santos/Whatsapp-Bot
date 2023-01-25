const {getBotData} = require('../utils')
const askGPT = require('../../openAi/ask')
const description = '*/say* Pergunta algo para a inteligencia GPT'

const action = async (bot, baileysMessage)=>{
    const {isReply, sendTextMessage, reply, args} = await getBotData(bot, baileysMessage)
    
    const message = await askGPT(args)
    if(!message) {
        return sendTextMessage("Algo de errado não está certo....")
    }
    if(!isReply){
        return sendTextMessage(message)
    }
    return reply(message)
}

module.exports = {
    action,
    description
}