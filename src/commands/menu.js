const {getBotData} = require('../utils')
const { getAllCommands } = require('../commands')
const { BOT_NAME } = require('../config')

const description = ''

const action = async (bot, baileysMessage)=>{
    const {sendTextMessage, userName} = await getBotData(bot, baileysMessage)
    const commands = getAllCommands()
    let msg = `*${userName}* Bem Vindo ao ${BOT_NAME} !!\n
Abaixo terá toda a lista de commandos disponíveis no momento.\n\n`
    for(const {description} of commands){
        msg += `${description} \n\n`
    }
    await sendTextMessage(msg)
}

module.exports = {
    description,
    action
}