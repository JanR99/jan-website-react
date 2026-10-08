import { RestoreResult } from "../types/backup";

/** The name of a downloaded backup with the day it was made, like "jan-website-backup-2026-10-07.zip". */
export function backupFileName(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `jan-website-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.zip`;
}

/** The size of a file the way it is shown: "850 KB" or "23,4 MB". */
export function fileSizeLabel(bytes: number): string {
    const megabytes = bytes / (1024 * 1024);
    if (megabytes < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${megabytes.toFixed(1).replace(".", ",")} MB`;
}

/** What was restored from a backup, like "104 Rezepte, 6 Reisen und 213 Fotos eingespielt." */
export function restoreSummary(result: RestoreResult): string {
    const recipes = result.recipes === 1 ? "1 Rezept" : `${result.recipes} Rezepte`;
    const folders = result.folders === 1 ? "1 Reise" : `${result.folders} Reisen`;
    const photos = result.photos === 1 ? "1 Foto" : `${result.photos} Fotos`;
    return `${recipes}, ${folders} und ${photos} eingespielt.`;
}

/** What a backup had in it but could not be restored, one line per kind; empty if everything was. */
export function restoreProblems(result: RestoreResult): string[] {
    const problems: string[] = [];
    if (result.skippedRecipes.length > 0) {
        problems.push(`Nicht eingespielte Rezepte: ${result.skippedRecipes.join(", ")}`);
    }
    if (result.skippedFolders.length > 0) {
        problems.push(`Nicht oder nur teilweise eingespielte Reisen: ${result.skippedFolders.join(", ")}`);
    }
    if (result.skippedPhotos > 0) {
        problems.push(result.skippedPhotos === 1 ? "1 Foto nicht eingespielt" : `${result.skippedPhotos} Fotos nicht eingespielt`);
    }
    return problems;
}
