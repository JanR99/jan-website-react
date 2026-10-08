import { apiClient, apiUrl } from "./APIClient.ts";
import { TravelFolder, TravelFolderRequest } from "../types/Travel.ts";

type OptionalField = "photos" | "startMonth" | "endMonth" | "text" | "cuisine" | "stops" | "previousFolderId";

/**
 * A folder as the service worker may still have it stored from an older version: without captions,
 * date, text, cuisine and stops, but with one place of its own.
 */
type StoredTravelFolder = Omit<TravelFolder, OptionalField>
    & Partial<Pick<TravelFolder, OptionalField>>
    & { photoIds?: number[]; latitude?: number | null; longitude?: number | null };

/** Without this, such a stored list would break the pages while offline; online the list is always the new one. */
function fromStored({ photoIds, photos, latitude, longitude, ...folder }: StoredTravelFolder): TravelFolder {
    const oldPlace = typeof latitude === "number" && typeof longitude === "number"
        ? [{ name: folder.name, latitude, longitude }]
        : [];
    return {
        ...folder,
        stops: folder.stops ?? oldPlace,
        previousFolderId: folder.previousFolderId ?? null,
        startMonth: folder.startMonth ?? null,
        endMonth: folder.endMonth ?? null,
        text: folder.text ?? "",
        cuisine: folder.cuisine ?? "",
        photos: photos ?? (photoIds ?? []).map((id) => ({ id, caption: "" })),
    };
}

export default class TravelController {

    static async listFolders(): Promise<TravelFolder[]> {
        const apis = await apiClient;
        const response: { body: StoredTravelFolder[] } = await apis.travel.listTravelFolders.execute({});
        return (response.body ?? []).map(fromStored);
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

    /** An empty text removes it. */
    static async setText(id: number, text: string): Promise<TravelFolder> {
        const apis = await apiClient;
        const response: { body: TravelFolder } = await apis.travel.setTravelFolderText.execute({ id }, { requestBody: { text } });
        return response.body;
    }

    static async setCover(id: number, photoId: number): Promise<TravelFolder> {
        const apis = await apiClient;
        const response: { body: TravelFolder } = await apis.travel.setTravelFolderCover.execute({ id, photoId });
        return response.body;
    }

    /** Puts the photos of a folder into a new order; photoIds are all of them, each one once. */
    static async setPhotoOrder(id: number, photoIds: number[]): Promise<TravelFolder> {
        const apis = await apiClient;
        const response: { body: TravelFolder } = await apis.travel.setTravelPhotoOrder.execute(
            { id },
            { requestBody: { photoIds } }
        );
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

    /** An empty caption removes it; returns the folder with the changed photo. */
    static async setCaption(photoId: number, caption: string): Promise<TravelFolder> {
        const apis = await apiClient;
        const response: { body: TravelFolder } = await apis.travel.setTravelPhotoCaption.execute(
            { id: photoId },
            { requestBody: { caption } }
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
