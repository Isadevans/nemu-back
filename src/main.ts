import {PrismaClient} from '../generated/prisma'
import {registerRouters} from "./routes/router";
import cors from 'cors';
import express from "express";
import {logger} from "./config/logger";

const prisma = new PrismaClient()
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

async function main() {
    await registerRouters(app,prisma)
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        logger.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
