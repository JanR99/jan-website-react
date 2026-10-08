package de.jan.controller.response;

import java.util.ArrayList;
import java.util.List;

/** What restoring a backup put into the database, and what it had to leave out. */
public class RestoreResponse {

    private int recipes;
    private int folders;
    private int photos;
    private final List<String> skippedRecipes = new ArrayList<>();
    private final List<String> skippedFolders = new ArrayList<>();
    private int skippedPhotos;

    /** number of restored recipes */
    public int getRecipes() { return recipes; }
    public void setRecipes(int recipes) { this.recipes = recipes; }

    /** number of restored travel folders */
    public int getFolders() { return folders; }
    public void setFolders(int folders) { this.folders = folders; }

    /** number of restored travel photos */
    public int getPhotos() { return photos; }
    public void setPhotos(int photos) { this.photos = photos; }

    /** titles of the recipes that could not be restored, e.g. because their image is missing in the backup */
    public List<String> getSkippedRecipes() { return skippedRecipes; }

    /** names of the travel folders that could not be restored, or only in part */
    public List<String> getSkippedFolders() { return skippedFolders; }

    /** number of travel photos that could not be restored */
    public int getSkippedPhotos() { return skippedPhotos; }
    public void setSkippedPhotos(int skippedPhotos) { this.skippedPhotos = skippedPhotos; }
}
