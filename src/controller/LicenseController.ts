import { apiClient } from "./APIClient.ts";

export default class LicenseController {

    /** The open source libraries of the backend with their licenses; empty when the backend wasn't built with Maven. */
    static async listBackendLicenses(): Promise<LicenseResponse[]> {
        const apis = await apiClient;
        const response: { body: LicenseResponse[] } = await apis.licenses.listBackendLicenses.execute({});
        return response.body ?? [];
    }
}
