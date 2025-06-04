import {Request, Response} from 'express';
import {logger} from "../config/logger";
import {JourneyService} from "../services/journey.service";

export interface ProcessedTouchpoint {
    id: number;
    channel: string;
    campaign: string;
    content: string;
    timestamp: string;
}
export class JourneyController {
    constructor(private journeyService: JourneyService) {
    }

    public async getJourneys(req: Request, res: Response): Promise<Response> {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
                return res.status(400).json({ error: "Invalid request parameters" });
            }
            const validatedPage = Math.max(1, page);
            const validatedLimit = Math.max(1, limit);

            const journeys = await this.journeyService.getJourneys({
                page: validatedPage,
                limit: validatedLimit
            });

            const totalItems = await this.journeyService.getTotalSessionCount();
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
            });
        } catch (error) {
            logger.error(`Error in JourneyController: ${error instanceof Error ? error.message : String(error)}`);
            return res.status(500).send('Internal Server Error');
        }
    }}
