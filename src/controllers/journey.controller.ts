import {Request, Response} from 'express';
import {logger} from "../config/logger";
import {JourneyService} from "../services/journey.service";

export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    // Bind 'this' context or use an arrow function for the method
    public async getJourneys (req: Request, res: Response): Promise<Response>  {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

            const journeys = await this.journeyService.getJourneysGroupedBySessionId(
                { page, limit }
            );
            return res.status(200).json(journeys);
        } catch (error) {
            logger.error(`Error in JourneyController: ${error instanceof Error ? error.message : String(error)}`);
            return res.status(500).send('Failed to retrieve journeys');
        }
    }
}
