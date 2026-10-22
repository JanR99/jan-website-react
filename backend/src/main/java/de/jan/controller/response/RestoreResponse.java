package de.jan.controller.response;

import java.util.List;

/**
 * What restoring a backup put into the database, and what it had to leave out.
 *
 * @param recipes        number of restored recipes
 * @param folders        number of restored travel folders
 * @param photos         number of restored travel photos
 * @param skippedRecipes titles of the recipes that could not be restored, e.g. because their image is missing in the backup
 * @param skippedFolders names of the travel folders that could not be restored, or only in part
 * @param skippedPhotos  number of travel photos that could not be restored
 */
public record RestoreResponse(int recipes, int folders, int photos, List<String> skippedRecipes,
                              List<String> skippedFolders, int skippedPhotos) {
}
