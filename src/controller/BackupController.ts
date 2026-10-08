import { apiClient, apiUrl } from "./APIClient.ts";
import { RestoreResult } from "../types/backup.ts";

/** The same shape as the errors of the API client, so handleApiError finds the message. */
async function apiError(response: Response, what: string): Promise<Error> {
    const text = await response.text();
    return Object.assign(new Error(`${what} failed with status ${response.status}`), {
        status: response.status,
        response: { status: response.status, text },
    });
}

function authorization(): Record<string, string> {
    const token = apiClient.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default class BackupController {

    /**
     * The backup of the recipes and the travel diary as a ZIP file.
     * Loaded with fetch and not through the API client, because the answer is a file and not JSON.
     */
    static async exportBackup(): Promise<Blob> {
        const response = await fetch(apiUrl("/api/backup/export"), { headers: authorization() });
        if (!response.ok) {
            throw await apiError(response, "Backup export");
        }
        return response.blob();
    }

    /**
     * Replaces all recipes and travel folders by the ones of a backup file. The backend only does that
     * on a local machine. Sent with fetch and not through the API client, because the request is a file.
     */
    static async restoreBackup(file: Blob): Promise<RestoreResult> {
        const response = await fetch(apiUrl("/api/backup/restore"), {
            method: "POST",
            headers: { ...authorization(), "Content-Type": "application/zip" },
            body: file,
        });
        if (!response.ok) {
            throw await apiError(response, "Backup restore");
        }
        return response.json();
    }
}
