import { apiClient } from "./APIClient.ts";

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

    /** Needs a login; the "Kana lesen" numbers of the logged-in user. */
    static async getKanaStats(): Promise<KanaStats> {
        const apis = await apiClient;
        const response: { body: KanaStats } = await apis.games.getKanaStats.execute({});
        return response.body;
    }

    /** Needs a login; returns the numbers including this round. */
    static async recordKanaResult(result: KanaResult): Promise<KanaStats> {
        const apis = await apiClient;
        const response: { body: KanaStats } = await apis.games.recordKanaResult.execute({}, { requestBody: result });
        return response.body;
    }

    /** Needs a login; the "Kana lesen" mistakes of the logged-in user, most often wrong first. */
    static async getKanaMistakes(): Promise<KanaMistake[]> {
        const apis = await apiClient;
        const response: { body: KanaMistake[] } = await apis.games.getKanaMistakes.execute({});
        return response.body;
    }

    /** Needs a login; takes a character off the list of mistakes and returns the rest. */
    static async deleteKanaMistake(kana: string): Promise<KanaMistake[]> {
        const apis = await apiClient;
        const response: { body: KanaMistake[] } = await apis.games.deleteKanaMistake.execute({ kana });
        return response.body;
    }

    /** Needs a login; the "Vokabeln" numbers of the logged-in user. */
    static async getVocabStats(): Promise<VocabStats> {
        const apis = await apiClient;
        const response: { body: VocabStats } = await apis.games.getVocabStats.execute({});
        return response.body;
    }

    /** Needs a login; the words the user has had at the level, with their boxes. */
    static async getVocabCards(level: string): Promise<VocabCard[]> {
        const apis = await apiClient;
        const response: { body: VocabCard[] } = await apis.games.getVocabCards.execute({ level });
        return response.body;
    }

    /** Needs a login; moves the words of the round to their new boxes and returns the numbers including it. */
    static async recordVocabResult(result: VocabResult): Promise<VocabStats> {
        const apis = await apiClient;
        const response: { body: VocabStats } = await apis.games.recordVocabResult.execute({}, { requestBody: result });
        return response.body;
    }

    /** Needs a login; the "Vokabeln" mistakes of the logged-in user, most often wrong first. */
    static async getVocabMistakes(): Promise<VocabMistake[]> {
        const apis = await apiClient;
        const response: { body: VocabMistake[] } = await apis.games.getVocabMistakes.execute({});
        return response.body;
    }

    /** Needs a login; takes a word off the list of mistakes and returns the rest. */
    static async deleteVocabMistake(word: string): Promise<VocabMistake[]> {
        const apis = await apiClient;
        const response: { body: VocabMistake[] } = await apis.games.deleteVocabMistake.execute({ word });
        return response.body;
    }
}
