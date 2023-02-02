const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser');
const messageRouter = require('./src/api/controllers/BotController')
const { bots, setConection} = require('./src/botManager')


dotenv.config()

const app = express()
const port = process.env.PORT || 3000

//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/message',messageRouter)



app.listen(port, async ()=>{
    bots.set("Efs", await setConection('Efs'))
    console.log(`Listening on http://localhost:${port}`)
})
