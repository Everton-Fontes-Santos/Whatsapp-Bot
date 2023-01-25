const { PrismaClient } = require('@prisma/client')


class ClientModel {
    constructor(){
        this.prisma = new PrismaClient()
    }

    async getClientByRemoteJid(jid) {
        return await this.prisma.clients.findFirst({
            where:{
                remote_jid:jid
            },
            include:{
                orders: true
            }
        })
    }
    async getAllClients(){
        return await this.prisma.clients.findMany({
            include:{
                orders: true
            }
        })
    }
    async createClient({remote_jid, name, is_admin=false}){
        const client = await this.getClientByRemoteJid(remote_jid)
        if(client) throw new Error('This client already exists')
        return this.prisma.clients.create({
            data:{
                name,
                remote_jid:remote_jid,
                is_admin:is_admin
            }
        })
    }

    async updateClient(client){
        const {count} = await this.prisma.clients.updateMany({
            where:{ remote_jid:client.remote_jid },
            data:client
        })
        if(count) return {...client}
        throw new Error("Cannot update the client")
    }
    async deleteClient(client){
        const {count} = await this.prisma.clients.deleteMany({
            where:{ remote_jid:client.remote_jid }
        })
        if(count) return true
        return false
    }
}

module.exports = ClientModel