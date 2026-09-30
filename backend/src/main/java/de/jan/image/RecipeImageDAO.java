package de.jan.image;

import com.googlecode.objectify.Key;
import de.jan.objectify.BaseDAO;

import java.util.Date;
import java.util.List;

import static com.googlecode.objectify.ObjectifyService.ofy;

public class RecipeImageDAO extends BaseDAO<RecipeImage> {

    public RecipeImageDAO() {
        super(RecipeImage.class);
    }

    /** Keys only, so the image data is not loaded. */
    public List<Key<RecipeImage>> getKeysCreatedBefore(Date date) {
        return ofy().load().type(RecipeImage.class).filter("createdAt <", date).keys().list();
    }
}
