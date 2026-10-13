import { apiClient } from "./APIClient.ts";
import { CrosswordResult, CrosswordStats, KanjiMistake, KanjiResult, KanjiStats } from "../types/games.ts";

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

    /** Needs a login; the "Kanji lesen" mistakes of the logged-in user, most often wrong first. */
    static async getKanjiMistakes(): Promise<KanjiMistake[]> {
        const apis = await apiClient;
        const response: { body: KanjiMistake[] } = await apis.games.getKanjiMistakes.execute({});
        return response.body;
    }

    /** Needs a login; takes a word off the list of mistakes and returns the rest. */
    static async deleteKanjiMistake(word: string): Promise<KanjiMistake[]> {
        const apis = await apiClient;
        const response: { body: KanjiMistake[] } = await apis.games.deleteKanjiMistake.execute({ word });
        return response.body;
    }
}
