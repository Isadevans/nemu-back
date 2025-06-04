import {PrismaClient} from '../generated/prisma'
import cors from 'cors';
import express from "express";
import {logger} from "./config/logger";
import {registerJourneyRoutes} from "./routes/journey.routes";

const prisma = new PrismaClient()
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.use(cors());
app.use(express.json());

function main() {
    registerJourneyRoutes(app, prisma)
    app.listen(Number(PORT), HOST, () => {
        logger.info(`Server is running on http://${HOST}:${PORT}`);
    })
}

main()
