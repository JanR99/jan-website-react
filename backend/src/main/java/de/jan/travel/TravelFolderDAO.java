package de.jan.travel;

import de.jan.objectify.BaseDAO;

public class TravelFolderDAO extends BaseDAO<TravelFolder, Long> {

    public TravelFolderDAO() {
        super(TravelFolder.class);
    }
}
