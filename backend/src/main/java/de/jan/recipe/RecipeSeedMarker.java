package de.jan.recipe;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.Date;

/**
 * Stored once all recipes of resources/recipes/recipes.json have been imported, so the import
 * never runs again and recipes deleted later don't come back.
 */
@Entity
public class RecipeSeedMarker implements DatastoreEntity {

    public static final String ID = "recipes";

    @Id
    private String id;

    private Date completedAt;

    public RecipeSeedMarker() {

    }

    public RecipeSeedMarker(Date completedAt) {
        this.id = ID;
        this.completedAt = completedAt;
    }

    public String getId() { return id; }
    public Date getCompletedAt() { return completedAt; }
}
