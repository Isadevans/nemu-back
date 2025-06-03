import {logger} from "../config/logger";
import {PrismaClient} from '../../generated/prisma';

const prisma = new PrismaClient();

export async function getJourneysGroupedBySessionId() {
    try {
        return await prisma.sessionHistories.groupBy({
            by: ['sessionId', 'createdAt'],
            orderBy: {
                createdAt: 'asc'
            }
        })
    } catch (error) {
        logger.error("Error fetching journeys:", error);
        throw new Error("Could not retrieve journeys");
    }
}
