package de.jan.objectify;

import com.googlecode.objectify.cmd.LoadType;

import java.util.List;
import java.util.Map;

import static com.googlecode.objectify.ObjectifyService.ofy;

public class BaseDAO<T extends DatastoreEntity> {

    private final Class<T> clazz;

    public BaseDAO(Class<T> clazz) {
        this.clazz = clazz;
    }

    public T save(T entity) {
        ofy().save().entity(entity).now();
        return entity;
    }

    public List<T> findByFiler(Map<String, Object> filterMap) {
        LoadType<T> loadType = ofy().load().type(clazz);
        filterMap.forEach(loadType::filter);
        return loadType.list();
    }
}
