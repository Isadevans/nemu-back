import {PrismaClient, SessionHistories} from "../../generated/prisma";

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface IJourneyDataAccess {
    groupSessionHistoriesBySessionId(paginationParams: PaginationParams): Promise<SessionHistories[]>;
}

export class PrismaJourneyDataAccess implements IJourneyDataAccess {
    constructor(private prisma: PrismaClient) {}

    async groupSessionHistoriesBySessionId(paginationParams: PaginationParams): Promise<SessionHistories[]> {
        const { page, limit } = paginationParams;

        const take = (limit && Number.isInteger(limit) && limit > 0) ? limit : undefined;
        const skip = (page && Number.isInteger(page) && page > 0 && take !== undefined) ? (page - 1) * take : undefined;

        return this.prisma.sessionHistories.findMany({
            skip: skip,
            take: take,
            orderBy: [
                { sessionId: 'asc' }, // Group by sessionId
                { createdAt: 'asc' }  // Then order by creation time within each session
            ],
        });
    }
}
