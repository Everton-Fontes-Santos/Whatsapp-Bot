const { PrismaClient } = require('@prisma/client')


class ItemModel {
    constructor(){
        this.prisma = new PrismaClient()
    }

    async getItemById(id) {
        return await this.prisma.item.findUnique({
            where:{
                id
            }
        })
    }
    async getAllItems(){
        return await this.prisma.item.findMany()
    }
    async createItem(item){
        return this.prisma.item.create({
            data:item
        })
    }

    async updateItem(item){
        const updated = await this.prisma.item.update({
            where:{ id:item.id },
            data:item
        })
        if(updated) return {...updated}
        throw new Error("Cannot update the Item")
    }
    async deleteItem(item){
        const updated = await this.prisma.item.delete({
            where: {id:item.id}
        })
        if(updated) return true
        return false
    }
}

module.exports = ItemModel