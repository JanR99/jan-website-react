package de.jan.recipe;

import de.jan.objectify.BaseDAO;

import java.util.Date;

public class RecipeSeedMarkerDAO extends BaseDAO<RecipeSeedMarker, String> {

    public RecipeSeedMarkerDAO() {
        super(RecipeSeedMarker.class);
    }

    public boolean isCompleted() {
        return exists(RecipeSeedMarker.ID);
    }

    public void markCompleted() {
        save(new RecipeSeedMarker(new Date()));
    }
}
