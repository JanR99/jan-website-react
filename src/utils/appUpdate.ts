/** The part of navigator.serviceWorker that is needed here. */
type WorkerContainer = Pick<ServiceWorkerContainer, "controller" | "addEventListener">;

/**
 * After a release the service worker swaps the app's files while an open page still runs the old
 * version. Files the old version only loads later (the map) are gone by then. So the page notes
 * when a new version has taken over, and Layout loads it fresh on the next page change.
 *
 * @returns a function telling whether a new version has taken over since the page was opened
 */
export function watchForAppUpdate(workers: WorkerContainer | undefined): () => boolean {
    let updateArrived = false;
    if (workers) {
        // on the very first visit the worker takes over as well, but there is no older version behind it
        let hadWorker = workers.controller !== null;
        workers.addEventListener("controllerchange", () => {
            if (hadWorker) updateArrived = true;
            hadWorker = true;
        });
    }
    return () => updateArrived;
}

export const appUpdateArrived = watchForAppUpdate(
    "serviceWorker" in navigator ? navigator.serviceWorker : undefined,
);
