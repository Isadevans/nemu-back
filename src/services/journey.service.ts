import {logger} from "../config/logger";
import { IJourneyDataAccess } from "../repositories/journey.repository";
import {SessionHistories} from "../../generated/prisma";

// Define PaginationParams if not already defined elsewhere
interface PaginationParams {
    page?: number;
    limit?: number;
}

export class JourneyService {
    constructor(private journeyRepository: IJourneyDataAccess) {}

    async getJourneysGroupedBySessionId(
        paginationParams: PaginationParams // These params are not used by current repository method
    ): Promise<SessionHistories[]> {
        try {
            return await this.journeyRepository.groupSessionHistoriesBySessionId(paginationParams);
        } catch (error) {
            logger.error("Error fetching journeys:", error);
            throw new Error("Could not retrieve journeys");
        }
    }
}
