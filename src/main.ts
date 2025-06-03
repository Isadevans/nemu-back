import { PrismaClient } from '../generated/prisma'
import {registerRouters} from "./routes/router";
const prisma = new PrismaClient()

async function main(){
    await registerRouters()

}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })