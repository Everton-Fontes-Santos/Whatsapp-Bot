
const { TEMP_FOLDER } = require('../config')
const {getBotData, downloadImage, downloadVideo} = require('../utils')
const path = require('path')
const { exec } = require('child_process')
const fs = require('fs')

const description = '*/sticker* Você pode enviar um video de até 10 segundos ou uma imagem que converterá para um sticker'

const action = async (bot, baileysMessage)=>{
    const { remoteJid, sendTextMessage, sendSticker, isImage, isVideo, isReply } = await getBotData(bot, baileysMessage)
    if(!isImage && !isVideo){
        await sendTextMessage('ERRO! Você precisa enviar uma imagem ou video de até 10 segundos')
        return
    }

    const outputPath = path.resolve(TEMP_FOLDER, `output${remoteJid}.webp`)
    let params = '-vf scale=512:512'
    let inputPath

    if(isImage){
        inputPath = await downloadImage(baileysMessage, `input${remoteJid}`)
    }else{
        params = '-y -vcodec libwebp -fs 0.99M -filter_complex "[0:v] scale=512:512,fps=12,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"'
        inputPath = await downloadVideo(baileysMessage, `input${remoteJid}`)

        const sizeInSeconds = 10
        const seconds = baileysMessage.message?.videoMessage?.seconds ||
            baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.seconds
        const shouldSecondsRule = sizeInSeconds >= seconds

        if(!shouldSecondsRule){
            fs.unlinkSync(inputPath)
            await sendTextMessage("Erro o video tem mais que 10 segundos, envie um video menor")
            return
        }

    }
    
    
    exec(`ffmpeg -i ${inputPath} ${params} ${outputPath}`, async (error)=>{
        if(error){
            await sendTextMessage('erro ao converter a figurinha')
            return
        }
         await sendSticker(outputPath, isReply)
         fs.unlinkSync(inputPath)
         fs.unlinkSync(outputPath)
    })
}

module.exports = {
    description,
    action
}