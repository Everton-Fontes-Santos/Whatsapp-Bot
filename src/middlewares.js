const { isCommand, getBotData } = require("./utils");
const {getCommand} = require("./commands")


async function middlewares(bot){
    bot.ev.on("messages.upsert", async ({messages})=>{
        const baileysMessage = messages[0]
        
        if(!baileysMessage?.message || !isCommand(baileysMessage)) return;       

        const { command, remoteJid, saveClient, userName} = await getBotData(bot, baileysMessage)

        try{
            const {action} = getCommand(command)
            if(action) await action(bot, baileysMessage)
        }catch(error){
            console.log(error)
            await bot.sendMessage(remoteJid, {
                text: error.message
            })
        }
        // switch (command.toLowerCase()){
        //     case 'ping':
        //         await actions.sendTextMessage()
        //         break;
        //     case "sticker":
        //         await actions.sticker()
        //         break;
        //     case 'toimage':
        //         await actions.toImage()
        //         break
        // }
        
    })
    
}

module.exports = middlewares