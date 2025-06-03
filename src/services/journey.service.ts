import {logger} from "../config/logger";
import { IJourneyDataAccess } from "../repositories/journey.repository";
import {SessionHistories} from "../../generated/prisma";

interface PaginationParams {
    page?: number;
    limit?: number;
}

export class JourneyService {
    constructor(private journeyRepository: IJourneyDataAccess) {}

    async countSessionHistoriesBySessionId(): Promise<number> {
        try {
            return await this.journeyRepository.countSessionHistoriesBySessionId();
        } catch (error) {
            logger.error("Error counting session histories:", error);
            throw new Error("Could not count session histories");
        }
    }
    async getJourneysGroupedBySessionId(
        paginationParams: PaginationParams
    ): Promise<SessionHistories[]> {
        try {
            return await this.journeyRepository.groupSessionHistoriesBySessionId(paginationParams);
        } catch (error) {
            logger.error("Error fetching journeys:", error);
            throw new Error("Could not retrieve journeys");
        }
    }
}
