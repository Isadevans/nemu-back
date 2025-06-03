import request from 'supertest';
import express, {Express} from 'express';
import {PrismaClient, SessionHistories} from '../../generated/prisma';
import {registerJourneyRoutes} from "../routes/journey.routes";

const mockPrisma = {
    sessionHistories: {
        findMany: jest.fn() as jest.Mock,
        groupBy: jest.fn() as jest.Mock,
    },
} as unknown as PrismaClient;

let app: Express;

const allMockHistories: SessionHistories[] = [
    {
        id: 1,
        sessionId: 'sessionB',
        utm_source: 'facebook',
        utm_medium: 'cpc_RT_COMPRA_ADVANTAGE_ESCALA-MONSTRA_21-03-2025 Conjunto de anúncios|6695487561266',
        utm_campaign: 'RT_COMPRA_ADVANTAGE_ESCALA-MONSTRA_21-03-2025|6695487561466',
        utm_content: '01-08_AD1-AllProducts_Catalogo_Cop_Cop_Cop|6695489813866',
        createdAt: new Date('2023-01-01T11:00:00Z')
    },
    {
        id: 2,
        sessionId: 'sessionB',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'summer_sale',
        utm_content: 'ad_group_1',
        createdAt: new Date('2023-01-01T11:05:00Z')
    },
    {
        id: 3,
        sessionId: 'sessionA',
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'new_collection',
        utm_content: 'story_ad_1',
        createdAt: new Date('2023-01-01T10:00:00Z')
    },
    {
        id: 4,
        sessionId: 'sessionA',
        utm_source: 'tiktok',
        utm_medium: 'video',
        utm_campaign: 'brand_awareness',
        utm_content: 'video_ad_short',
        createdAt: new Date('2023-01-01T10:05:00Z')
    },
    {
        id: 5,
        sessionId: 'sessionA',
        utm_source: 'direct',
        utm_medium: '(none)',
        utm_campaign: '(direct)',
        utm_content: '(none)',
        createdAt: new Date('2023-01-01T10:02:00Z')
    },
    {
        id: 6,
        sessionId: 'sessionC',
        utm_source: 'email',
        utm_medium: 'newsletter',
        utm_campaign: 'weekly_promo',
        utm_content: 'cta_button_1',
        createdAt: new Date('2023-01-01T09:00:00Z')
    },
];

const applyPrismaLogicToTestData = (
    data: SessionHistories[],
    options?: { skip?: number; take?: number; orderBy?: Array<{ [key: string]: 'asc' | 'desc' }> }
): SessionHistories[] => {
    let result = [...data];

    if (options?.orderBy) {
        result.sort((a, b) => {
            for (const orderRule of options.orderBy!) {
                const key = Object.keys(orderRule)[0] as keyof SessionHistories;
                const direction = orderRule[key];
                const valA = a[key];
                const valB = b[key];

                let comparison = 0;
                if (valA instanceof Date && valB instanceof Date) {
                    comparison = valA.getTime() - valB.getTime();
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    comparison = valA.localeCompare(valB);
                } else if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                }

                if (comparison !== 0) {
                    return direction === 'asc' ? comparison : -comparison;
                }
            }
            return 0;
        });
    }

    const skip = options?.skip ?? 0;
    const take = options?.take;

    if (take === undefined) {
        return result.slice(skip);
    }
    return result.slice(skip, skip + take);
};

const getMockUniqueSessionsForGroupBy = (data: SessionHistories[]) => {
    const uniqueSessionIds = new Set(data.map(h => h.sessionId));
    return Array.from(uniqueSessionIds).map(sid => ({
        sessionId: sid,
        _count: {sessionId: data.filter(h => h.sessionId === sid).length}
    }));
};

