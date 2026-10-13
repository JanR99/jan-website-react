import { apiClient } from "./APIClient.ts";
import { CrosswordResult, CrosswordStats, KanjiResult, KanjiStats } from "../types/games.ts";

export default class GamesController {

    /** Needs a login; the numbers of the logged-in user. */
    static async getCrosswordStats(): Promise<CrosswordStats> {
        const apis = await apiClient;
        const response: { body: CrosswordStats } = await apis.games.getCrosswordStats.execute({});
        return response.body;
    }

    /** Needs a login; returns the numbers including this crossword. */
    static async recordCrosswordResult(result: CrosswordResult): Promise<CrosswordStats> {
        const apis = await apiClient;
        const response: { body: CrosswordStats } = await apis.games.recordCrosswordResult.execute({}, { requestBody: result });
        return response.body;
    }

    /** Needs a login; the "Kanji lesen" numbers of the logged-in user. */
    static async getKanjiStats(): Promise<KanjiStats> {
        const apis = await apiClient;
        const response: { body: KanjiStats } = await apis.games.getKanjiStats.execute({});
        return response.body;
    }

    /** Needs a login; returns the numbers including this round. */
    static async recordKanjiResult(result: KanjiResult): Promise<KanjiStats> {
        const apis = await apiClient;
        const response: { body: KanjiStats } = await apis.games.recordKanjiResult.execute({}, { requestBody: result });
        return response.body;
    }
}
