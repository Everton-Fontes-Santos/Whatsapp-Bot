const { PREFIX, TEMP_FOLDER } = require("../config")
const { downloadContentFromMessage} = require("@adiwajshing/baileys")
const path = require("path")
const { writeFile } = require('fs/promises')
const fs = require('fs')
const { BOT_EMOJI, ADMIN_JID } = require('../config')
const ClientModel = require('../../prisma/models/clients')
const ItemModel = require("../../prisma/models/items")


const extractDataFromMessage = (baileysMessage)=>{
    const textMessage = baileysMessage.message?.conversation
    const buttonTextMessage = baileysMessage.message?.buttonsResponseMessage
    const listTextMessage = baileysMessage.message?.listResponseMessage
    const extendedTextMessage = baileysMessage.message?.extendedTextMessage?.text
    const imageTextMessage = baileysMessage.message?.imageMessage?.caption
    const videoTextMessage = baileysMessage.message?.videoMessage?.caption

    const fullMessage = textMessage 
        || extendedTextMessage || imageTextMessage 
        || videoTextMessage || buttonTextMessage?.selectedButtonId
        || listTextMessage?.singleSelectReply?.selectedRowId

    if(!fullMessage){
        return {
            remoteJid:'',
            fullMessage:"",
            command:"",
            args:"",
            userName: "",
            timestamp:undefined,
            fromMe:false,
            isImage:false,
            isSticker:false,
            isVideo:false,
            isAudio:false,
        }
    }

    const fromMe = baileysMessage.key?.fromMe

    const timestamp = baileysMessage.messageTimestamp

    const userName = baileysMessage.pushName

    const isImage = ( 
        !!baileysMessage.message?.imageMessage 
        || !!baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage 
    )
    
    const isSticker = ( 
        !!baileysMessage.message?.stickerMessage 
        || !!baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage
    )
    
    const isVideo = (
        !!baileysMessage.message?.videoMessage
        || !!baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage
    )
    const isAudio = (
        !!baileysMessage.message?.audioMessage
        || !!baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage
    )

    const isDocument = (
        !!baileysMessage.message?.documentMessage
        || !!baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage
    )
    const isReply = (
        !!baileysMessage.message?.extendedTextMessage && 
        !!baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage
    )

    const replyJid = 
        baileysMessage.message?.extendedTextMessage &&
        baileysMessage.message?.extendedTextMessage.contextInfo?.participant
        ? baileysMessage.message?.extendedTextMessage.contextInfo?.participant
        : null

    const [command, ...args] = fullMessage.trim().split(" ")

    const arg = args.reduce((acc, arg)=> acc + " " + arg,'').trim()

    return{
        remoteJid:baileysMessage.key?.remoteJid,
        fromMe,
        timestamp,
        userName,
        isReply,
        replyJid,
        fullMessage,
        command:command.replace(PREFIX,'').trim().toLowerCase(),
        args:arg.trim(),
        isImage,
        isSticker,
        isVideo,
        isAudio,
        isDocument
    }
}

