import { useSyncExternalStore } from "react";
import { quickApi, type Apis } from "../controller/APIClient";

let apis: Apis | null = null;
let loading = false;
const listeners = new Set<() => void>();

function load() {
    if (apis || loading) return;
    loading = true;
    Promise.resolve(quickApi)
        .then((loaded) => {
            apis = loaded;
            listeners.forEach((listener) => listener());
        })
        // without an API description the next component that needs it tries again
        .catch(() => undefined)
        .finally(() => {
            loading = false;
        });
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    load();
    return () => {
        listeners.delete(listener);
    };
}

/**
 * The operations of the API, for URLs that are needed while rendering (pictures, links); null until they are known.
 * Loaded once for the whole page, from the stored API description if there is one, see quickApi.
 */
export function useApi(): Apis | null {
    return useSyncExternalStore(subscribe, () => apis);
}
