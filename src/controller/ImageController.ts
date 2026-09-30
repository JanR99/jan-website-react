import { apiClient, apiUrl } from "./APIClient.ts";
import { ImageUploadResponse } from "../types/Recipe.ts";

const UPLOAD_PREFIX = "uploads/";

export default class ImageController {

    static async uploadImage(file: File): Promise<ImageUploadResponse> {
        const apis = await apiClient;
        const response: { body: ImageUploadResponse } = await apis.images.uploadImage.execute({}, { requestBody: { file } });
        return response.body;
    }

    static getImageUrl(image: string): string | null {
        return image.startsWith(UPLOAD_PREFIX)
            ? apiUrl(`/api/images/${encodeURIComponent(image.slice(UPLOAD_PREFIX.length))}`)
            : null;
    }
}
