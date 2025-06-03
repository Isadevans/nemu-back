import {Express} from 'express'
import {PrismaClient} from "../../generated/prisma";
import {JourneyController} from "../controllers/journey.controller";
import {JourneyService} from "../services/journey.service";
import {PrismaJourneyDataAccess} from "../repositories/journey.repository";


export async function registerRouters(app: Express, prisma: PrismaClient) {
    app.get('/journeys', async (req, res) => {
        const prismaJourneyDataAccess = new PrismaJourneyDataAccess(prisma)
        const journeyService = new JourneyService(prismaJourneyDataAccess)
        const journeyController = new JourneyController(journeyService)
        await journeyController.getJourneys(req, res)
    })

}
