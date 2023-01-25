const path = require("path");
const fs = require('fs')
const { readJSON, writeJSON } = require('../utils');
const { PREFIX } = require("../config");

const getAllCommands = ()=>{
    const pathCache = path.resolve(__dirname, '..','..','cache', 'commands.json')
    const cacheCommands = readJSON(pathCache)
    const commands = []
    for( const command of cacheCommands){
        commands.push(getCommand(command))
    }
    return commands
}


const getCommand = (commandName)=>{
    if(!commandName) return
    const pathCache = path.resolve(__dirname, '..','..','cache', 'commands.json')
    const pathCommands = path.resolve(__dirname)

    const cacheCommands = readJSON(pathCache)
    const cacheCommand = cacheCommands.find(name=> name === commandName)
    if(!cacheCommand){
        const command = fs.readdirSync(pathCommands)
            .find(file=>file.includes(commandName))
        
        if(!command){
            throw new Error(
                `Comando *${commandName}* não encontrado! Digite ${PREFIX}menu para ver todos os comandos`
            )
        }
        
        writeJSON(pathCache, [...cacheCommands, commandName])
        
        const { action, description } = require(`./${command}`)
        return {
            action,
            description
        }
    }

    const { action, description } = require(`./${cacheCommand}`)
    return {
        description,
        action
    }
}

module.exports = {
    getAllCommands,
    getCommand
}

