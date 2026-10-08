package de.jan.objectify;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.cmd.Query;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static com.googlecode.objectify.ObjectifyService.ofy;

/**
 * The only place that talks to Objectify; DAOs use these methods and Filter instead of ofy().
 *
 * @param <T>  entity type
 * @param <ID> type of its @Id field, Long or String
 */
public class BaseDAO<T extends DatastoreEntity, ID> {

    private final Class<T> clazz;

    public BaseDAO(Class<T> clazz) {
        this.clazz = clazz;
    }

    private Key<T> key(ID id) {
        if (id instanceof Long longId) {
            return ObjectifyService.key(clazz, longId);
        }
        if (id instanceof String stringId) {
            return ObjectifyService.key(clazz, stringId);
        }
        throw new IllegalArgumentException("Unsupported id type: " + (id == null ? "null" : id.getClass()));
    }

    public T save(T entity) {
        ofy().save().entity(entity).now();
        return entity;
    }

    public void saveAll(List<T> entities) {
        ofy().save().entities(entities).now();
    }

    public T getById(ID id) {
        return id == null ? null : ofy().load().key(key(id)).now();
    }

    public boolean exists(ID id) {
        if (id == null) {
            return false;
        }
        return ofy().load().type(clazz).filterKey(key(id)).keys().first().now() != null;
    }

    public List<T> getByIds(Collection<ID> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return new ArrayList<>(ofy().load().type(clazz).ids(ids).values());
    }

    public List<T> getAll() {
        return ofy().load().type(clazz).list();
    }

    public void delete(ID id) {
        ofy().delete().key(key(id)).now();
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

    public List<T> find(Filter... filters) {
        return query(filters).list();
    }

    public List<Key<T>> findKeys(Filter... filters) {
        return query(filters).keys().list();
    }

    /**
     * Forgets the entities loaded so far. Objectify keeps every loaded entity until the end of the
     * request, which is too much memory when many images are read one after the other.
     */
    public static void clearSession() {
        ofy().clear();
    }

    private Query<T> query(Filter... filters) {
        Query<T> query = ofy().load().type(clazz);
        for (Filter filter : filters) {
            query = query.filter(filter.condition(), filter.value());
        }
        return query;
    }
}
