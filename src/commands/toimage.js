const { TEMP_FOLDER } = require('../config')
const { getBotData, downloadSticker } = require('../utils')
const path = require('path')
const { exec } = require('child_process')
const fs = require('fs')


const description = '*/toimage* Converte um sticker em uma imagem'

const action = async (bot, baileysMessage)=>{
    const { isSticker, sendTextMessage, sendImage, args, remoteJid, isReply} = await getBotData(bot, baileysMessage)

    if(!isSticker){
        await sendTextMessage('ERRO! Você precisa enviar uma figurinha')
        return
    }
    const inputPath = await downloadSticker(baileysMessage, `input${remoteJid}`)
    const outputPath = path.resolve(TEMP_FOLDER, `output${remoteJid}.png`)

    exec(`ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`, async (error)=>{
        if(error){
            await sendTextMessage('erro ao converter a figurinha')
            return
        }
         await sendImage(inputPath, args, isReply)
         fs.unlinkSync(inputPath)
         fs.unlinkSync(outputPath)
    })
}

module.exports = {
    description,
    action
}