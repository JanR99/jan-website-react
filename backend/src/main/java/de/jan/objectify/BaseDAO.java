package de.jan.objectify;

import com.googlecode.objectify.Key;
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

    public void saveAll(List<T> entities) {
        ofy().save().entities(entities).now();
    }

    public T getById(Long id) {
        return ofy().load().type(clazz).id(id).now();
    }

    public boolean exists(Long id) {
        if (id == null) {
            return false;
        }
        return ofy().load().type(clazz).filterKey(Key.create(clazz, id)).keys().first().now() != null;
    }

    public List<T> getAll() {
        return ofy().load().type(clazz).list();
    }

    public void delete(Long id) {
        ofy().delete().type(clazz).id(id).now();
    }

    public void delete(T entity) {
        ofy().delete().entity(entity).now();
    }

    public void deleteAll(List<T> entities) {
        ofy().delete().entities(entities).now();
    }

    public void deleteKeys(List<Key<T>> keys) {
        ofy().delete().keys(keys).now();
    }

    public List<T> findByFilter(Map<String, Object> filterMap) {
        Query<T> query = ofy().load().type(clazz);
        for (Map.Entry<String, Object> entry : filterMap.entrySet()) {
            query = query.filter(entry.getKey(), entry.getValue());
        }
        return query.list();
    }

    public int count() {
        return ofy().load().type(clazz).count();
    }
}
