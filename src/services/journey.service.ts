import {logger} from "../config/logger";
import {IJourneyDataAccess} from "../repositories/journey.repository";
import {ProcessedTouchpoint} from "../controllers/journey.controller";

interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface Journey {
    sessionId: string;
    touchpoints: ProcessedTouchpoint[];
}

export class JourneyService {
    constructor(private journeyRepository: IJourneyDataAccess) {
    }
    async getJourneys(paginationParams: PaginationParams): Promise<Journey[]> {
        try {
            const sessions = await this.journeyRepository.getPaginatedUniqueSessionIds(paginationParams);

            const journeys = await Promise.all(
                sessions.map(async (session) => {
                    const touchpoints = await this.journeyRepository.getSessionTouchpoints(session.sessionId);
                    return {
                        sessionId: session.sessionId,
                        touchpoints
                    };
                })
            );

            return journeys;
        } catch (error) {
            logger.error("Error fetching journeys:", error);
            throw new Error("Could not retrieve journeys");
        }
    }

    async getTotalSessionCount(): Promise<number> {
        try {
            return await this.journeyRepository.getTotalSessionCount();
        } catch (error) {
            logger.error("Error counting sessions:", error);
            throw new Error("Could not count total sessions");
        }
    }
}
