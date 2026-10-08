import { apiClient } from "./APIClient.ts";
import { FeedbackDTO, FeedbackRequest } from "../types/feedback.ts";

export default class FeedbackController {

    /** Needs a login. */
    static async submit(req: FeedbackRequest): Promise<FeedbackDTO> {
        const apis = await apiClient;
        const response: { body: FeedbackDTO } = await apis.feedback.submitFeedback.execute({}, { requestBody: req });
        return response.body;
    }

    /** The open ones first, the newest first within both groups. */
    static async list(): Promise<FeedbackDTO[]> {
        const apis = await apiClient;
        const response: { body: FeedbackDTO[] } = await apis.feedback.listFeedback.execute({});
        return response.body ?? [];
    }

    static async setDone(id: number, done: boolean): Promise<FeedbackDTO> {
        const apis = await apiClient;
        const response: { body: FeedbackDTO } = await apis.feedback.setFeedbackDone.execute({ id, done });
        return response.body;
    }

    static async delete(id: number): Promise<void> {
        const apis = await apiClient;
        await apis.feedback.deleteFeedback.execute({ id });
    }
}
