package de.jan.recipe;

import de.jan.objectify.BaseDAO;

public class RecipeSeedMarkerDAO extends BaseDAO<RecipeSeedMarker, String> {

    public RecipeSeedMarkerDAO() {
        super(RecipeSeedMarker.class);
    }
}
