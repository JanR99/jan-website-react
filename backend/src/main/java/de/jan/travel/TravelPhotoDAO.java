package de.jan.travel;

import de.jan.objectify.BaseDAO;
import de.jan.objectify.Filter;

import java.util.List;

public class TravelPhotoDAO extends BaseDAO<TravelPhoto, Long> {

    public TravelPhotoDAO() {
        super(TravelPhoto.class);
    }

    public List<TravelPhoto> getByFolderId(Long folderId) {
        return find(Filter.eq("folderId", folderId));
    }
}
