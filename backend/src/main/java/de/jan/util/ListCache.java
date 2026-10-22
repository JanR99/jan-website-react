package de.jan.util;

import java.time.Duration;
import java.util.List;
import java.util.function.Supplier;

/**
 * Keeps a list that is read on every page load for a short time, to save Datastore reads.
 * Writes on this instance clear it right away; other Cloud Run instances catch up after the TTL.
 */
public final class ListCache<T> {

    private final Duration ttl;
    private volatile List<T> value;
    private volatile long loadedAt;

    public ListCache(Duration ttl) {
        this.ttl = ttl;
    }

    /** The cached list, or a freshly loaded one if there is none or it is older than the TTL. */
    public List<T> get(Supplier<List<T>> loader) {
        List<T> current = value;
        if (current != null && System.currentTimeMillis() - loadedAt < ttl.toMillis()) {
            return current;
        }
        List<T> loaded = loader.get();
        value = loaded;
        loadedAt = System.currentTimeMillis();
        return loaded;
    }

    public void invalidate() {
        value = null;
    }
}
