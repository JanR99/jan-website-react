import { useSyncExternalStore } from "react";

function subscribe(listener: () => void) {
    window.addEventListener("online", listener);
    window.addEventListener("offline", listener);
    return () => {
        window.removeEventListener("online", listener);
        window.removeEventListener("offline", listener);
    };
}

/** Whether the browser has a network connection, for things that can't be stored for offline use (map tiles). */
export function useOnline(): boolean {
    return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
