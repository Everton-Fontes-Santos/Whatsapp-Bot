const { PREFIX } = require('../config')
const {getBotData} = require('../utils')

const description = `*${PREFIX}sendto* envia uma mensagem ou comando para uma pessoa`

const action = async (bot, baileysMessage)=>{
    const { args, sendTextMessage, checkIfPersonExists } = await getBotData(bot, baileysMessage)
    const [userJid, command, ...rest] = args.trim().split(" ")
    
    let message = ''
    if(command.startsWith(PREFIX)){
        message = rest.filter(arg=>{
            return arg !== userJid && arg !== command
        }).reduce((acc, arg)=> acc + " " + arg,'').trim()

        await sendTextMessage(message, userJid)
        return sendTextMessage("Enviado...")
    }
    message = rest.filter(arg=>{
        return arg !== userJid
    }).reduce((acc, arg)=> acc + " " + arg,'').trim()
    await sendTextMessage(
        `${command} ${message}`,
        userJid
    )
    return sendTextMessage("Enviado...")
}

module.exports = {
    description,
    action
}