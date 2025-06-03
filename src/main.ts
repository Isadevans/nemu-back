import {PrismaClient} from '../generated/prisma'
import cors from 'cors';
import express from "express";
import {logger} from "./config/logger";
import {registerJourneyRoutes} from "./routes/journey.routes";

const prisma = new PrismaClient()
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

function main() {
    registerJourneyRoutes(app,prisma)
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    })
    logger.info("Exiting server")
}

main()
