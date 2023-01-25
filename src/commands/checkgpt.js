const { PREFIX } = require('../config')
const {getBotData} = require('../utils')
const checkGPT = require('../../openAi/checkGPT')

const description = `*${PREFIX}checkgpt* Verifica se a api do gpt esta funcionando`

const action = async (bot, baileysMessage)=>{
    const {sendTextMessage} = await getBotData(bot, baileysMessage)
    const check = await checkGPT()
    if(!check || check === "connect ECONNREFUSED ::1:3000") return sendTextMessage("Algo de errado não está certo....")
    return sendTextMessage(check)
}

module.exports = {
    description,
    action
}