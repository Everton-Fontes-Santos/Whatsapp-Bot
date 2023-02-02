const ClientModel = require('./prisma/models/clients')
const ItemModel = require('./prisma/models/items')
const axios = require('axios')

const clientModel = async()=>{
    const model = new ClientModel()
    const client = {
        name:"Everton Fontes",
        remote_jid:"5512920003537@s.whatsapp.net",
        is_admin:true
    }
    //console.log(await model.createClient(client))   
    console.log(await model.getClientByRemoteJid(client.remote_jid))
    console.log(await model.getAllClients())
    
    client.is_admin = false
    console.log(await model.updateClient(client))
    //console.log(await model.deleteClient(client))
}

const itemModel = async()=>{
    const model = new ItemModel()
    const item = {
        name:"Fio dental",
        description:"Para limpeza das beiradas do dente",
        price:8,
        promotional_price:5,
    }
    console.log(await model.createItem(item))
    const items = await model.getAllItems()
    console.log(items)
    console.log(await model.getItemById(items.at(-1).id))
    items.at(-1).name = "Fio Dental"
    console.log(await model.updateItem(items.at(-1)))
    // console.log(await model.deleteItem(items[0]))
}


const start = async () => {

    const res = await axios.post(
        'https://whatsapp-bot-otrg.onrender.com/message/connect',
        {client:"Efs"}
    )
    return res.data

}

const postMessage = async () =>{
    setTimeout(async ()=>{
        const update = {
            message:"Efs Mensagem de Test",
            remoteJid: "5512920003537"
        }
        const options = {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(update),
        };
        const response = await fetch(
            'https://whatsapp-bot-otrg.onrender.com/message/send',
            options
        )
        console.log(await response.json())
    },5000)
    
}
start()
// postMessage()