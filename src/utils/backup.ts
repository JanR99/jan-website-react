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
