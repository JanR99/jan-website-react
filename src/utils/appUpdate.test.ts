import { describe, expect, it } from "vitest";
import { watchForAppUpdate } from "./appUpdate";

/** Stands in for navigator.serviceWorker; `takeOver` is a new worker taking control of the page. */
function workers(controller: ServiceWorker | null) {
    const target = new EventTarget();
    return {
        controller,
        addEventListener: target.addEventListener.bind(target),
        takeOver: () => target.dispatchEvent(new Event("controllerchange")),
    };
}

const oldWorker = {} as ServiceWorker;

describe("watchForAppUpdate", () => {
    it("reports nothing as long as no new version takes over", () => {
        const updateArrived = watchForAppUpdate(workers(oldWorker));

        expect(updateArrived()).toBe(false);
    });

    it("reports an update when a new version replaces the running one", () => {
        const container = workers(oldWorker);
        const updateArrived = watchForAppUpdate(container);

        container.takeOver();

        expect(updateArrived()).toBe(true);
    });

    it("does not count the first visit, where the worker takes over a page that had none", () => {
        const container = workers(null);
        const updateArrived = watchForAppUpdate(container);

        container.takeOver();

        expect(updateArrived()).toBe(false);
    });

    it("reports an update that arrives after the first visit's worker took over", () => {
        const container = workers(null);
        const updateArrived = watchForAppUpdate(container);

        container.takeOver();
        container.takeOver();

        expect(updateArrived()).toBe(true);
    });

    it("reports nothing in a browser without service workers", () => {
        const updateArrived = watchForAppUpdate(undefined);

        expect(updateArrived()).toBe(false);
    });
});
