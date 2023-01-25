const path = require("path");
const { BOT_EMOJI, TEMP_FOLDER, CACHE_FOLDER } = require("../config");
const { extractDataFromMessage, downloadImage, downloadSticker, downloadVideo, readJSON, writeJSON } = require("../utils");
const { exec } = require('child_process')
const fs = require('fs')
const { readFile, writeFile} = require('fs/promises')


class Actions {

    constructor(bot, baileysMessage){
        const { remoteJid, args, isImage, isSticker, isVideo, userName } = extractDataFromMessage(baileysMessage)
        
        this.bot = bot;
        this.baileysMessage = baileysMessage;
        this.remoteJid = remoteJid;
        this.args = args;
        this.isImage = isImage
        this.isSticker = isSticker
        this.isVideo = isVideo
        this.userName = userName
    }

    async sendTextMessage(text){
        await this.bot.sendMessage(this.remoteJid, {
            text: `${BOT_EMOJI} ${text}`
        })
    }

    async sticker(){
        if(!this.isImage && !this.isVideo){
            await this.sendTextMessage('ERRO! Você precisa enviar uma imagem ou video de até 10 segundos')
            return
            
        }

        const outputPath = path.resolve(TEMP_FOLDER, `output${this.remoteJid}.webp`)
        let params = '-vf scale=512:512'
        let inputPath

        if(this.isImage){
            inputPath = await downloadImage(this.baileysMessage, `input${this.remoteJid}`)
        }else{
            params = '-y -vcodec libwebp -fs 0.99M -filter_complex "[0:v] scale=512:512,fps=12,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"'
            inputPath = await downloadVideo(this.baileysMessage, `input${this.remoteJid}`)

            const sizeInSeconds = 10
            const seconds = this.baileysMessage.message?.videoMessage?.seconds ||
                this.baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.seconds

            const shouldSecondsRule = sizeInSeconds <= seconds

            if(!shouldSecondsRule){
                fs.unlinkSync(inputPath)
                await this.sendTextMessage("Erro o video tem mais que 10 segundos, envie um video menor")
                return
            }

        }
        
        
        exec(`ffmpeg -i ${inputPath} ${params} ${outputPath}`, async (error)=>{
            if(error){
                await this.sendTextMessage('erro ao converter a figurinha')
                return
            }
             await this.bot.sendMessage(this.remoteJid, {
                sticker: { url: outputPath }
             })
             fs.unlinkSync(inputPath)
             fs.unlinkSync(outputPath)
        })
    }

    async saveClient(){
        const clientPath = path.resolve(CACHE_FOLDER, 'clients.json')
        const clientFile = readJSON(clientPath)
        if(!this.remoteJid) return
        if(!clientFile){
            writeJSON(clientPath, [{
                userName:this.userName,
                id:this.remoteJid
            }])
            return readJSON(clientPath)
        }
        const clientQuery = clientFile.find(clt=>clt===this.remoteJid)
        if(clientQuery) return clientFile
        clientFile.push({
            userName:this.userName,
            id:this.remoteJid
        })
        writeJSON(clientPath,clientFile)
        return readJSON(clientPath)
    }

    async toImage(){
        if(!this.isSticker){
            await this.sendTextMessage('ERRO! Você precisa enviar uma figurinha')
            return
        }
        const inputPath = await downloadSticker(this.baileysMessage, `input${this.remoteJid}`)
        const outputPath = path.resolve(TEMP_FOLDER, `output${this.remoteJid}.png`)

        exec(`ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`, async (error)=>{
            if(error){
                await this.sendTextMessage('erro ao converter a figurinha')
                return
            }
             await this.bot.sendMessage(this.remoteJid, {
                image: { url: outputPath }
             })
             fs.unlinkSync(inputPath)
             fs.unlinkSync(outputPath)
        })
    }
}

module.exports = Actions