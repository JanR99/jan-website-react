package de.jan.travel;

import de.jan.objectify.BaseDAO;

public class TravelPhotoPreviewDAO extends BaseDAO<TravelPhotoPreview, Long> {

    public TravelPhotoPreviewDAO() {
        super(TravelPhotoPreview.class);
    }
}
