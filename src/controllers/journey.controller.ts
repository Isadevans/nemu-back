import {Request, Response} from 'express';
import {logger} from "../config/logger";
import {JourneyService} from "../services/journey.service";
import {SessionHistories} from "../../generated/prisma";
import {PaginatedResponse} from "../models/response";

export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    public async getJourneys (req: Request, res: Response): Promise<Response>  {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

            const validatedPage = Math.max(1, page);
            const validatedLimit = Math.max(1, limit);

            const journeys = await this.journeyService.getJourneysGroupedBySessionId( { page: validatedPage, limit: validatedLimit } );
            const journeysCount = await this.journeyService.countSessionHistoriesBySessionId();

            const totalItems = Number(journeysCount || 0);
            const totalPages = Math.ceil(totalItems / validatedLimit);

            return res.status(200).json({
                data: journeys,
                meta: {
                    currentPage: validatedPage,
                    pageSize: validatedLimit,
                    totalItems,
                    totalPages: totalPages,
                    hasNextPage: validatedPage < totalPages,
                    hasPrevPage: validatedPage > 1
                }
            } as PaginatedResponse<SessionHistories>); // Type assertion
        } catch (error) {
            logger.error(`Error in JourneyController: ${error instanceof Error ? error.message : String(error)}`);
            return res.status(500).send('Failed to retrieve journeys');
        }
    }
}
