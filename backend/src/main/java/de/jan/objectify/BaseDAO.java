package de.jan.objectify;

import com.googlecode.objectify.cmd.Query;

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

    public List<T> findByFilter(Map<String, Object> filterMap) {
        Query<T> query = ofy().load().type(clazz);
        for (Map.Entry<String, Object> entry : filterMap.entrySet()) {
            query = query.filter(entry.getKey(), entry.getValue());
        }
        return query.list();
    }
}
