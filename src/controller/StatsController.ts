import { apiClient } from "./APIClient.ts";

export default class StatsController {

    /** Counts a page that was opened; with newVisit also the visit it starts. No login needed. */
    static async recordVisit(req: VisitRequest): Promise<void> {
        const apis = await apiClient;
        await apis.stats.recordVisit.execute({}, { requestBody: req });
    }

    /** Needs VIEW_STATS: the visits of the last 30 days and the most opened pages. */
    static async getStats(): Promise<StatsResponse> {
        const apis = await apiClient;
        const response: { body: StatsResponse } = await apis.stats.getStats.execute({});
        return response.body;
    }
}
