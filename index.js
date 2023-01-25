const connect= require("./src/connection.js")
const middlewares = require("./src/middlewares.js")

async function start(){
    const bot = await connect("Efs")
    await middlewares(bot)
}

start()