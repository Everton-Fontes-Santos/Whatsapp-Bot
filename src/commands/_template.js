const { PREFIX } = require('../config')
const {getBotData} = require('../utils')

const description = `*${PREFIX}*`

const action = async (bot, baileysMessage)=>{
    const {} = await getBotData(bot, baileysMessage)
}

module.exports = {
    description,
    action
}