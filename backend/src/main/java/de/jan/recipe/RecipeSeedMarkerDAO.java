package de.jan.recipe;

import java.util.Date;

import static com.googlecode.objectify.ObjectifyService.ofy;

/** Not a BaseDAO, because the marker has a String id. */
public class RecipeSeedMarkerDAO {

    public boolean isCompleted() {
        return ofy().load().type(RecipeSeedMarker.class).id(RecipeSeedMarker.ID).now() != null;
    }

    public void markCompleted() {
        ofy().save().entity(new RecipeSeedMarker(new Date())).now();
    }
}
