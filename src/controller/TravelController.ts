import { apiClient, apiUrl } from "./APIClient.ts";
import { TravelFolder, TravelFolderRequest } from "../types/Travel.ts";

export default class TravelController {

    static async listFolders(): Promise<TravelFolder[]> {
        const apis = await apiClient;
        const response: { body: TravelFolder[] } = await apis.travel.listTravelFolders.execute({});
        return response.body ?? [];
    }

    static async createFolder(req: TravelFolderRequest): Promise<TravelFolder> {
        const apis = await apiClient;
        const response: { body: TravelFolder } = await apis.travel.createTravelFolder.execute({}, { requestBody: req });
        return response.body;
    }

    static async updateFolder(id: number, req: TravelFolderRequest): Promise<TravelFolder> {
        const apis = await apiClient;
        const response: { body: TravelFolder } = await apis.travel.updateTravelFolder.execute({ id }, { requestBody: req });
        return response.body;
    }

    static async setCover(id: number, photoId: number): Promise<TravelFolder> {
        const apis = await apiClient;
        const response: { body: TravelFolder } = await apis.travel.setTravelFolderCover.execute({ id, photoId });
        return response.body;
    }

    static async deleteFolder(id: number): Promise<void> {
        const apis = await apiClient;
        await apis.travel.deleteTravelFolder.execute({ id });
    }

    /** The file comes from resizeTravelPhoto; returns the folder with the new photo. */
    static async uploadPhoto(folderId: number, file: File): Promise<TravelFolder> {
        const apis = await apiClient;
        const response: { body: TravelFolder } = await apis.travel.uploadTravelPhoto.execute(
            { folderId },
            { requestBody: { file } }
        );
        return response.body;
    }

    static async deletePhoto(id: number): Promise<void> {
        const apis = await apiClient;
        await apis.travel.deleteTravelPhoto.execute({ id });
    }

    /** There is one version of every photo, used for the gallery and the large view. */
    static photoUrl(photoId: number): string {
        return apiUrl(`/api/travel/photos/${photoId}`);
    }
}
