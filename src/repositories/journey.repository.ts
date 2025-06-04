import { PrismaClient, SessionHistories } from "../../generated/prisma";
import { logger } from "../config/logger";
import { ProcessedTouchpoint } from "../controllers/journey.controller";

export interface IJourneyDataAccess {
    getPaginatedUniqueSessionIds(params: { page?: number; limit?: number }): Promise<{ sessionId: string }[]>;
    getSessionTouchpoints(sessionId: string): Promise<ProcessedTouchpoint[]>;
    getTotalSessionCount(): Promise<number>;
}

export class PrismaJourneyDataAccess implements IJourneyDataAccess {
    constructor(private prisma: PrismaClient) {}

    async getPaginatedUniqueSessionIds(params: { page?: number; limit?: number }): Promise<{ sessionId: string }[]> {
        const { page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;

        try {
            const results = await this.prisma.sessionHistories.groupBy({
                by: ['sessionId'],
                orderBy: {
                    sessionId: 'asc',
                },
                skip,
                take: limit,
            });

            return results.map(item => ({ sessionId: item.sessionId }));
        } catch (error) {
            logger.error('Error fetching paginated session IDs:', error);
            throw new Error('Failed to fetch session IDs');
        }
    }

    async getTotalSessionCount(): Promise<number> {
        try {
            const result = await this.prisma.sessionHistories.groupBy({
                by: ['sessionId'],
            });
            return result.length;
        } catch (error) {
            logger.error('Error counting unique sessions:', error);
            throw new Error('Failed to count sessions');
        }
    }

    async getSessionTouchpoints(sessionId: string): Promise<ProcessedTouchpoint[]> {
        try {
            const touchpoints = await this.prisma.sessionHistories.findMany({
                where: { sessionId },
                orderBy: { createdAt: 'asc' }
            });

            if (!touchpoints.length) return [];

            return this.processJourney(touchpoints);
        } catch (error) {
            logger.error(`Error fetching touchpoints for session ${sessionId}:`, error);
            throw new Error('Failed to fetch session touchpoints');
        }
    }
    private normalizeChannelForDeduplication(rawChannel: string): string {
        if (!rawChannel) {
            return "";
        }
        const lowerChannel = rawChannel.toLowerCase();

        if (lowerChannel.startsWith("facebook")) {
            return "facebook";
        }
        return rawChannel;
    }
    public processJourney(touchpoints: SessionHistories[]): ProcessedTouchpoint[] {
        if (!touchpoints|| touchpoints.length === 0) {
            return [];
        }



        if (touchpoints.length <= 2) {
            return touchpoints.map(tp => this.mapToProcessedTouchpoint(tp));
        }

        const firstTouchpoint = touchpoints[0];
        const lastTouchpoint = touchpoints[touchpoints.length - 1];
        const middleTouchpoints = touchpoints.slice(1, touchpoints.length - 1);

        const processedJourney: ProcessedTouchpoint[] = [];

        processedJourney.push(this.mapToProcessedTouchpoint(firstTouchpoint));

        const seenNormalizedMiddleChannels = new Set<string>();

        for (const middleTp of middleTouchpoints) {
            const originalChannel = middleTp.utm_source;
            const normalizedChannelGroup = this.normalizeChannelForDeduplication(originalChannel);

            if (!seenNormalizedMiddleChannels.has(normalizedChannelGroup)) {
                seenNormalizedMiddleChannels.add(normalizedChannelGroup);
                processedJourney.push(this.mapToProcessedTouchpoint(middleTp));
            }
        }

        processedJourney.push(this.mapToProcessedTouchpoint(lastTouchpoint));

        return processedJourney;
    }
    private mapToProcessedTouchpoint(touchpoint: SessionHistories): ProcessedTouchpoint {
        return {
            id: touchpoint.id,
            channel: this.normalizeChannelForDeduplication(touchpoint.utm_source),
            campaign: touchpoint.utm_campaign,
            content: touchpoint.utm_content,
            timestamp: touchpoint.createdAt.toISOString()
        };
    }
}
