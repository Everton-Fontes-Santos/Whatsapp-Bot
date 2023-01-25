const express = require('express')
const { bots, setConection} = require('../../botManager')
const botControllerRouter = express.Router()

botControllerRouter.post('/connect', async (req, res)=>{
    const data = req.body
    const client = data?.client
    try{
        if(!client) return res.status(500).json({
            message:"Need a client"
        })

        bots.set(client, await setConection(client))
        return res.status(201).json({
            message:`Created a client ${client}`
        })    
    }catch(err){
        console.log(err)
    }
    
})

botControllerRouter.post("/send", async (req, res)=>{
    const body = req.body
    if(!body.remoteJid || !body.message) return res.status(500).json({
        message:"Falta parametros"
    })
    const client = bots.get("Efs")
    const [result] = await client.onWhatsApp(body.remoteJid)
    
    if (!result.exists) return res.status(200).json({
        message: "Não existe esse usuario no whats"
    })

    await client.sendMessage(result.jid, {
        text: body.message
    })

    return res.status(200).json({
        message:"Enviada"
    })
})

module.exports = botControllerRouter