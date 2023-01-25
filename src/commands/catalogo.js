const { PREFIX } = require('../config')
const {getBotData} = require('../utils')

const description = `*${PREFIX}catalogo* mostra uma opção de todos os items do catalogo`

const action = async (bot, baileysMessage)=>{
    const { sendItems, itemModel } = await getBotData(bot, baileysMessage)
    const items = await itemModel.getAllItems()
    return sendItems(
        "Catalogo",
        "Aproveite bem este catalogo de teste",
        "Compre com o melhor!",
        'Items',
        items
    )

}

module.exports = {
    description,
    action
}