const getBotData = async (bot, baileysMessage) =>{
    const {
        remoteJid,
        args,
        command,
        fullMessage,
        isAudio,
        isImage,
        isSticker,
        isVideo,
        isReply,
        replyJid,
        fromMe,
        timestamp,
        userName,
        isDocument
    } = extractDataFromMessage(baileysMessage)

    const clientModel = new ClientModel()
    const itemModel = new ItemModel()

    async function saveClient({userName, id, admin=false}, notify=false){
        const jid = await checkIfPersonExists(ADMIN_JID)
        try{
            const client = await clientModel.createClient({
                name:userName,
                remote_jid:id,
                is_admin:admin
            })
            if(!client && notify) return sendTextMessage("Não consegui salver o client", jid)
            if(notify) return sendTextMessage("Não consegui salver o client", remoteJid)
        }catch(err){
            console.log(err)
            if(notify){
                return sendTextMessage("Não consegui salver o client", jid)
            }
            return
        }
    }

    async function sendItems(title ,text, footer, buttonText, items){
        // send a list message!
        const sections = [
            {
                title: "Items",
                rows: []
            },
        ]
        for (const item of items){
            sections[0].rows.push(
                {title: item.name, rowId: item.id, description: `${item.description}\n De:${item.price} Por: ${item.promotional_price}`}
            )
        }

        const listMessage = {
            text,
            footer,
            title,
            buttonText,
            sections
        }
        return bot.sendMessage(remoteJid, listMessage)
    }
    

    async function sendButtonMessage(buttons){
        return bot.sendMessage(remoteJid, buttons)
    }

    async function checkIfPersonExists(jid){
        const [result] = await bot.onWhatsApp(jid)
        if (result.exists) return result.jid
        return 
    }

    async function sendTextMessage(text, jid='', group=''){
        if(!jid && !group) return bot.sendMessage(remoteJid, {
            text: `${BOT_EMOJI} ${text}`
        })
        let user
        if(group){
            user = await checkIfPersonExists(group)
            if (!user) return bot.sendMessage(remoteJid, {
                text: `${BOT_EMOJI} Esse grupo não existe`
            })
            return bot.sendMessage(`${user}`, {// group@g.us
                text: `${BOT_EMOJI} ${text}`
            })
        }
        user = await checkIfPersonExists(jid)
        if(!user) return bot.sendMessage(remoteJid, {
            text: `${BOT_EMOJI} Esse usuário não existe`
        })
        return bot.sendMessage(`${user}`, { // jid@s.whatsapp.net
            text: `${BOT_EMOJI} ${text}`
        })
        
    }
    async function sendImage(pathOrBuffer, caption='', isReply=true){
        let options = {}
        if(isReply){
            options = {
                quoted:baileysMessage
            }
        }

        const image = pathOrBuffer instanceof Buffer 
            ? pathOrBuffer 
            : fs.readFileSync(pathOrBuffer)
        
        const params = caption? {
            image,
            caption: `${BOT_EMOJI} ${caption}`
        }
        : { image }

        return bot.sendMessage(remoteJid, params, options)
    }

    async function sendSticker(pathOrBuffer, isReply=true){
        let options = {}
        if(isReply){
            options = {
                quoted:baileysMessage
            }
        }

        const sticker = pathOrBuffer instanceof Buffer 
            ? pathOrBuffer 
            : fs.readFileSync(pathOrBuffer)

        return bot.sendMessage(remoteJid, {sticker}, options)
    }

    async function sendAudio(pathOrBuffer, ptt=true, isReply=true){
        let options = {}
        if(isReply){
            options = {
                quoted:baileysMessage
            }
        }

        const audio = pathOrBuffer instanceof Buffer 
            ? pathOrBuffer 
            : fs.readFileSync(pathOrBuffer)
        
        if( pathOrBuffer instanceof Buffer){
            return bot.sendMessage(
                remoteJid,
                {
                    audio,
                    ptt,
                    mimeType: 'audio/mpeg'
                },
                options
            )
        }

        options = { ...options, url:pathOrBuffer}

        return bot.sendMessage(
            remoteJid,
            {
                audio: { url: pathOrBuffer },
                ptt,
                mimeType: 'audio/mpeg'
            },
            options
        )
    }

    async function reply(text){
        return bot.sendMessage(
            remoteJid,
            {
                text: `${BOT_EMOJI} ${text}`
            },
            { quoted: baileysMessage.message }
        )
    }

    return {
        sendTextMessage,
        sendButtonMessage,
        sendImage,
        sendSticker,
        sendAudio,
        checkIfPersonExists,
        reply,
        remoteJid,
        args,
        command,
        fullMessage,
        isAudio,
        isImage,
        isSticker,
        isVideo,
        isReply,
        replyJid,
        bot,
        fromMe,
        timestamp,
        userName,
        isDocument,
        saveClient,
        clientModel,
        sendItems,
        itemModel
    }
}

function is(baileysMessage, context) {
    return (
      !!baileysMessage.message?.[`${context}Message`] 
      || !!baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
        `${context}Message`
      ]
    );
  }

const isCommand = (baileysMessage) =>{
    const { fullMessage } = extractDataFromMessage(baileysMessage)

    return fullMessage && fullMessage.startsWith(PREFIX)
}

const readJSON = (pathFile)=>{
    try{
        return JSON.parse(fs.readFileSync(pathFile))
    }catch(error){
        return undefined
    }
}

const writeJSON = (pathFile, data)=>{
    fs.writeFileSync(pathFile, JSON.stringify(data))
}

const getContent = (baileysMessage, context) =>{
    return baileysMessage.message?.[`${context}Message`] ||
        baileysMessage.message?.extendedTextMessage.contextInfo?.quotedMessage?.[`${context}Message`]
}

const downloadMedia = async (baileysMessage, fileName, context, format) =>{
    const content = getContent(baileysMessage, context)

    if(!content) return null

    const stream = await downloadContentFromMessage(content, context)
    let buffer= Buffer.from([])

    for await (const chunk of stream){
        buffer = Buffer.concat([buffer, chunk])
    }

    const filePath = path.resolve(TEMP_FOLDER, `${fileName}.${format}`)
    await writeFile(filePath, buffer)
    return filePath
}

const downloadImage = async (baileysMessage, fileName) =>{
    return await downloadMedia(baileysMessage, fileName, 'image', 'png')
}

const downloadVideo = async (baileysMessage, fileName) =>{
    return await downloadMedia(baileysMessage, fileName, 'video', 'mp4')
}

const downloadSticker = async (baileysMessage, fileName) =>{
    return await downloadMedia(baileysMessage, fileName, 'sticker', 'webp')
}

module.exports = {
    extractDataFromMessage,
    isCommand,
    downloadImage,
    downloadVideo,
    downloadSticker,
    readJSON,
    writeJSON,
    getBotData
}