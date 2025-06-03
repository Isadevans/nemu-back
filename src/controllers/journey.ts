import {Request, Response} from 'express';
import * as journeyService from "../services/journey.service";
import {logger} from "../config/logger";


export async function journeyController(req: Request, res: Response) {
    try {
        const journeys = await journeyService.getJourneysGroupedBySessionId()
        return res.status(200).json(journeys);
    } catch (error) {
        logger.error(`Error in journeyController: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).send('Failed to retrieve journeys');
    }
}
