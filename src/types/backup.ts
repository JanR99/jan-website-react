/** What restoring a backup put into the database, and what it had to leave out. */
export interface RestoreResult {
    recipes: number;
    folders: number;
    photos: number;
    /** titles of the recipes that could not be restored, e.g. because their image is missing in the backup */
    skippedRecipes: string[];
    /** names of the travel folders that could not be restored, or only in part */
    skippedFolders: string[];
    skippedPhotos: number;
}
