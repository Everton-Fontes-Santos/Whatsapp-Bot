const {getBotData} = require('../utils')
const { buttonMessageType1 } = require('../utils/buttons')
const description = '*/vcard* Mostra o cartão de contato'

const action = async (bot, baileysMessage)=>{
    const {sendButtonMessage} = await getBotData(bot, baileysMessage)
    const button = buttonMessageType1(
        "Olá eu sou o Everton Fontes",
        'Thanks',
        ['Hey', 'HOO']
    )
    console.log(button)
    await sendButtonMessage(button)

}

module.exports = {
    description,
    action
}