describe('/journeys API Endpoint', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        registerJourneyRoutes(app, mockPrisma);
        jest.clearAllMocks();
    });

    it('should return journeys with default pagination, correctly ordered by sessionId then createdAt, and ensure sessionId is present', async () => {
        const defaultPage = 1;
        const defaultLimit = 20;

        const expectedDataFromPrismaFindMany = applyPrismaLogicToTestData(allMockHistories, {
            skip: (defaultPage - 1) * defaultLimit,
            take: defaultLimit,
            orderBy: [{sessionId: 'asc'}, {createdAt: 'asc'}]
        });
        (mockPrisma.sessionHistories.findMany as jest.Mock).mockResolvedValue(expectedDataFromPrismaFindMany);

        const uniqueSessionsForGroupBy = getMockUniqueSessionsForGroupBy(allMockHistories);
        (mockPrisma.sessionHistories.groupBy as jest.Mock).mockResolvedValue(uniqueSessionsForGroupBy.map(s => ({
            sessionId: s.sessionId,
            _count: {sessionId: 1}
        })));

        const response = await request(app).get('/journeys');

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.meta).toBeDefined();

        const responseData = response.body.data.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
        }));

        expect(responseData).toEqual(expectedDataFromPrismaFindMany);
        expect(mockPrisma.sessionHistories.findMany).toHaveBeenCalledWith({
            skip: (defaultPage - 1) * defaultLimit,
            take: defaultLimit,
            orderBy: [{sessionId: 'asc'}, {createdAt: 'asc'}],
        });
        expect(mockPrisma.sessionHistories.groupBy).toHaveBeenCalledWith({
            by: ['sessionId'],
        });

        responseData.forEach((item: SessionHistories) => {
            expect(item.sessionId).toBeDefined();
            expect(typeof item.sessionId).toBe('string');
        });

        expect(response.body.meta.currentPage).toBe(defaultPage);
        expect(response.body.meta.pageSize).toBe(defaultLimit);
        expect(response.body.meta.totalItems).toBe(uniqueSessionsForGroupBy.length);
        const expectedTotalPages = Math.ceil(uniqueSessionsForGroupBy.length / defaultLimit);
        expect(response.body.meta.totalPages).toBe(expectedTotalPages);
        expect(response.body.meta.hasNextPage).toBe(defaultPage < expectedTotalPages);
        expect(response.body.meta.hasPrevPage).toBe(defaultPage > 1);
    });

    it('should return journeys with custom pagination (page=2, limit=2) and correct ordering', async () => {
        const page = 2;
        const limit = 2;

        const paginatedData = applyPrismaLogicToTestData(allMockHistories, {
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [{sessionId: 'asc'}, {createdAt: 'asc'}]
        });
        (mockPrisma.sessionHistories.findMany as jest.Mock).mockResolvedValue(paginatedData);

        const uniqueSessionsForGroupBy = getMockUniqueSessionsForGroupBy(allMockHistories);
        (mockPrisma.sessionHistories.groupBy as jest.Mock).mockResolvedValue(uniqueSessionsForGroupBy.map(s => ({
            sessionId: s.sessionId,
            _count: {sessionId: 1}
        })));

        const response = await request(app).get(`/journeys?page=${page}&limit=${limit}`);

        expect(response.status).toBe(200);
        const responseData = response.body.data.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
        }));

        expect(responseData).toEqual(paginatedData);
        expect(mockPrisma.sessionHistories.findMany).toHaveBeenCalledWith({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [{sessionId: 'asc'}, {createdAt: 'asc'}],
        });

        responseData.forEach((item: SessionHistories) => {
            expect(item.sessionId).toBeDefined();
            expect(typeof item.sessionId).toBe('string');
        });

        expect(response.body.meta.currentPage).toBe(page);
        expect(response.body.meta.pageSize).toBe(limit);
        expect(response.body.meta.totalItems).toBe(uniqueSessionsForGroupBy.length);
        const expectedTotalPages = Math.ceil(uniqueSessionsForGroupBy.length / limit);
        expect(response.body.meta.totalPages).toBe(expectedTotalPages);
        expect(response.body.meta.hasNextPage).toBe(page < expectedTotalPages);
        expect(response.body.meta.hasPrevPage).toBe(page > 1);
    });

    it('should return an empty list and correct metadata when no journeys are found', async () => {
        (mockPrisma.sessionHistories.findMany as jest.Mock).mockResolvedValue([]);
        (mockPrisma.sessionHistories.groupBy as jest.Mock).mockResolvedValue([]);

        const response = await request(app).get('/journeys');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
        expect(response.body.meta.currentPage).toBe(1);
        expect(response.body.meta.pageSize).toBe(20);
        expect(response.body.meta.totalItems).toBe(0);
        expect(response.body.meta.totalPages).toBe(0);
        expect(response.body.meta.hasNextPage).toBe(false);
        expect(response.body.meta.hasPrevPage).toBe(false);
    });

    it('should return 500 if fetching journeys (findMany) fails', async () => {
        (mockPrisma.sessionHistories.findMany as jest.Mock).mockRejectedValue(new Error('Database findMany error'));
        const uniqueSessionsForGroupBy = getMockUniqueSessionsForGroupBy(allMockHistories);
        (mockPrisma.sessionHistories.groupBy as jest.Mock).mockResolvedValue(uniqueSessionsForGroupBy.map(s => ({
            sessionId: s.sessionId,
            _count: {sessionId: 1}
        })));

        const response = await request(app).get('/journeys');

        expect(response.status).toBe(500);
    });

    it('should return 500 if counting journeys (groupBy) fails', async () => {
        const paginatedData = applyPrismaLogicToTestData(allMockHistories, {
            take: 20,
            orderBy: [{sessionId: 'asc'}, {createdAt: 'asc'}]
        });
        (mockPrisma.sessionHistories.findMany as jest.Mock).mockResolvedValue(paginatedData);
        (mockPrisma.sessionHistories.groupBy as jest.Mock).mockRejectedValue(new Error('Database groupBy error'));

        const response = await request(app).get('/journeys');

        expect(response.status).toBe(500);
    });

    it('should return 400 if request parameters is invalid', async () => {
        const expectedValidatedPage = 1;
        const expectedValidatedLimit = 20;

        const expectedData = applyPrismaLogicToTestData(allMockHistories, {
            skip: (expectedValidatedPage - 1) * expectedValidatedLimit,
            take: expectedValidatedLimit,
            orderBy: [{sessionId: 'asc'}, {createdAt: 'asc'}]
        });

        (mockPrisma.sessionHistories.findMany as jest.Mock).mockResolvedValue(expectedData);

        const uniqueSessionsForGroupBy = getMockUniqueSessionsForGroupBy(allMockHistories);
        (mockPrisma.sessionHistories.groupBy as jest.Mock).mockResolvedValue(uniqueSessionsForGroupBy.map(s => ({
            sessionId: s.sessionId,
            _count: {sessionId: 1}
        })));

        const response = await request(app).get('/journeys?page=abc&limit=xyz');

        expect(response.status).toBe(400);
    });
});
