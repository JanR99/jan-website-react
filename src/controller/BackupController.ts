import { apiClient, apiUrl } from "./APIClient.ts";

export default class BackupController {

    /**
     * The backup of the recipes and the travel diary as a ZIP file.
     * Loaded with fetch and not through the API client, because the answer is a file and not JSON.
     */
    static async exportBackup(): Promise<Blob> {
        const token = apiClient.getToken();
        const response = await fetch(apiUrl("/api/backup/export"), {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
            // the same shape as the errors of the API client, so handleApiError finds the message
            const text = await response.text();
            throw Object.assign(new Error(`Backup export failed with status ${response.status}`), {
                status: response.status,
                response: { status: response.status, text },
            });
        }
        return response.blob();
    }
}
