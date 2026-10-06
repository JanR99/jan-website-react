package de.jan.travel;

import de.jan.objectify.BaseDAO;

public class TravelPhotoFileDAO extends BaseDAO<TravelPhotoFile, Long> {

    public TravelPhotoFileDAO() {
        super(TravelPhotoFile.class);
    }
}
