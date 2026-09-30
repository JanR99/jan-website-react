package de.jan.image;

import com.googlecode.objectify.Key;
import de.jan.objectify.BaseDAO;
import de.jan.objectify.Filter;

import java.util.Date;
import java.util.List;

public class RecipeImageDAO extends BaseDAO<RecipeImage, Long> {

    public RecipeImageDAO() {
        super(RecipeImage.class);
    }

    public List<Key<RecipeImage>> getKeysCreatedBefore(Date date) {
        return findKeys(Filter.lt("createdAt", date));
    }
}
