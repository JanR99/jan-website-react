import { apiClient } from "./APIClient.ts";

export default class StatsController {

    /** Counts a page that was opened; with newVisit also the visit it starts. No login needed. */
    static async recordVisit(req: VisitRequest): Promise<void> {
        const apis = await apiClient;
        await apis.stats.recordVisit.execute({}, { requestBody: req });
    }
}
